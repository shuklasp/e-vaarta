/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const { Services } = ChromeUtils.importESModule(
  "resource://gre/modules/Services.sys.mjs"
);
const { IOUtils } = ChromeUtils.importESModule("resource://gre/modules/IOUtils.sys.mjs");
const { PathUtils } = ChromeUtils.importESModule("resource://gre/modules/PathUtils.sys.mjs");
const { FileUtils } = ChromeUtils.importESModule("resource://gre/modules/FileUtils.sys.mjs");
const {
  createWorkspace, createNote, createExcerpt, createAnnotation, createDocument,
  createSourceAnchor, createLink, addDocument, addItem, addLink, deserializeWorkspace, searchWorkspace, createCollection, addCollection, updateCollection, removeCollection, setDocumentCollections, setCollectionRule, getCollectionDocuments, createEvidenceGroup, addEvidenceGroup, updateEvidenceGroup, removeEvidenceGroup, addItemToEvidenceGroup, removeItemFromEvidenceGroup, getEvidenceGroupItems, evidenceGroupsForItem,
} = ChromeUtils.importESModule(
  "resource:///modules/EvaartaDocumentWorkspace.sys.mjs"
);

const { createIndex, createIndexEntry, upsertIndexEntry, serializeIndex, deserializeIndex, searchIndex, upsertExtractedContent, needsReindex, fingerprintText } = ChromeUtils.importESModule("resource:///modules/EvaartaContentIndex.sys.mjs");
const { extractOfficeText } = ChromeUtils.importESModule("resource:///modules/EvaartaOfficeExtractor.sys.mjs");
const { extractOcrText, isOcrAvailable } = ChromeUtils.importESModule("resource:///modules/EvaartaOcr.sys.mjs");

const PREF = "mail.evaarta.workspace.json";
const INDEX_PREF = "mail.evaarta.contentIndex.json";
const EVAARTA_DATA_DIR = PathUtils.join(PathUtils.profileDir, "evaarta");
const WORKSPACE_FILE = PathUtils.join(EVAARTA_DATA_DIR, "workspace.json");
const VAULT_DIR = PathUtils.join(EVAARTA_DATA_DIR, "vault");
const VAULT_BLOB_DIR = PathUtils.join(VAULT_DIR, "blobs");
const VAULT_MANIFEST_FILE = PathUtils.join(VAULT_DIR, "manifest.json");
let vaultManifest = { version: 1, blobs: {} };
let vaultManifestSavePromise = Promise.resolve();
const INDEX_FILE = PathUtils.join(EVAARTA_DATA_DIR, "content-index.json");
let offlineStorageReady = false;
let workspaceSavePromise = Promise.resolve();
let indexSavePromise = Promise.resolve();

async function ensureOfflineStorage() {
  await IOUtils.makeDirectory(EVAARTA_DATA_DIR, { ignoreExisting: true });
  await IOUtils.makeDirectory(VAULT_DIR, { ignoreExisting: true });
  await IOUtils.makeDirectory(VAULT_BLOB_DIR, { createAncestors: true });
  try {
    vaultManifest = JSON.parse(await IOUtils.readUTF8(VAULT_MANIFEST_FILE));
    if (!vaultManifest || typeof vaultManifest !== "object" || !vaultManifest.blobs) throw new Error("Invalid vault manifest");
  } catch (error) {
    try {
      vaultManifest = JSON.parse(await IOUtils.readUTF8(VAULT_MANIFEST_FILE + ".bak"));
    } catch (backupError) {
      vaultManifest = { version: 1, blobs: {} };
    }
  }
  offlineStorageReady = true;
}


async function readOfflineJson(path) {
  try {
    const value = await IOUtils.readUTF8(path);
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
}

async function writeOfflineJson(path, value) {
  await ensureOfflineStorage();
  const tempPath = path + ".tmp";
  await IOUtils.writeUTF8(tempPath, JSON.stringify(value), { tmpPath: path });
}

async function sha256File(path) {
  const bytes = await IOUtils.read(path);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, "0")).join("");
}

function vaultDocumentsByHash(sha256) {
  if (!sha256) return [];
  return workspace.documents.filter(document => document.vault?.sha256 === sha256);
}

async function vaultHealth(document) {
  if (!document?.vault?.relativePath) return "external";
  try {
    const path = PathUtils.join(EVAARTA_DATA_DIR, document.vault.relativePath);
    const stat = await IOUtils.stat(path);
    if (document.vault.size != null && stat.size !== document.vault.size) return "modified";
    if (document.vault.sha256) {
      const hash = await sha256File(path);
      return hash === document.vault.sha256 ? "healthy" : "modified";
    }
    return "healthy";
  } catch (error) {
    return "missing";
  }
}
async function scanVault() {
  await ensureOfflineStorage();
  const records = workspace.documents.filter(source => source.vault?.relativePath);
  for (const source of records) source.vault.health = await vaultHealth(source);
  const healthy = records.filter(item => item.vault.health === "healthy");
  const missing = records.filter(item => item.vault.health === "missing");
  const modified = records.filter(item => item.vault.health === "modified");
  const bytes = healthy.reduce((sum, item) => sum + Number(item.vault.size || 0), 0);
  const shared = records.filter(item => records.some(other => other !== item && other.vault?.sha256 === item.vault.sha256));
  const orphaned = Object.keys(vaultManifest.blobs).filter(hash =>
    !records.some(item => item.vault?.sha256 === hash)
  );
  return { total: records.length, healthy: healthy.length, missing: missing.length, modified: modified.length, bytes, shared: new Set(shared.map(item => item.vault.sha256)).size, orphaned: orphaned.length };
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
}

async function migrateLegacyVaultRecords() {
  await ensureOfflineStorage();
  let migrated = false;
  for (const document of workspace.documents) {
    if (!document.vault?.sha256 || !document.vault.relativePath) continue;
    if (document.vault.relativePath.startsWith("vault/blobs/")) continue;
    try {
      const sourcePath = PathUtils.join(EVAARTA_DATA_DIR, document.vault.relativePath);
      const hash = document.vault.sha256;
      const blobRelativePath = PathUtils.join("vault", "blobs", hash);
      const blobPath = PathUtils.join(EVAARTA_DATA_DIR, blobRelativePath);
      try {
        await IOUtils.stat(blobPath);
      } catch (error) {
        await IOUtils.copy(sourcePath, blobPath);
      }
      document.vault.relativePath = blobRelativePath;
      document.vault.vaultId = "blob-" + hash.slice(0, 16);
      migrated = true;
    } catch (error) {
      console.warn("e-Vaarta legacy vault migration skipped", error);
    }
  }
  if (migrated) await reconcileVaultManifest();
  return migrated;
}

async function collectVaultMaintenance() {
  await reconcileVaultManifest();
  const referenced = new Set(workspace.documents.map(item => item.vault?.sha256).filter(Boolean));
  const orphaned = Object.entries(vaultManifest.blobs).filter(([hash]) => !referenced.has(hash));
  const missing = [];
  for (const [hash, blob] of Object.entries(vaultManifest.blobs)) {
    try {
      await IOUtils.stat(PathUtils.join(EVAARTA_DATA_DIR, blob.relativePath));
    } catch (error) {
      missing.push(hash);
    }
  }
  return { orphaned, missing };
}

async function garbageCollectVault() {
  const { orphaned } = await collectVaultMaintenance();
  let removed = 0;
  for (const [hash, blob] of orphaned) {
    try {
      await IOUtils.remove(PathUtils.join(EVAARTA_DATA_DIR, blob.relativePath));
      delete vaultManifest.blobs[hash];
      removed += 1;
    } catch (error) {
      console.warn("e-Vaarta vault garbage collection skipped", hash, error);
    }
  }
  if (removed) await saveVaultManifest();
  return removed;
}

async function repairVaultManifest() {
  await reconcileVaultManifest();
  return collectVaultMaintenance();
}

async function openVaultManager() {
  const dialog = document.getElementById("vaultManager");
  if (!dialog) return;
  const stats = await scanVault();
  const maintenance = await collectVaultMaintenance();
  document.getElementById("vaultManagerSummary").textContent =
    stats.total + " local documents • " + stats.healthy + " healthy • " +
    stats.missing + " missing • " + stats.modified + " modified • " +
    stats.shared + " shared blobs • " + maintenance.orphaned.length + " orphaned • " +
    maintenance.missing.length + " missing blobs • " + formatBytes(stats.bytes);
  const list = document.getElementById("vaultManagerList");
  list.replaceChildren();
  for (const source of workspace.documents.filter(item => item.vault)) {
    const row = document.createElement("div");
    row.className = "vault-manager-row";
    const name = document.createElement("strong");
    name.textContent = source.title || source.vault.originalName || "Document";
    const status = document.createElement("span");
    status.textContent = source.vault.health || "unknown";
    status.className = "vault-manager-status vault-manager-" + (source.vault.health || "unknown");
    row.append(name, status);
    list.append(row);
  }
  dialog.showModal();
}


async function recoverVaultDocument(document) {
  if (!document?.vault?.relativePath || !document.vault.originalName) return false;
  const picker = Cc["@mozilla.org/filepicker;1"].createInstance(Ci.nsIFilePicker);
  picker.init(window, "Recover e-Vaarta document", Ci.nsIFilePicker.modeOpen);
  picker.appendFilters(Ci.nsIFilePicker.filterAll);
  const result = await new Promise(resolve => picker.open(resolve));
  if (result !== Ci.nsIFilePicker.returnOK || !picker.file) return false;
  const sourcePath = picker.file.path;
  const recoveredHash = await sha256File(sourcePath);
  if (document.vault.sha256 && recoveredHash !== document.vault.sha256) {
    Services.prompt.alert(window, "e-Vaarta", "The selected file does not match the original vault fingerprint.");
    return false;
  }
  const destination = PathUtils.join(EVAARTA_DATA_DIR, document.vault.relativePath);
  await IOUtils.copy(sourcePath, destination);
  document.vault.size = (await IOUtils.stat(destination)).size;
  document.vault.health = "healthy";
  saveWorkspace();
  render();
  return true;
}

async function removeVaultReference(document) {
  if (!document?.vault?.relativePath) return false;
  const references = workspace.documents.filter(item =>
    item !== document && item.vault?.relativePath === document.vault.relativePath
  );
  const hash = document.vault.sha256;
  if (hash && vaultManifest.blobs[hash]) {
    vaultManifest.blobs[hash].refCount = Math.max(0, Number(vaultManifest.blobs[hash].refCount || 0) - 1);
    if (vaultManifest.blobs[hash].refCount === 0) {
      try { await IOUtils.remove(PathUtils.join(EVAARTA_DATA_DIR, vaultManifest.blobs[hash].relativePath)); } catch (error) {}
      delete vaultManifest.blobs[hash];
      await saveVaultManifest();
    } else {
      await saveVaultManifest();
    }
  } else if (!references.length) {
    try { await IOUtils.remove(PathUtils.join(EVAARTA_DATA_DIR, document.vault.relativePath)); } catch (error) {}
  }
  document.vault = null;
  saveWorkspace();
  render();
  return !references.length;
}


async function saveVaultManifest() {
  vaultManifest.version = 1;
  vaultManifest.updatedAt = new Date().toISOString();
  vaultManifestSavePromise = vaultManifestSavePromise.then(async () => {
    const temp = VAULT_MANIFEST_FILE + ".tmp";
    const backup = VAULT_MANIFEST_FILE + ".bak";
    const payload = JSON.stringify(vaultManifest, null, 2);
    try {
      await IOUtils.writeUTF8(temp, payload);
      try { await IOUtils.remove(backup); } catch (error) {}
      try { await IOUtils.move(VAULT_MANIFEST_FILE, backup, { noOverwrite: true }); } catch (error) {}
      await IOUtils.move(temp, VAULT_MANIFEST_FILE, { noOverwrite: false });
    } catch (error) {
      try { await IOUtils.remove(temp); } catch (ignored) {}
      throw error;
    }
  });
  return vaultManifestSavePromise;
}

async function reconcileVaultManifest() {
  await ensureOfflineStorage();
  const rebuilt = { version: 1, updatedAt: new Date().toISOString(), blobs: {} };
  for (const document of workspace.documents) {
    const hash = document.vault?.sha256;
    const relativePath = document.vault?.relativePath;
    if (!hash || !relativePath) continue;
    let size = Number(document.vault.size || 0);
    try {
      const stat = await IOUtils.stat(PathUtils.join(EVAARTA_DATA_DIR, relativePath));
      size = stat.size;
    } catch (error) {
      // Keep the record so the Offline Storage manager can report it missing.
    }
    const entry = rebuilt.blobs[hash] || {
      relativePath,
      originalName: document.vault.originalName || document.title || "document",
      mimeType: document.vault.mimeType || null,
      size,
      createdAt: document.vault.importedAt || new Date().toISOString(),
      refCount: 0
    };
    entry.refCount += 1;
    rebuilt.blobs[hash] = entry;
  }
  vaultManifest = rebuilt;
  await saveVaultManifest();
  return vaultManifest;
}


async function importIntoLocalVault(sourcePath, originalName, mimeType = null) {
  await ensureOfflineStorage();
  const sourceHash = await sha256File(sourcePath);
  const existing = vaultManifest.blobs[sourceHash];
  const blobRelativePath = PathUtils.join("vault", "blobs", sourceHash);
  const blobPath = PathUtils.join(EVAARTA_DATA_DIR, blobRelativePath);
  if (!existing) {
    await IOUtils.copy(sourcePath, blobPath);
    vaultManifest.blobs[sourceHash] = {
      relativePath: blobRelativePath,
      originalName: originalName || PathUtils.filename(sourcePath) || "document",
      mimeType,
      size: (await IOUtils.stat(blobPath)).size,
      createdAt: new Date().toISOString(),
      refCount: 0
    };
    await saveVaultManifest();
  } else {
    try { await IOUtils.stat(blobPath); }
    catch (error) {
      await IOUtils.copy(sourcePath, blobPath);
      vaultManifest.blobs[sourceHash].size = (await IOUtils.stat(blobPath)).size;
      await saveVaultManifest();
    }
  }
  const entry = vaultManifest.blobs[sourceHash];
  entry.refCount = Number(entry.refCount || 0) + 1;
  await saveVaultManifest();
  return {
    vaultId: "blob-" + sourceHash.slice(0, 16),
    relativePath: entry.relativePath,
    originalName: originalName || entry.originalName,
    size: entry.size,
    mimeType: mimeType || entry.mimeType,
    sha256: sourceHash,
    health: "healthy",
    importedAt: new Date().toISOString()
  };
}

function attachVaultRecord(document, vault) {
  if (!document || !vault) return document;
  document.vault = vault;
  document.sourceRef = Services.io.newFileURI(FileUtils.File(PathUtils.join(EVAARTA_DATA_DIR, vault.relativePath))).spec;
  document.updatedAt = new Date().toISOString();
  return document;
}

function updateOfflineStatus(message, ready = offlineStorageReady) {
  const status = document.getElementById("offlineStatus");
  if (!status) return;
  status.textContent = ready ? message : "Offline storage: preparing…";
  status.dataset.ready = String(ready);
}


let workspace;
let contentIndex;
let selectedDocumentId = null;
let libraryFilter = "";
let libraryCollection = "all";
let selectedCustomCollectionId = null;
let libraryView = "list";
let metadataEditorDocumentId = null;
let selectedItemId = null;
let selectedGroupId = null;
let selectedItemIds = new Set();
let activeEvidenceGroupId = null;
let activeEvidenceIndex = 0;
let linkSourceId = null;
let selectedLinkId = null;
let annotationPanelOpen = false;
let annotationEditorItemId = null;
let restoringSourceAnchor = false;

async function importPendingAttachments(workspace) {
  try {
    const value = Services.prefs.getStringPref("mail.evaarta.pendingAttachments", "");
    if (!value) return workspace;
    const pending = JSON.parse(value);
    Services.prefs.clearUserPref("mail.evaarta.pendingAttachments");
    for (const source of pending) {
      if (!source?.title || !source?.sourceRef) continue;
      const document = createDocument({
        ...source,
        metadata: {
          ...(source.metadata || {}),
          ingestion: source.kind === "email" ? "email-source" : "pending-attachment",
          offlineMaterialization: source.kind === "email" ? "message-backed" : "deferred"
        }
      });
      workspace = addDocument(workspace, document);
    }
  } catch (error) { console.error("e-Vaarta: failed to import pending attachments", error); }
  return workspace;
}

function updateOcrStatus() {
  const status = document.getElementById("ocrStatus");
  if (!status) return;
  status.textContent = isOcrAvailable() ? "OCR: ready" : "OCR: unavailable";
  status.dataset.available = String(isOcrAvailable());
}

const evaartaOcrObserver = {
  observe() {
    updateOcrStatus();
  },
};

async function loadWorkspace() {
  try {
    const fileValue = await readOfflineJson(WORKSPACE_FILE);
    if (fileValue) {
      offlineStorageReady = true;
      updateOfflineStatus("Offline • local workspace");
      return await importPendingAttachments(deserializeWorkspace(JSON.stringify(fileValue)));
    }
    const value = Services.prefs.getStringPref(PREF, "");
    const loaded = value ? await importPendingAttachments(deserializeWorkspace(value)) : await importPendingAttachments(createWorkspace({ name: "My workspace" }));
    await writeOfflineJson(WORKSPACE_FILE, JSON.parse(JSON.stringify(loaded)));
    offlineStorageReady = true;
    updateOfflineStatus("Offline • local workspace");
    return loaded;
  } catch (error) {
    console.error("e-Vaarta: failed to load offline workspace", error);
    updateOfflineStatus("Offline • recovery mode", false);
    try {
      const value = Services.prefs.getStringPref(PREF, "");
      return value ? await importPendingAttachments(deserializeWorkspace(value)) : await importPendingAttachments(createWorkspace({ name: "My workspace" }));
    } catch (fallbackError) {
      return await importPendingAttachments(createWorkspace({ name: "My workspace" }));
    }
  }
}

function saveWorkspace() {
  const snapshot = JSON.parse(JSON.stringify(workspace));
  workspaceSavePromise = workspaceSavePromise
    .catch(() => {})
    .then(() => writeOfflineJson(WORKSPACE_FILE, snapshot))
    .then(() => {
      offlineStorageReady = true;
      updateOfflineStatus("Offline • saved locally");
    })
    .catch(error => {
      console.error("e-Vaarta: failed to save offline workspace", error);
      try { Services.prefs.setStringPref(PREF, JSON.stringify(snapshot)); } catch (fallbackError) {}
      updateOfflineStatus("Offline • save error", false);
    });
}

async function loadContentIndex() {
  try {
    const fileValue = await readOfflineJson(INDEX_FILE);
    if (fileValue) return deserializeIndex(JSON.stringify(fileValue));
    const value = Services.prefs.getStringPref(INDEX_PREF, "");
    const loaded = value ? deserializeIndex(value) : createIndex();
    await writeOfflineJson(INDEX_FILE, JSON.parse(serializeIndex(loaded)));
    return loaded;
  } catch (error) {
    console.error("e-Vaarta: failed to load offline content index", error);
    return createIndex();
  }
}

function saveContentIndex() {
  const snapshot = serializeIndex(contentIndex);
  indexSavePromise = indexSavePromise
    .catch(() => {})
    .then(() => writeOfflineJson(INDEX_FILE, JSON.parse(snapshot)))
    .catch(error => console.error("e-Vaarta: failed to save offline content index", error));
}

function indexWorkspace() {
  for (const source of workspace.documents) {
    const metadataText = [source.description, ...(source.tags || [])].join(" ").trim();
    contentIndex = upsertIndexEntry(contentIndex, createIndexEntry({
      documentId: source.id, sourceRef: source.sourceRef, title: source.title,
      kind: source.kind, text: metadataText,
      metadata: { mimeType: source.mimeType, tags: source.tags || [] },
    }));
    const fingerprint = fingerprintText(metadataText);
    if (needsReindex(contentIndex, source.id, "document-content", fingerprint)) {
      contentIndex = upsertExtractedContent(contentIndex, {
        documentId: source.id, sourceRef: source.sourceRef, title: source.title,
        kind: "document-content", text: metadataText,
        metadata: { mimeType: source.mimeType }, fingerprint,
      });
    }
  }
  for (const group of (workspace.evidenceGroups || [])) {
    const card = document.createElement("article");
    card.className = "workspace-card evidence-group-card";
    card.dataset.itemId = group.id;
    card.tabIndex = 0;
    if (group.id === selectedGroupId) card.classList.add("card-selected");
    if (group.id === linkSourceId) card.classList.add("card-link-source");
    card.addEventListener("click", () => selectGraphEntity(group));
    card.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); selectGraphEntity(group); }
    });

    const kind = document.createElement("span");
    kind.className = "card-kind";
    kind.textContent = "EVIDENCE GROUP";
    const title = document.createElement("h3");
    title.textContent = group.name;
    const body = document.createElement("p");
    body.textContent = group.description || (group.itemIds.length + " evidence item" + (group.itemIds.length === 1 ? "" : "s"));
    card.append(kind, title, body);

    const intelligence = document.createElement("div");
    intelligence.className = "evidence-group-intelligence";
    intelligence.textContent = evidenceGroupIntelligenceText(group);
    card.append(intelligence);

    const members = document.createElement("div");
    members.className = "evidence-group-members";
    for (const member of getEvidenceGroupItems(workspace, group.id).slice(0, 5)) {
      const chip = document.createElement("button");
      chip.className = "evidence-group-member-chip";
      chip.textContent = itemLabel(member);
      chip.addEventListener("click", event => { event.stopPropagation(); selectItem(member); });
      members.append(chip);
    }
    if (group.itemIds.length > 5) {
      const more = document.createElement("span");
      more.textContent = "+" + (group.itemIds.length - 5) + " more";
      members.append(more);
    }
    card.append(members);

    const controls = document.createElement("div");
    controls.className = "card-controls";
    const link = document.createElement("button");
    link.textContent = linkSourceId === group.id ? "Select target…" : "Link";
    link.className = linkSourceId === group.id ? "link-active" : "";
    link.addEventListener("click", event => { event.stopPropagation(); startGraphLink(group); });
    controls.append(link);
    card.append(controls);

    const groupLinks = workspace.links.filter(link => link.fromId === group.id || link.toId === group.id);
    if (groupLinks.length) {
      const chips = document.createElement("div");
      chips.className = "link-chip-row";
      for (const link of groupLinks) {
        const otherId = link.fromId === group.id ? link.toId : link.fromId;
        const chip = document.createElement("button");
        chip.className = "link-chip";
        chip.dataset.kind = link.kind;
        chip.textContent = linkLabel(link.kind) + " • " + graphEntityLabel(findGraphEntity(otherId));
        chip.addEventListener("click", event => { event.stopPropagation(); selectLink(link); });
        chips.append(chip);
      }
      card.append(chips);
    }
    canvas.append(card);
  }

  for (const item of workspace.items) {
    const source = sourceForItem(item);
    contentIndex = upsertIndexEntry(contentIndex, createIndexEntry({
      documentId: source?.id || item.id, sourceRef: source?.sourceRef || null,
      title: item.title || item.kind, kind: item.kind,
      text: [item.text, item.anchor?.quote].filter(Boolean).join(" "),
      metadata: { page: item.anchor?.page, annotationType: item.annotationType, itemId: item.id, itemKind: item.kind },
    }));
  }
  saveContentIndex();
}

function indexEmailSource(source, bodyText) {
  if (!source?.id || source.kind !== "email" || !bodyText?.trim()) return;
  const fingerprint = fingerprintText(bodyText);
  if (!needsReindex(contentIndex, source.id, "email-body", fingerprint)) return;
  contentIndex = upsertExtractedContent(contentIndex, {
    documentId: source.id, sourceRef: source.sourceRef, title: source.title,
    kind: "email-body", text: bodyText,
    metadata: { mimeType: "message/rfc822" }, fingerprint,
  });
  saveContentIndex();
}

function findItem(itemId) { return workspace.items.find(item => item.id === itemId) || null; }
function itemLabel(item) { return item?.title || (item?.kind === "note" ? "Note" : "Excerpt"); }

function groupsForItem(item) {
  return item ? evidenceGroupsForItem(workspace, item.id) : [];
}

function evidenceGroupLabel(group) {
  return group?.name || "Evidence group";
}

function evidenceGroupIntelligence(group) {
  const items = getEvidenceGroupItems(workspace, group.id);
  const sourceIds = new Set();
  const kinds = new Map();
  const links = workspace.links.filter(link => group.itemIds.includes(link.fromId) || group.itemIds.includes(link.toId));
  for (const item of items) {
    const source = sourceForItem(item);
    if (source) sourceIds.add(source.id);
    const kind = item.kind || "other";
    kinds.set(kind, (kinds.get(kind) || 0) + 1);
  }
  return {
    itemCount: items.length,
    sourceCount: sourceIds.size,
    relationshipCount: links.length,
    kinds: [...kinds.entries()].sort((a, b) => b[1] - a[1]),
  };
}

function evidenceGroupIntelligenceText(group) {
  const stats = evidenceGroupIntelligence(group);
  const typeText = stats.kinds.length
    ? stats.kinds.map(([kind, count]) => count + " " + kind).join(" • ")
    : "No evidence yet";
  return stats.itemCount + " evidence • " + stats.sourceCount + " source" + (stats.sourceCount === 1 ? "" : "s") +
    " • " + stats.relationshipCount + " relationship" + (stats.relationshipCount === 1 ? "" : "s") +
    " • " + typeText;
}

function findGraphEntity(entityId) {
  return findItem(entityId) || (workspace.evidenceGroups || []).find(group => group.id === entityId) || null;
}

function graphEntityLabel(entity) {
  return entity?.id?.startsWith("evidence-group-") ? evidenceGroupLabel(entity) : itemLabel(entity);
}

function graphEntityIsGroup(entity) {
  return Boolean(entity?.id?.startsWith("evidence-group-"));
}

function selectGraphEntity(entity) {
  if (!entity) return;
  selectedItemIds.clear();
  if (graphEntityIsGroup(entity)) {
    selectedGroupId = entity.id;
    activeEvidenceGroupId = entity.id;
    activeEvidenceIndex = 0;
    selectedItemId = null;
    selectedLinkId = null;
    const items = getEvidenceGroupItems(workspace, entity.id);
    const source = entity.documentId
      ? workspace.documents.find(document => document.id === entity.documentId)
      : sourceForItem(items[0]);
    if (source) {
      selectedDocumentId = source.id;
      focusLibrarySource(source);
      selectDocument(source);
    }
    render();
    return;
  }
  selectItem(entity);
}

function selectEvidenceGroup(group) {
  if (!group) return;
  selectGraphEntity(group);
}

function activeEvidenceGroup() {
  return (workspace.evidenceGroups || []).find(group => group.id === activeEvidenceGroupId) || null;
}

function activeEvidenceItems() {
  const group = activeEvidenceGroup();
  return group ? getEvidenceGroupItems(workspace, group.id) : [];
}

function navigateEvidenceGroup(step) {
  const group = activeEvidenceGroup();
  const items = activeEvidenceItems();
  if (!group || !items.length) return;
  activeEvidenceIndex = Math.max(0, Math.min(items.length - 1, activeEvidenceIndex + step));
  const item = items[activeEvidenceIndex];
  selectItem(item);
  selectedGroupId = group.id;
  activeEvidenceGroupId = group.id;
  render();
  window.setTimeout(() => focusCanvasItem(item), 0);
}

function openEvidenceGroupNavigator(group) {
  if (!group) return;
  activeEvidenceGroupId = group.id;
  activeEvidenceIndex = 0;
  selectGraphEntity(group);
  document.getElementById("evidenceNavigator").showModal();
  renderEvidenceNavigator();
}

function renderEvidenceNavigator() {
  const list = document.getElementById("evidenceNavigatorList");
  const group = activeEvidenceGroup();
  const items = activeEvidenceItems();
  list.replaceChildren();
  if (!group || !items.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "This evidence group has no members.";
    list.append(empty);
    return;
  }
  const counter = document.createElement("div");
  counter.className = "evidence-navigator-counter";
  counter.textContent = "Evidence " + (activeEvidenceIndex + 1) + " of " + items.length;
  list.append(counter);
  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    const row = document.createElement("button");
    row.type = "button";
    row.className = "evidence-navigator-row";
    if (index === activeEvidenceIndex) row.classList.add("active");
    row.textContent = (index + 1) + ". " + itemLabel(item);
    row.addEventListener("click", () => {
      activeEvidenceIndex = index;
      selectItem(item);
      selectedGroupId = group.id;
      renderEvidenceNavigator();
    });
    list.append(row);
  }
}



function createEvidenceGroupFromItem(item) {
  if (!item) return;
  const source = sourceForItem(item);
  const name = prompt("Evidence group name", source ? source.title + " evidence" : "Evidence group");
  if (!name?.trim()) return;
  const group = createEvidenceGroup({
    name: name.trim(),
    documentId: source?.id || item.anchor?.documentId || null,
  });
  workspace = addEvidenceGroup(workspace, group);
  addItemToEvidenceGroup(workspace, group.id, item.id);
  saveWorkspace();
  render();
}

function syncEvidenceGroupSource(group) {
  if (!group) return;
  const members = getEvidenceGroupItems(workspace, group.id);
  const sourceIds = [...new Set(members.map(item => sourceForItem(item)?.id || item.anchor?.documentId).filter(Boolean))];
  updateEvidenceGroup(workspace, group.id, {
    documentId: sourceIds.length === 1 ? sourceIds[0] : null,
    updatedAt: Date.now(),
  });
}

function toggleEvidenceGroupItem(group, item) {
  if (!group || !item) return;
  if (group.itemIds.includes(item.id)) removeItemFromEvidenceGroup(workspace, group.id, item.id);
  else addItemToEvidenceGroup(workspace, group.id, item.id);
  syncEvidenceGroupSource(group);
  saveWorkspace();
  render();
}

function addSelectedItemsToEvidenceGroup(group) {
  if (!group || !selectedItemIds.size) return;
  for (const itemId of selectedItemIds) {
    const item = findItem(itemId);
    if (item && !group.itemIds.includes(item.id)) addItemToEvidenceGroup(workspace, group.id, item.id);
  }
  syncEvidenceGroupSource(group);
  saveWorkspace();
  renderEvidenceGroups();
  render();
}

function removeSelectedItemsFromEvidenceGroup(group) {
  if (!group || !selectedItemIds.size) return;
  for (const itemId of selectedItemIds) {
    if (group.itemIds.includes(itemId)) removeItemFromEvidenceGroup(workspace, group.id, itemId);
  }
  syncEvidenceGroupSource(group);
  saveWorkspace();
  renderEvidenceGroups();
  render();
}

function renderEvidenceGroups() {
  const list = document.getElementById("evidenceGroupList");
  list.replaceChildren();
  const groups = workspace.evidenceGroups || [];
  if (!groups.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No evidence groups yet.";
    list.append(empty);
    return;
  }
  for (const group of groups) {
    const row = document.createElement("div");
    row.className = "evidence-group-manager-row";
    const info = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = group.name;
    const meta = document.createElement("small");
    meta.textContent = group.itemIds.length + " evidence item" + (group.itemIds.length === 1 ? "" : "s");
    info.append(title, meta);
    const select = document.createElement("button");
    select.textContent = "Open";
    select.addEventListener("click", () => {
      selectEvidenceGroup(group);
      document.getElementById("evidenceGroupsPane").close();
    });
    const navigate = document.createElement("button");
    navigate.textContent = "Navigate";
    navigate.addEventListener("click", () => {
      document.getElementById("evidenceGroupsPane").close();
      openEvidenceGroupNavigator(group);
    });
    const add = document.createElement("button");
    add.textContent = "Add selected";
    add.disabled = !selectedItemIds.size;
    add.addEventListener("click", () => addSelectedItemsToEvidenceGroup(group));
    const removeMembers = document.createElement("button");
    removeMembers.textContent = "Remove selected";
    removeMembers.disabled = !selectedItemIds.size;
    removeMembers.addEventListener("click", () => removeSelectedItemsFromEvidenceGroup(group));
    const remove = document.createElement("button");
    remove.textContent = "Delete";
    remove.className = "quiet";
    remove.addEventListener("click", () => {
      if (!confirm("Delete this evidence group? Items will not be deleted.")) return;
      removeEvidenceGroup(workspace, group.id);
      saveWorkspace();
      renderEvidenceGroups();
      render();
    });
    row.append(info, select, navigate, add, removeMembers, remove);
    list.append(row);
  }
}

function openEvidenceGroups() {
  renderEvidenceGroups();
  document.getElementById("evidenceGroupsPane").showModal();
}

function createEvidenceGroupFromManager() {
  const input = document.getElementById("newEvidenceGroupName");
  const name = input.value.trim();
  if (!name) return;
  const item = findItem(selectedItemId);
  const source = sourceForItem(item);
  const group = createEvidenceGroup({ name, documentId: source?.id || item?.anchor?.documentId || null });
  workspace = addEvidenceGroup(workspace, group);
  if (item) addItemToEvidenceGroup(workspace, group.id, item.id);
  input.value = "";
  saveWorkspace();
  renderEvidenceGroups();
  render();
}
function linkLabel(kind) { return kind.replaceAll("-", " "); }

function jumpToSource(item) {
  if (!item.anchor?.documentId) return;
  const source = workspace.documents.find(document => document.id === item.anchor.documentId);
  if (!source) return;
  selectedDocumentId = source.id;
  focusLibrarySource(source);
  selectDocument(source, item.anchor.page, item.anchor);
  window.setTimeout(() => focusCanvasItem(item), 0);
}

function findAnnotationForSelection(source, selection) {
  if (!source || !selection?.quote) return null;
  return annotations().find(item => {
    const anchor = item.anchor;
    return anchor?.documentId === source.id
      && anchor?.page === selection.page
      && anchor?.quote === selection.quote;
  }) || null;
}

function syncAnnotationFromSelection(source, selection) {
  if (!source || !selection?.quote || restoringSourceAnchor) return;
  const annotation = findAnnotationForSelection(source, selection);
  if (!annotation) return;
  selectedItemId = annotation.id;
  selectedLinkId = null;
  render();
  focusCanvasItem(annotation);
  if (annotationPanelOpen) renderAnnotations();
}

function findTextRange(root, quote) {
  if (!quote?.trim()) return null;
  const walker = root.createTreeWalker(root.body || root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  let node;
  while ((node = walker.nextNode())) nodes.push(node);
  const target = quote.trim();
  for (let i = 0; i < nodes.length; i++) {
    const text = nodes[i].nodeValue || "";
    const offset = text.indexOf(target);
    if (offset >= 0) return { node: nodes[i], start: offset, end: offset + target.length };
  }
  for (let i = 0; i < nodes.length; i++) {
    const combined = (nodes[i].nodeValue || "") + (nodes[i + 1]?.nodeValue || "");
    const offset = combined.indexOf(target);
    if (offset >= 0) {
      const first = nodes[i].nodeValue || "";
      return {
        node: nodes[i],
        start: offset,
        end: Math.min(first.length, offset + target.length),
        secondNode: nodes[i + 1],
        secondEnd: Math.max(0, offset + target.length - first.length),
      };
    }
  }
  return null;
}

function restorePdfHighlight(anchor) {
  const viewer = document.getElementById("sourceViewer");
  if (!viewer?.contentWindow || anchor?.page == null) return false;
  const selector = anchor.selector;
  if (!selector?.spanIndexes?.length) return false;
  const seen = new Set();

  function visit(win) {
    if (!win || seen.has(win)) return false;
    seen.add(win);
    try {
      const page = win.document.querySelector(".page[data-page-number='" + anchor.page + "']");
      const textLayer = page?.querySelector(".textLayer");
      if (!textLayer) return false;
      const spans = [...textLayer.querySelectorAll("span")];
      for (const index of selector.spanIndexes) {
        const span = spans[index];
        if (!span) continue;
        span.classList.add("evaarta-persistent-" + (anchor.annotationType || "highlight")); if (anchor.color) span.style.setProperty("--evaarta-annotation-color", anchor.color);
      }
      if (selector.spanIndexes.some(index => spans[index])) {
        const first = spans[selector.spanIndexes[0]];
        first?.scrollIntoView({ block: "center", behavior: "smooth" });
        return true;
      }
    } catch (error) {}
    for (const frame of win.frames) if (visit(frame)) return true;
    return false;
  }
  return visit(viewer.contentWindow);
}

function restorePdfAnchor(anchor) {
  const viewer = document.getElementById("sourceViewer");
  if (!viewer?.contentWindow || !anchor?.quote) return false;
  const seen = new Set();
  function visit(win) {
    if (!win || seen.has(win)) return false;
    seen.add(win);
    try {
      const page = anchor.page
        ? win.document.querySelector(".page[data-page-number='" + anchor.page + "']")
        : null;
      const root = page || win.document;
      const match = findTextRange(root, anchor.quote);
      if (match) {
        const range = win.document.createRange();
        range.setStart(match.node, match.start);
        if (match.secondNode) range.setEnd(match.secondNode, match.secondEnd);
        else range.setEnd(match.node, match.end);
        const selection = win.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        range.startContainer.parentElement?.scrollIntoView({ block: "center", behavior: "smooth" });
        return true;
      }
      for (const frame of win.frames) if (visit(frame)) return true;
    } catch (error) {}
    return false;
  }
  return visit(viewer.contentWindow);
}



let editorMode = null;
let editorItemId = null;
let editorOptions = {};

function openEditor(mode, item = null, options = {}) {
  editorMode = mode;
  editorItemId = item?.id || null;
  editorOptions = options || {};
  annotationEditorItemId = null;
  document.getElementById("annotationEditorFields").hidden = mode !== "annotation";
  const editor = document.getElementById("itemEditor");
  document.getElementById("editorHeading").textContent =
    mode === "note" ? (item ? "Edit note" : "New note") : "Add source excerpt";
  document.getElementById("editorTitle").value =
    item?.title || (mode === "note" ? "New thought" : "Source excerpt");
  document.getElementById("editorText").value = item?.text || "";
  document.getElementById("editorPage").value = item?.anchor?.page || "";
  document.getElementById("editorSourceFields").hidden = mode !== "excerpt";
  editor.showModal();
  document.getElementById("editorTitle").focus();
}

function closeEditor() {
  document.getElementById("itemEditor").close();
  editorMode = null;
  editorItemId = null;
  editorOptions = {};
  annotationEditorItemId = null;
  document.getElementById("annotationEditorFields").hidden = true;
}

function saveEditor() {
  const title = document.getElementById("editorTitle").value.trim();
  const text = document.getElementById("editorText").value.trim();
  if (!text) {
    alert("Content cannot be empty.");
    return;
  }
  if (editorMode === "note") {
    const item = editorItemId ? findItem(editorItemId) : null;
    if (item) {
      item.title = title || "Note";
      item.text = text;
      item.updatedAt = new Date().toISOString();
      workspace.updatedAt = item.updatedAt;
    } else {
      workspace = addItem(workspace, createNote({ title: title || "Note", text }));
    }
  } else if (editorMode === "annotation") {
    const item = findItem(annotationEditorItemId);
    if (item) {
      item.title = title || "Annotation";
      item.text = text;
      item.annotationType = document.getElementById("annotationType").value;
      item.color = document.getElementById("annotationColor").value;
      const pageValue = document.getElementById("editorPage").value.trim();
      if (item.anchor) item.anchor.page = pageValue ? Number(pageValue) : item.anchor.page;
      item.updatedAt = new Date().toISOString();
      workspace.updatedAt = item.updatedAt;
    }
  } else if (editorMode === "excerpt") {
    const source = workspace.documents.find(document => document.id === selectedDocumentId);
    if (!source) {
      alert("Open a source document first.");
      return;
    }
    const pageValue = document.getElementById("editorPage").value.trim();
    const page = pageValue ? Number(pageValue) : null;
    const excerpt = createExcerpt({
      anchor: createSourceAnchor({
        documentId: source.id,
        page: Number.isInteger(page) && page > 0 ? page : null,
        quote: text,
      }),
      title: title || "Source excerpt",
      text,
    });
    if (editorOptions.sourceCard) {
      excerpt.metadata = { ...(excerpt.metadata || {}), sourceAware: true };
    }
    workspace = addItem(workspace, excerpt);
    if (editorOptions.sourceCard) {
      const sourceCard = workspace.items.find(candidate =>
        candidate.metadata?.libraryCard && candidate.anchor?.documentId === source.id
      );
      if (sourceCard) {
        try {
          workspace = addLink(workspace, createLink({
            fromId: excerpt.id,
            toId: sourceCard.id,
            kind: "derived-from",
          }));
        } catch (error) {
          console.warn("e-Vaarta: unable to connect source-aware excerpt", error);
        }
      }
    }
  }
  saveWorkspace();
  closeEditor();
  render();
}

function editNote(item) {
  openEditor("note", item);
}

function cancelLinkMode() {
  linkSourceId = null;
  document.getElementById("cancelLinkButton").hidden = true;
  document.getElementById("linkModeStatus").textContent = "Choose two cards to connect.";
  render();
}

function startGraphLink(entity) {
  if (!entity) return;
  linkSourceId = entity.id;
  selectedLinkId = null;
  render();
}

function graphRelationshipTargets(sourceEntity) {
  return [
    ...workspace.items.filter(item => item.id !== sourceEntity.id),
    ...(workspace.evidenceGroups || []).filter(group => group.id !== sourceEntity.id),
  ];
}

function createGraphRelationship(sourceEntity, targetEntity, kind) {
  if (!sourceEntity || !targetEntity || sourceEntity.id === targetEntity.id) return;
  const duplicate = workspace.links.some(link =>
    ((link.fromId === sourceEntity.id && link.toId === targetEntity.id) ||
     (link.fromId === targetEntity.id && link.toId === sourceEntity.id)) && link.kind === kind
  );
  if (duplicate) return;
  workspace = addLink(workspace, createLink({
    fromId: sourceEntity.id,
    toId: targetEntity.id,
    kind,
  }));
  linkSourceId = null;
  selectedLinkId = null;
  saveWorkspace();
  render();
}

function linkItem(item) {
  if (!linkSourceId) {
    linkSourceId = item.id;
    document.getElementById("cancelLinkButton").hidden = false;
    document.getElementById("linkModeStatus").textContent = "Source selected: " + graphEntityLabel(item) + ". Now select a target card.";
    render();
    return;
  }
  if (linkSourceId === item.id) { cancelLinkMode(); return; }
  const kind = document.getElementById("relationshipSelect").value;
  try {
    workspace = addLink(workspace, createLink({ fromId: linkSourceId, toId: item.id, kind }));
    saveWorkspace();
  } catch (error) { alert(error.message); }
  linkSourceId = null;
  document.getElementById("cancelLinkButton").hidden = true;
  document.getElementById("linkModeStatus").textContent = "Relationship added.";
  render();
}

function focusCanvasItem(item) {
  const card = document.querySelector(`#workspaceCanvas .workspace-card[data-item-id="${CSS.escape(item.id)}"]`);
  if (!card) return;
  card.scrollIntoView({ block: "nearest", behavior: "smooth" });
  card.classList.add("card-evidence-active");
  window.setTimeout(() => card.classList.remove("card-evidence-active"), 1200);
}

function toggleItemMultiSelection(item) {
  if (!item) return;
  if (selectedItemIds.has(item.id)) selectedItemIds.delete(item.id);
  else selectedItemIds.add(item.id);
  selectedItemId = item.id;
  selectedGroupId = null;
  selectedLinkId = null;
  render();
}

function clearMultiSelection() {
  selectedItemIds.clear();
  render();
}

function createEvidenceGroupFromSelection() {
  const ids = [...selectedItemIds];
  if (ids.length < 2) return;
  const name = prompt("Evidence group name", "Selected evidence");
  if (!name?.trim()) return;
  const sources = ids.map(findItem).map(sourceForItem).filter(Boolean);
  const documentId = sources.length && sources.every(source => source.id === sources[0].id)
    ? sources[0].id
    : null;
  const group = createEvidenceGroup({ name: name.trim(), documentId });
  workspace = addEvidenceGroup(workspace, group);
  for (const itemId of ids) addItemToEvidenceGroup(workspace, group.id, itemId);
  selectedGroupId = group.id;
  selectedItemIds.clear();
  saveWorkspace();
  render();
}

function selectItem(item) {
  selectedItemIds.clear();
  selectedItemId = item.id;
  selectedGroupId = null;
  selectedLinkId = null;
  renderRelationshipInspector();
  render();

  const source = sourceForItem(item);
  if (!source) return;

  selectedDocumentId = source.id;
  focusLibrarySource(source);

  // Anchored items represent evidence in a source. Open the source at the
  // stored page/quote after the canvas selection has been rendered.
  if (item.anchor?.quote || item.anchor?.page != null) {
    jumpToSource(item);
    window.setTimeout(() => focusCanvasItem(item), 0);
  }
}

function selectLink(link) {
  selectedLinkId = link.id;
  selectedItemId = null;
  selectedGroupId = null;
  renderRelationshipInspector();
  render();
}

function deleteSelectedLink() {
  if (!selectedLinkId) return;
  workspace.links = workspace.links.filter(link => link.id !== selectedLinkId);
  workspace.updatedAt = new Date().toISOString();
  selectedLinkId = null;
  saveWorkspace();
  render();
}

function renderRelationshipInspector() {
  const inspector = document.getElementById("relationshipInspector");
  if (!selectedLinkId) { inspector.hidden = true; inspector.replaceChildren(); return; }
  const link = workspace.links.find(candidate => candidate.id === selectedLinkId);
  if (!link) { inspector.hidden = true; inspector.replaceChildren(); return; }
  const from = findGraphEntity(link.fromId);
  const to = findGraphEntity(link.toId);
  inspector.hidden = false;
  inspector.replaceChildren();
  const summary = document.createElement("span");
  summary.textContent = graphEntityLabel(from) + " → " + linkLabel(link.kind) + " → " + graphEntityLabel(to);
  const remove = document.createElement("button");
  remove.className = "quiet";
  remove.textContent = "Remove relationship";
  remove.addEventListener("click", deleteSelectedLink);
  inspector.append(summary, remove);
}

function openSelectedEmailSource() {
  const source = workspace.documents.find(document => document.id === selectedDocumentId);
  if (!source?.sourceRef || source.kind !== "email") return;
  try {
    window.openDialog("chrome://messenger/content/messageWindow.xhtml", "_blank", "chrome,dialog=no,all", source.sourceRef);
  } catch (error) { console.error("e-Vaarta: unable to open email source", error); }
}

function sourceForItem(item) {
  if (!item?.anchor?.documentId) return null;
  return workspace.documents.find(document => document.id === item.anchor.documentId) || null;
}

function addDocumentToCanvas(source) {
  if (!source) return;
  const existing = workspace.items.find(item =>
    item.kind === "excerpt" &&
    item.anchor?.documentId === source.id &&
    item.anchor?.quote === null &&
    item.metadata?.libraryCard === true
  );
  if (existing) {
    selectedItemId = existing.id;
    render();
    return;
  }
  const anchor = createSourceAnchor({ documentId: source.id, quote: null });
  const card = createExcerpt({
    anchor,
    title: source.title,
    text: [source.description, source.tags?.length ? "Tags: " + source.tags.join(", ") : "", source.kind.toUpperCase()]
      .filter(Boolean).join(" • "),
  });
  card.metadata = { ...(card.metadata || {}), libraryCard: true };
  workspace = addItem(workspace, card);
  selectedItemId = card.id;
  workspace.updatedAt = new Date().toISOString();
  saveWorkspace();
  indexWorkspace();
  render();
}

function installCanvasDropTarget() {
  const canvas = document.getElementById("workspaceCanvas");
  if (!canvas) return;
  canvas.addEventListener("dragover", event => {
    if (event.dataTransfer?.types.includes("application/x-evaarta-document")) {
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
      canvas.classList.add("canvas-drop-active");
    }
  });
  canvas.addEventListener("dragleave", event => {
    if (!canvas.contains(event.relatedTarget)) canvas.classList.remove("canvas-drop-active");
  });
  canvas.addEventListener("drop", event => {
    const id = event.dataTransfer?.getData("application/x-evaarta-document");
    canvas.classList.remove("canvas-drop-active");
    if (!id) return;
    event.preventDefault();
    const source = workspace.documents.find(document => document.id === id);
    addDocumentToCanvas(source);
  });
}

function renderGraphEdges() {
  const canvas = document.getElementById("workspaceCanvas");
  const svg = document.getElementById("workspaceEdges");
  svg.replaceChildren();
  const cards = new Map([...canvas.querySelectorAll(".workspace-card")].map(card => [card.dataset.itemId, card]));
  const width = Math.max(canvas.scrollWidth, canvas.clientWidth);
  const height = Math.max(canvas.scrollHeight, canvas.clientHeight);
  svg.setAttribute("width", width);
  svg.setAttribute("height", height);
  svg.setAttribute("viewBox", "0 0 " + width + " " + height);
  const ns = "http://www.w3.org/2000/svg";
  for (const link of workspace.links) {
    const from = cards.get(link.fromId);
    const to = cards.get(link.toId);
    if (!from || !to) continue;
    const x1 = from.offsetLeft + from.offsetWidth / 2;
    const y1 = from.offsetTop + from.offsetHeight / 2;
    const x2 = to.offsetLeft + to.offsetWidth / 2;
    const y2 = to.offsetTop + to.offsetHeight / 2;
    const dx = Math.max(30, Math.abs(x2 - x1) * 0.45);
    const curve = "M " + x1 + " " + y1 + " C " + (x1 + (x2 >= x1 ? dx : -dx)) + " " + y1 + ", " + (x2 - (x2 >= x1 ? dx : -dx)) + " " + y2 + ", " + x2 + " " + y2;
    const group = document.createElementNS(ns, "g");
    group.classList.add("edge-group");
    const line = document.createElementNS(ns, "path");
    line.setAttribute("d", curve);
    line.classList.add("edge-line");
    if (selectedLinkId === link.id) line.classList.add("edge-active");
    if (link.kind === "derived-from") {
      group.classList.add("edge-derived");
      if (selectedItemId === link.fromId || selectedItemId === link.toId || selectedGroupId === link.fromId || selectedGroupId === link.toId) group.classList.add("edge-derived-active");
    }
    const label = document.createElementNS(ns, "text");
    label.setAttribute("x", String((x1 + x2) / 2));
    label.setAttribute("y", String((y1 + y2) / 2 - 6));
    label.setAttribute("text-anchor", "middle");
    label.classList.add("edge-label");
    label.textContent = linkLabel(link.kind);
    group.append(line, label);
    group.addEventListener("click", event => { event.stopPropagation(); selectLink(link); });
    svg.append(group);
  }
}

function layoutCards() {
  const canvas = document.getElementById("workspaceCanvas");
  const cards = [...canvas.querySelectorAll(".workspace-card")];
  if (!cards.length) return;
  const cardWidth = 300;
  const gap = 24;
  const columns = Math.max(1, Math.floor((canvas.clientWidth - 16 + gap) / (cardWidth + gap)));
  const rowHeight = 250;
  cards.forEach((card, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    card.style.left = (column * (cardWidth + gap) + 8) + "px";
    card.style.top = (row * rowHeight + 8) + "px";
  });
  const rows = Math.ceil(cards.length / columns);
  canvas.style.minHeight = Math.max(470, rows * rowHeight + 24) + "px";
}

function openDocumentMetadataEditor(source) {
  metadataEditorDocumentId = source?.id || null;
  if (!source) return;
  document.getElementById("metadataTitle").value = source.title || "";
  document.getElementById("metadataDescription").value = source.description || "";
  document.getElementById("metadataTags").value = (source.tags || []).join(", ");
  document.getElementById("documentMetadataEditor").showModal();
}

function closeDocumentMetadataEditor() {
  document.getElementById("documentMetadataEditor").close();
  metadataEditorDocumentId = null;
}

function saveDocumentMetadata() {
  const source = workspace.documents.find(document => document.id === metadataEditorDocumentId);
  if (!source) return closeDocumentMetadataEditor();
  source.title = document.getElementById("metadataTitle").value.trim() || source.title;
  source.description = document.getElementById("metadataDescription").value.trim();
  source.tags = document.getElementById("metadataTags").value
    .split(",").map(tag => tag.trim()).filter(Boolean)
    .filter((tag, index, tags) => tags.indexOf(tag) === index);
  source.updatedAt = new Date().toISOString();
  workspace.updatedAt = source.updatedAt;
  saveWorkspace();
  indexWorkspace();
  closeDocumentMetadataEditor();
  render();
  if (source.id === selectedDocumentId) selectDocument(source);
}

function collectionsForSource(source) {
  if (!source) return [];
  return workspace.collections.filter(collection =>
    collection.smartRule
      ? getCollectionDocuments(workspace, collection.id).some(document => document.id === source.id)
      : collection.documentIds.includes(source.id)
  );
}

let sourceContextDocumentId = null;

function openSourceContextMenu(source) {
  if (!source) return;
  sourceContextDocumentId = source.id;
  document.getElementById("sourceContextTitle").textContent = source.title || "Source";
  document.getElementById("sourceContextVaultRecoverButton").disabled = !source.vault;
  document.getElementById("sourceContextVaultDetachButton").disabled = !source.vault;
  document.getElementById("sourceContextMenu").showModal();
}

function closeSourceContextMenu() {
  document.getElementById("sourceContextMenu").close();
  sourceContextDocumentId = null;
}

function sourceContextDocument() {
  return workspace.documents.find(document => document.id === sourceContextDocumentId) || null;
}

function sourceContextOpen() {
  const source = sourceContextDocument();
  closeSourceContextMenu();
  if (source) selectDocument(source);
}

function sourceContextMetadata() {
  const source = sourceContextDocument();
  closeSourceContextMenu();
  if (source) openDocumentMetadataEditor(source);
}

function sourceContextCollection() {
  const source = sourceContextDocument();
  closeSourceContextMenu();
  if (source) toggleDocumentCollection(source);
}

function sourceContextVaultRecover() {
  const source = sourceContextDocument();
  closeSourceContextMenu();
  if (source) recoverVaultDocument(source);
}

function sourceContextVaultDetach() {
  const source = sourceContextDocument();
  closeSourceContextMenu();
  if (source) removeVaultReference(source);
}

function sourceContextAddExcerpt() {
  const source = sourceContextDocument();
  closeSourceContextMenu();
  if (!source) return;
  selectDocument(source);
  addExcerpt({ sourceCard: true });
}

function sourceContextRemoveCard() {
  const source = sourceContextDocument();
  closeSourceContextMenu();
  if (!source) return;
  const card = workspace.items.find(item => item.metadata?.libraryCard && item.anchor?.documentId === source.id);
  if (!card) return;
  workspace.items = workspace.items.filter(item => item.id !== card.id);
  workspace.updatedAt = new Date().toISOString();
  selectedItemId = null;
  saveWorkspace();
  indexWorkspace();
  render();
}

function showSourceCollection(collection) {
  if (!collection) return;
  selectedCustomCollectionId = collection.id;
  libraryCollection = "all";
  render();
}

function customCollectionForSource(source) {
  return workspace.collections.find(collection =>
    collection.smartRule
      ? collection.smartRule && workspace.documents.some(document => document.id === source.id && getCollectionDocuments(workspace, collection.id).some(item => item.id === source.id))
      : collection.documentIds.includes(source.id)
  ) || null;
}

function openCollectionManager() {
  renderCollectionManager();
  document.getElementById("collectionManager").showModal();
}

function closeCollectionManager() {
  document.getElementById("collectionManager").close();
}

function renderCollectionManager() {
  const list = document.getElementById("customCollectionList");
  list.replaceChildren();
  for (const collection of workspace.collections) {
    const row = document.createElement("div");
    row.className = "collection-row";
    const name = document.createElement("strong");
    name.textContent = collection.name;
    const count = document.createElement("small");
    const documentCount = collection.smartRule
      ? getCollectionDocuments(workspace, collection.id).length
      : collection.documentIds.length;
    count.textContent = documentCount + " document" + (documentCount === 1 ? "" : "s");
    const edit = document.createElement("button");
    edit.type = "button";
    edit.textContent = "Edit";
    edit.addEventListener("click", () => {
      const nameValue = prompt("Collection name", collection.name);
      if (!nameValue?.trim()) return;
      updateCollection(workspace, collection.id, { name: nameValue });
      saveWorkspace();
      renderCollectionManager();
      render();
    });
    const smart = document.createElement("button");
    smart.type = "button";
    smart.textContent = collection.smartRule ? "Smart" : "Rule";
    smart.addEventListener("click", () => {
      selectedCustomCollectionId = collection.id;
      document.getElementById("ruleKind").value = collection.smartRule?.kind || "";
      document.getElementById("ruleTag").value = collection.smartRule?.tag || "";
      document.getElementById("ruleText").value = collection.smartRule?.text || "";
      document.getElementById("ruleDays").value = collection.smartRule?.updatedWithinDays || "";
      document.getElementById("collectionRuleEditor").showModal();
    });
    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "Delete";
    remove.addEventListener("click", () => {
      if (!confirm("Delete this collection? Documents will not be deleted.")) return;
      removeCollection(workspace, collection.id);
      if (selectedCustomCollectionId === collection.id) selectedCustomCollectionId = null;
      saveWorkspace();
      renderCollectionManager();
      render();
    });
    row.append(name, count, edit, smart, remove);
    list.append(row);
  }
}

function createCustomCollection() {
  const name = document.getElementById("newCollectionName").value.trim();
  if (!name) return;
  const collection = createCollection({ name });
  workspace = addCollection(workspace, collection);
  document.getElementById("newCollectionName").value = "";
  saveWorkspace();
  renderCollectionManager();
  render();
}

function saveCollectionRule(collection) {
  const kind = document.getElementById("ruleKind").value;
  const tag = document.getElementById("ruleTag").value.trim();
  const text = document.getElementById("ruleText").value.trim();
  const days = Number(document.getElementById("ruleDays").value);
  const rule = {};
  if (kind) rule.kind = kind;
  if (tag) rule.tag = tag;
  if (text) rule.text = text;
  if (Number.isFinite(days) && days > 0) rule.updatedWithinDays = days;
  setCollectionRule(workspace, collection.id, Object.keys(rule).length ? rule : null);
  saveWorkspace();
  renderCollectionManager();
  render();
}

function toggleDocumentCollection(source) {
  const collectionIds = workspace.collections
    .filter(collection => collection.documentIds.includes(source.id))
    .map(collection => collection.id);
  const options = workspace.collections.map(collection =>
    (collectionIds.includes(collection.id) ? "[x] " : "[ ] ") + collection.name
  );
  if (!options.length) {
    openCollectionManager();
    return;
  }
  const answer = prompt("Toggle collection membership:\n" + options.map((option, index) => (index + 1) + ". " + option).join("\n"));
  const index = Number(answer) - 1;
  if (!Number.isInteger(index) || index < 0 || index >= workspace.collections.length) return;
  const collection = workspace.collections[index];
  if (collectionIds.includes(collection.id)) collectionIds.splice(collectionIds.indexOf(collection.id), 1);
  else collectionIds.push(collection.id);
  setDocumentCollections(workspace, source.id, collectionIds);
  saveWorkspace();
  indexWorkspace();
  render();
}

function sourceKindLabel(kind) {
  return ({ pdf: "PDF", word: "Word", powerpoint: "PowerPoint", image: "Image", email: "Email", web: "Web" }[kind] || "Document");
}

function sourceMatchesCollection(source) {
  if (libraryCollection === "recent") {
    const stamp = new Date(source.updatedAt || source.createdAt || 0).getTime();
    return Date.now() - stamp <= 7 * 24 * 60 * 60 * 1000;
  }
  if (libraryCollection === "office") return ["word", "powerpoint"].includes(source.kind);
  if (libraryCollection === "all") return true;
  return source.kind === libraryCollection;
}

function sourceMatchesFilter(source) {
  if (selectedCustomCollectionId) {
    const collection = workspace.collections.find(c => c.id === selectedCustomCollectionId);
    const matches = collection?.smartRule
      ? getCollectionDocuments(workspace, collection.id).some(item => item.id === source.id)
      : collection?.documentIds.includes(source.id);
    if (!matches) return false;
  }
  if (!sourceMatchesCollection(source)) return false;
  const query = libraryFilter.trim().toLocaleLowerCase();
  if (!query) return true;
  return [source.title, source.description, source.kind, ...(source.tags || [])]
    .join(" ").toLocaleLowerCase().includes(query);
}

function renderGraphLinkTargets() {
  const chooser = document.getElementById("graphLinkTargetChooser");
  if (!chooser) return;
  chooser.replaceChildren();
  if (!linkSourceId) return;
  const source = findGraphEntity(linkSourceId);
  if (!source) return;
  const targets = graphRelationshipTargets(source);
  const label = document.createElement("span");
  label.className = "graph-link-source-label";
  label.textContent = "Link from: " + graphEntityLabel(source);
  chooser.append(label);
  for (const target of targets) {
    const row = document.createElement("div");
    row.className = "graph-link-target-row";
    const select = document.createElement("select");
    for (const kind of ["relates-to", "supports", "contradicts", "derived-from", "references"]) {
      const option = document.createElement("option");
      option.value = kind;
      option.textContent = linkLabel(kind);
      select.append(option);
    }
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = graphEntityLabel(target);
    button.addEventListener("click", () => createGraphRelationship(source, target, select.value));
    row.append(select, button);
    chooser.append(row);
  }
}

function render() {
  renderGraphLinkTargets();
  const sourceList = document.getElementById("sourceList");
  const canvas = document.getElementById("workspaceCanvas");
  const empty = document.getElementById("canvasEmpty");
  const count = document.getElementById("itemCount");
  const groupCount = (workspace.evidenceGroups || []).length;
  document.getElementById("workspaceName").textContent = workspace.name;
  const selectionStatus = document.getElementById("selectionStatus");
  const groupSelectionButton = document.getElementById("createEvidenceGroupSelectionButton");
  const clearSelectionButton = document.getElementById("clearEvidenceSelectionButton");
  if (selectionStatus) selectionStatus.textContent = selectedItemIds.size
    ? selectedItemIds.size + " evidence item" + (selectedItemIds.size === 1 ? "" : "s") + " selected."
    : "Shift-click evidence to select multiple items.";
  if (groupSelectionButton) groupSelectionButton.disabled = selectedItemIds.size < 2;
  if (clearSelectionButton) clearSelectionButton.hidden = selectedItemIds.size === 0;
  count.textContent = workspace.items.length + " item" + (workspace.items.length === 1 ? "" : "s") + " • " + workspace.links.length + " relationship" + (workspace.links.length === 1 ? "" : "s") + " • " + groupCount + " evidence group" + (groupCount === 1 ? "" : "s");

  for (const source of workspace.documents) {
    if (source.vault && (!source.vault.health || source.vault.health === "unknown")) {
      source.vault.health = await vaultHealth(source);
    }
  }
  sourceList.replaceChildren();
  sourceList.classList.toggle("library-grid", libraryView === "grid");
  const libraryToolbar = document.createElement("div");
  libraryToolbar.className = "library-toolbar";  for (const collection of workspace.collections) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "library-filter";
    button.classList.toggle("active", selectedCustomCollectionId === collection.id);
    button.textContent = collection.name;
    button.addEventListener("click", () => {
      selectedCustomCollectionId = collection.id;
      libraryCollection = "all";
      render();
    });
    document.getElementById("libraryCollections").append(button);
  }
    document.querySelectorAll(".library-filter[data-library-filter]").forEach(button => {
    button.classList.toggle("active", !selectedCustomCollectionId && button.dataset.libraryFilter === libraryCollection);
    button.addEventListener("click", () => {
      selectedCustomCollectionId = null;
      libraryCollection = button.dataset.libraryFilter;
      render();
    });
  });
  const viewButton = document.createElement("button");
  viewButton.type = "button";
  viewButton.className = "quiet";
  viewButton.textContent = libraryView === "list" ? "Grid" : "List";
  viewButton.title = "Switch library view";
  viewButton.addEventListener("click", () => { libraryView = libraryView === "list" ? "grid" : "list"; render(); });

  const filter = document.createElement("input");
  filter.type = "search";
  filter.placeholder = "Filter documents...";
  filter.value = libraryFilter;
  filter.setAttribute("aria-label", "Filter documents");
  filter.addEventListener("input", () => { libraryFilter = filter.value; render(); document.getElementById("libraryFilter")?.focus(); });
  filter.id = "libraryFilter";
  const summary = document.createElement("span");
  summary.className = "library-summary";
  const visibleSources = workspace.documents.filter(sourceMatchesFilter)
    .sort((a, b) => String(b.updatedAt || b.createdAt || "").localeCompare(String(a.updatedAt || a.createdAt || "")));
  summary.textContent = visibleSources.length + " of " + workspace.documents.length;
  libraryToolbar.append(filter, summary, viewButton);
  sourceList.append(libraryToolbar);
  if (!workspace.documents.length) {
    const state = document.createElement("div");
    state.className = "empty-state";
    state.innerHTML = "<strong>No documents yet</strong><span>Documents and email attachments will appear here as sources.</span>";
    sourceList.append(state);
  } else if (!visibleSources.length) {
    const state = document.createElement("div");
    state.className = "empty-state";
    state.textContent = "No documents match this filter.";
    sourceList.append(state);
  } else {
    for (const source of visibleSources) {
      const row = document.createElement("button");
      row.className = libraryView === "grid" ? "source-row source-card" : "source-row";
      row.draggable = true;
      row.setAttribute("aria-current", source.id === selectedDocumentId ? "true" : "false");
      const icon = document.createElement("span");
      icon.className = "source-icon";
      if (source.vault) {
        const health = document.createElement("span");
        health.className = "vault-health vault-health-" + (source.vault.health || "unknown");
        health.textContent = source.vault.health === "healthy" ? "LOCAL" : source.vault.health === "missing" ? "MISSING" : source.vault.health === "modified" ? "MODIFIED" : "LOCAL";
        health.title = "Local vault: " + (source.vault.health || "unknown");
        row.append(health);
      }
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = source.kind === "pdf" ? "PDF" : source.kind === "word" ? "DOCX" : source.kind === "powerpoint" ? "PPTX" : source.kind === "email" ? "✉" : source.kind === "image" ? "IMG" : "DOC";
      if (libraryView === "grid") {
        const preview = document.createElement("div");
        preview.className = "source-preview";
        if (source.kind === "image" && source.sourceRef) {
          const image = document.createElement("img");
          image.src = source.sourceRef;
          image.alt = "";
          image.loading = "lazy";
          image.addEventListener("error", () => {
            preview.replaceChildren(icon.cloneNode(true));
            preview.classList.add("source-preview-fallback");
          });
          preview.append(image);
        } else if (source.kind === "pdf" && source.sourceRef) {
          const frame = document.createElement("iframe");
          frame.src = source.sourceRef + "#page=1&toolbar=0&navpanes=0&scrollbar=0";
          frame.title = "First page preview";
          frame.setAttribute("tabindex", "-1");
          frame.setAttribute("aria-hidden", "true");
          preview.append(frame);
        } else {
          preview.append(icon.cloneNode(true));
        }
        row.append(preview);
      }
      const info = document.createElement("span");
      info.className = "source-info";
      const title = document.createElement("strong");
      title.textContent = source.title;
      const meta = document.createElement("small");
      meta.textContent = [sourceKindLabel(source.kind), ...(source.tags || []).slice(0, 2)].join(" • ");
      info.append(title, meta);
      if (libraryView === "grid" && source.description) {
        const description = document.createElement("span");
        description.className = "source-description";
        description.textContent = source.description;
        info.append(description);
      }
      const collectionButton = document.createElement("button");
      collectionButton.type = "button";
      collectionButton.className = "source-edit";
      collectionButton.textContent = customCollectionForSource(source) ? "Collection" : "Add";
      collectionButton.title = "Assign to collection";
      collectionButton.addEventListener("click", event => { event.stopPropagation(); toggleDocumentCollection(source); });
      const edit = document.createElement("button");
      edit.type = "button";
      edit.className = "source-edit";
      edit.textContent = "Edit";
      edit.title = "Edit document metadata";
      edit.addEventListener("click", event => {
        event.stopPropagation();
        openDocumentMetadataEditor(source);
      });
      row.append(icon, info, collectionButton, edit);
      row.addEventListener("click", () => {
        selectDocument(source);
        focusCanvasSource(source);
      });
      row.addEventListener("contextmenu", event => {
        event.preventDefault();
        event.stopPropagation();
        openSourceContextMenu(source);
      });
      row.addEventListener("dragstart", event => {
        event.dataTransfer.setData("application/x-evaarta-document", source.id);
        event.dataTransfer.effectAllowed = "copy";
      });
      sourceList.append(row);
    }
  }

  canvas.querySelectorAll(".workspace-card").forEach(card => card.remove());
  empty.hidden = workspace.items.length > 0;

  for (const item of workspace.items) {
    const card = document.createElement("article");
    card.className = "workspace-card";
    card.dataset.itemId = item.id;
    if (item.metadata?.libraryCard) card.dataset.sourceCard = "true";
    card.tabIndex = 0;
    if (item.id === selectedItemId || selectedItemIds.has(item.id)) card.classList.add("card-selected");
    if (selectedItemIds.has(item.id)) card.classList.add("card-multi-selected");
    if (item.id === linkSourceId) card.classList.add("card-link-source");
    if ((selectedItemId || selectedGroupId) && workspace.links.some(link => (link.fromId === item.id || link.toId === item.id))) card.classList.add("card-linked");
    if (selectedGroupId && (workspace.evidenceGroups || []).find(group => group.id === selectedGroupId)?.itemIds.includes(item.id)) card.classList.add("card-group-member");
    if (item.metadata?.sourceAware) card.classList.add("card-source-aware");
    if (selectedItemId) {
      const selectedLinks = workspace.links.filter(link => link.fromId === selectedItemId || link.toId === selectedItemId);
      if (selectedLinks.some(link => link.kind === "derived-from" && (link.fromId === item.id || link.toId === item.id))) {
        card.classList.add("card-evidence-related");
      }
    }
    card.addEventListener("click", event => {
      if (event.shiftKey) {
        toggleItemMultiSelection(item);
        return;
      }
      selectItem(item);
      const source = sourceForItem(item);
      if (source) {
        selectedDocumentId = source.id;
        focusLibrarySource(source);
      }
    });
    if (sourceForItem(item) && item.metadata?.libraryCard) {
      card.addEventListener("contextmenu", event => {
        event.preventDefault();
        event.stopPropagation();
        openSourceContextMenu(sourceForItem(item));
      });
    }
    card.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); selectItem(item); } });

    const kind = document.createElement("span");
    kind.className = "card-kind";
    kind.textContent = item.metadata?.libraryCard ? "SOURCE" : item.kind;
    const title = document.createElement("h3");
    title.textContent = itemLabel(item);
    const body = document.createElement("p");
    body.textContent = item.text || "";
    card.append(kind, title, body);
    if (item.metadata?.sourceAware) {
      const evidence = document.createElement("span");
      evidence.className = "card-evidence-label";
      evidence.textContent = "Evidence excerpt";
      card.append(evidence);
    }

    const source = sourceForItem(item);
    if (source) {
      if (item.metadata?.libraryCard) {
        const preview = document.createElement("div");
        preview.className = "workspace-source-preview";
        if (source.kind === "image" && source.sourceRef) {
          const image = document.createElement("img");
          image.src = source.sourceRef;
          image.alt = source.title || "Document preview";
          image.loading = "lazy";
          image.addEventListener("error", () => {
            preview.textContent = sourceKindLabel(source.kind);
            preview.classList.add("workspace-source-preview-fallback");
          });
          preview.append(image);
        } else if (source.kind === "pdf" && source.sourceRef) {
          const frame = document.createElement("iframe");
          frame.src = source.sourceRef + "#page=1&toolbar=0&navpanes=0&scrollbar=0";
          frame.title = "First page preview";
          frame.setAttribute("tabindex", "-1");
          frame.setAttribute("aria-hidden", "true");
          preview.append(frame);
        } else {
          preview.textContent = sourceKindLabel(source.kind);
          preview.classList.add("workspace-source-preview-fallback");
        }
        preview.title = "Open source";
        preview.addEventListener("click", event => {
          event.stopPropagation();
          selectDocument(source);
        });
        preview.setAttribute("role", "button");
        preview.setAttribute("tabindex", "0");
        preview.addEventListener("keydown", event => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            event.stopPropagation();
            selectDocument(source);
          }
        });
        card.append(preview);

        const sourceMeta = document.createElement("div");
        sourceMeta.className = "source-card-meta";
        const type = document.createElement("span");
        type.textContent = sourceKindLabel(source.kind);
        const tags = document.createElement("span");
        tags.textContent = (source.tags || []).slice(0, 3).map(tag => "#" + tag).join(" ");
        sourceMeta.append(type);
        if (tags.textContent) sourceMeta.append(tags);
        card.append(sourceMeta);
      } else {
        const badge = document.createElement("span");
        badge.className = "card-source";
        badge.textContent = "Source • " + source.title;
        card.append(badge);
      }

      const collections = collectionsForSource(source);
      if (collections.length) {
        const collectionRow = document.createElement("div");
        collectionRow.className = "card-collection-row";
        for (const collection of collections) {
          const chip = document.createElement("button");
          chip.type = "button";
          chip.className = "card-collection-chip";
          chip.textContent = collection.name;
          chip.title = "Show this collection in the Document Library";
          chip.addEventListener("click", event => {
            event.stopPropagation();
            showSourceCollection(collection);
          });
          collectionRow.append(chip);
        }
        card.append(collectionRow);
      }
    }

    const groupBadges = groupsForItem(item);
    if (groupBadges.length) {
      const groupRow = document.createElement("div");
      groupRow.className = "evidence-group-row";
      for (const group of groupBadges) {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "evidence-group-chip";
        chip.textContent = "Evidence • " + evidenceGroupLabel(group);
        chip.title = "Select this evidence group";
        chip.addEventListener("click", event => { event.stopPropagation(); selectEvidenceGroup(group); });
        groupRow.append(chip);
      }
      card.append(groupRow);
    }

    const controls = document.createElement("div");
    controls.className = "card-controls";
    if (item.kind === "note") {
      const edit = document.createElement("button");
      edit.textContent = "Edit";
      edit.addEventListener("click", event => { event.stopPropagation(); editNote(item); });
      controls.append(edit);
    }
    if (source && item.metadata?.libraryCard) {
      const open = document.createElement("button");
      open.textContent = "Open";
      open.title = "Open this document";
      open.addEventListener("click", event => { event.stopPropagation(); selectDocument(source); });
      controls.append(open);

      const metadata = document.createElement("button");
      metadata.textContent = "Metadata";
      metadata.addEventListener("click", event => { event.stopPropagation(); openDocumentMetadataEditor(source); });
      controls.append(metadata);

      const remove = document.createElement("button");
      remove.textContent = "Remove";
      remove.title = "Remove this source card from the workspace";
      remove.addEventListener("click", event => {
        event.stopPropagation();
        workspace.items = workspace.items.filter(candidate => candidate.id !== item.id);
        selectedItemId = null;
        workspace.updatedAt = new Date().toISOString();
        saveWorkspace();
        indexWorkspace();
        render();
      });
      controls.append(remove);
    }
    if (item.anchor?.documentId && !item.metadata?.libraryCard) {
      const jump = document.createElement("button");
      jump.textContent = item.metadata?.sourceAware ? "Jump to evidence" : "Jump to source";
      jump.title = item.metadata?.sourceAware
        ? "Open the source at this evidence"
        : "Open the source at this anchor";
      jump.addEventListener("click", event => {
        event.stopPropagation();
        selectItem(item);
      });
      controls.append(jump);
    }
    if (item.kind === "annotation" || item.metadata?.sourceAware || item.kind === "excerpt") {
      const group = document.createElement("button");
      group.textContent = groupsForItem(item).length ? "Group…" : "Group evidence";
      group.title = "Add this item to an evidence group";
      group.addEventListener("click", event => { event.stopPropagation(); createEvidenceGroupFromItem(item); });
      controls.append(group);
    }

    const link = document.createElement("button");
    link.textContent = linkSourceId === item.id ? "Select target…" : "Link";
    link.className = linkSourceId === item.id ? "link-active" : "";
    link.addEventListener("click", event => { event.stopPropagation(); linkItem(item); });
    controls.append(link);
    card.append(controls);

    if (item.anchor?.page) {
      const anchor = document.createElement("span");
      anchor.className = "source-anchor";
      anchor.textContent = "Source • page " + item.anchor.page;
      card.append(anchor);
    }

    const itemLinks = workspace.links.filter(link => link.fromId === item.id || link.toId === item.id);
    if (itemLinks.length) {
      const chips = document.createElement("div");
      chips.className = "link-chip-row";
      for (const link of itemLinks) {
        const otherId = link.fromId === item.id ? link.toId : link.fromId;
        const chip = document.createElement("button");
        chip.className = "link-chip";
        chip.dataset.kind = link.kind;
        chip.textContent = linkLabel(link.kind) + " • " + graphEntityLabel(findGraphEntity(otherId));
        chip.addEventListener("click", event => { event.stopPropagation(); selectLink(link); });
        chips.append(chip);
      }
      card.append(chips);
    }
    canvas.append(card);
  }
  layoutCards();
  renderRelationshipInspector();
  requestAnimationFrame(renderGraphEdges);
}

function renderSearchResults(query = "") {
  const list = document.getElementById("searchResults");
  list.replaceChildren();
  const indexed = searchIndex(contentIndex, query);
  const results = indexed.length ? indexed : searchWorkspace(workspace, query);
  if (!query.trim()) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "Search sources, excerpts, notes and annotations.";
    list.append(empty);
    return;
  }
  if (!results.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No matching workspace content.";
    list.append(empty);
    return;
  }
  for (const result of results) {
    const row = document.createElement("article");
    row.className = "search-result";
    const title = document.createElement("strong");
    title.textContent = result.title;
    const type = document.createElement("span");
    type.textContent = result.type;
    const text = document.createElement("p");
    text.textContent = result.excerpt || result.text;
    const location = document.createElement("small");
    location.textContent = result.page ? `Page ${result.page}` : result.kind;
    row.append(title, type, location, text);
    const source = result.documentId
      ? workspace.documents.find(document => document.id === result.documentId)
      : null;
    if (source) {
      const collections = collectionsForSource(source);
      if (collections.length) {
        const badges = document.createElement("div");
        badges.className = "search-collections";
        badges.textContent = collections.map(collection => collection.name).join(" • ");
        row.append(badges);
      }
    }
    row.addEventListener("click", () => {
      if (result.type === "document") {
        const source = workspace.documents.find(document => document.id === result.documentId);
        if (source) selectDocument(source);
      } else if (result.type === "email-body" || result.kind === "email-body") {
        if (result.sourceRef) {
          try {
            window.openDialog("chrome://messenger/content/messageWindow.xhtml", "_blank", "chrome,dialog=no,all", result.sourceRef);
          } catch (error) { console.error("e-Vaarta: unable to open indexed email", error); }
        }
      } else if (result.page && result.sourceRef) {
        const source = workspace.documents.find(document => document.id === result.documentId);
        if (source) selectDocument(source, result.page);
      } else {
        const item = findItem(result.id);
        if (item) {
          selectedItemId = item.id;
          jumpToSource(item);
          render();
        }
      }
    });
    list.append(row);
  }
}

function saveCurrentSearchAsCollection() {
  const query = document.getElementById("workspaceSearchInput").value.trim();
  if (!query) return;
  const name = prompt("Name for saved search", query);
  if (!name?.trim()) return;
  const collection = createCollection({ name: name.trim(), description: "Saved search: " + query });
  workspace = addCollection(workspace, collection);
  setCollectionRule(workspace, collection.id, { text: query });
  saveWorkspace();
  render();
}

function toggleSearch(open = true) {
  document.getElementById("searchPane").hidden = !open;
  if (open) {
    const input = document.getElementById("workspaceSearchInput");
    input.focus();
    renderSearchResults(input.value);
  }
}

function annotations() {
  return workspace.items.filter(item => item.kind === "annotation");
}

function toggleAnnotationPanel(open = !annotationPanelOpen) {
  annotationPanelOpen = open;
  document.getElementById("annotationPane").hidden = !open;
  if (open) renderAnnotations();
}

function removeAnnotation(item) {
  if (!item || !confirm("Remove this annotation?")) return;
  workspace.items = workspace.items.filter(candidate => candidate.id !== item.id);
  workspace.links = workspace.links.filter(link => link.fromId !== item.id && link.toId !== item.id);
  workspace.updatedAt = new Date().toISOString();
  saveWorkspace();
  renderAnnotations();
  render();
}

function editAnnotation(item) {
  annotationEditorItemId = item.id;
  editorMode = "annotation";
  const editor = document.getElementById("itemEditor");
  document.getElementById("editorHeading").textContent = "Edit annotation";
  document.getElementById("editorTitle").value = item.title || "Annotation";
  document.getElementById("editorText").value = item.text || "";
  document.getElementById("editorPage").value = item.anchor?.page || "";
  document.getElementById("annotationType").value = item.annotationType || "highlight";
  document.getElementById("annotationColor").value = item.color || "#ffdc00";
  document.getElementById("editorSourceFields").hidden = false;
  document.getElementById("annotationEditorFields").hidden = false;
  editor.showModal();
}

function renderAnnotations() {
  const list = document.getElementById("annotationList");
  list.replaceChildren();
  const items = annotations();
  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No annotations yet.";
    list.append(empty);
    return;
  }
  for (const item of items) {
    const row = document.createElement("article");
    row.className = "annotation-row";
    const title = document.createElement("strong");
    title.textContent = item.title || item.annotationType || "Annotation";
    const text = document.createElement("p");
    text.textContent = item.text || item.anchor?.quote || "";
    const meta = document.createElement("span");
    meta.textContent = (item.annotationType || "highlight") + (item.anchor?.page ? " • page " + item.anchor.page : "");
    row.classList.toggle("annotation-selected", item.id === selectedItemId);
    row.addEventListener("click", event => {
      if (event.target instanceof HTMLButtonElement) return;
      selectItem(item);
      if (annotationPanelOpen) renderAnnotations();
    });
    const jump = document.createElement("button");
    jump.textContent = "Jump to annotation";
    jump.addEventListener("click", () => {
      selectItem(item);
      if (annotationPanelOpen) renderAnnotations();
    });
    const edit = document.createElement("button");
    edit.textContent = "Edit";
    edit.addEventListener("click", () => editAnnotation(item));
    const remove = document.createElement("button");
    remove.textContent = "Delete";
    remove.className = "quiet";
    remove.addEventListener("click", () => removeAnnotation(item));
    row.append(title, text, meta, jump, edit, remove);
    list.append(row);
  }
}

function addNote() {
  openEditor("note");
}

async function openDocument() {
  const picker = Cc["@mozilla.org/filepicker;1"].createInstance(Ci.nsIFilePicker);
  picker.init(window, "Open document", Ci.nsIFilePicker.modeOpen);
  picker.appendFilter("PDF documents", "*.pdf");
  picker.appendFilter("Office documents", "*.doc;*.docx;*.ppt;*.pptx");
  picker.appendFilters(Ci.nsIFilePicker.filterAll);
  const result = await new Promise(resolve => picker.open(resolve));
  if (result != Ci.nsIFilePicker.returnOK || !picker.file) return;
  const file = picker.file;
  const lowerName = file.leafName.toLowerCase();
  const kind = lowerName.endsWith(".pdf")
    ? "pdf"
    : lowerName.endsWith(".docx") ? "word"
    : lowerName.endsWith(".pptx") ? "powerpoint"
    : "other";
  const mimeType = kind === "pdf"
    ? "application/pdf"
    : kind === "word"
      ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      : kind === "powerpoint"
        ? "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        : null;
  let vault = null;
  try {
    const sourceHash = await sha256File(file.path);
    const duplicate = vaultDocumentsByHash(sourceHash)[0];
    if (duplicate?.vault) {
      selectDocument(duplicate);
      updateOfflineStatus("Offline • existing local copy");
      return;
    }
    vault = await importIntoLocalVault(file.path, file.leafName, mimeType);
  } catch (error) {
    console.error("e-Vaarta: failed to copy source into local vault", error);
  }
  const source = createDocument({
    title: file.leafName,
    kind,
    sourceRef: Services.io.newFileURI(file).spec,
    mimeType,
    vault,
  });
  if (vault) attachVaultRecord(source, vault);
  workspace = addDocument(workspace, source);
  workspace.updatedAt = new Date().toISOString();
  saveWorkspace();
  selectDocument(source);
  if (source.kind === "word" || source.kind === "powerpoint") {
    indexOfficeSource(source);
  } else if (source.kind === "image") {
    indexOcrSource(source);
  }
}

function selectDocument(source, page = null, anchor = null) {
  selectedDocumentId = source.id;
  document.getElementById("sourceTitle").textContent = source.title;
  document.getElementById("sourceLocation").textContent = source.kind.toUpperCase();
  document.getElementById("openEmailSourceButton").hidden = source.kind !== "email";
  const sourceRef = source.sourceRef || "about:blank";
  document.getElementById("sourceViewer").src = page && source.kind === "pdf" ? sourceRef + "#page=" + page : sourceRef;
  const viewer = document.getElementById("sourceViewer");
  viewer.addEventListener("load", () => {
    attachSourceSelectionBridge(source);
    if (anchor?.quote) {
      setTimeout(() => {
        restoringSourceAnchor = true;
        restorePdfHighlight(anchor);
        restorePdfAnchor(anchor);
        window.setTimeout(() => { restoringSourceAnchor = false; }, 100);
      }, 250);
    }
  }, { once: true });
  render();
}

let activeSourceSelection = null;
const selectionCleanup = new WeakMap();

function selectionRects(range, win) {
  try {
    return [...range.getClientRects()].map(rect => ({
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    }));
  } catch (error) {
    return [];
  }
}

function pdfSelector(range, page) {
  try {
    const node = range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
      ? range.commonAncestorContainer
      : range.commonAncestorContainer.parentElement;
    const pageElement = node?.closest?.(".page[data-page-number]");
    if (!pageElement) return null;
    const textLayer = pageElement.querySelector(".textLayer");
    if (!textLayer) return null;
    const spans = [...textLayer.querySelectorAll("span")];
    const selected = spans.filter(span => {
      try {
        const r = range.getBoundingClientRect();
        const s = span.getBoundingClientRect();
        return r.bottom >= s.top && r.top <= s.bottom && r.right >= s.left && r.left <= s.right;
      } catch (error) { return false; }
    });
    return {
      type: "pdfjs-text-layer",
      page,
      spanIndexes: selected.map(span => spans.indexOf(span)).filter(index => index >= 0),
    };
  } catch (error) {
    return null;
  }
}

async function renderPdfPagesForOcr(frameWindow) {
  const application = frameWindow?.wrappedJSObject?.PDFViewerApplication;
  const pdfDocument = application?.pdfDocument;
  if (!pdfDocument) return [];
  const pages = [];
  for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber++) {
    try {
      const page = await pdfDocument.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = frameWindow.document.createElement("canvas");
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const context = canvas.getContext("2d", { willReadFrequently: true });
      await page.render({ canvasContext: context, viewport }).promise;
      pages.push({ pageNumber, canvas });
    } catch (error) {
      console.warn("e-Vaarta: unable to render PDF page for OCR", pageNumber, error);
    }
  }
  return pages;
}

async function indexOcrSource(source, pageCanvases = null) {
  if (!source || !["pdf", "image"].includes(source.kind) || !isOcrAvailable()) return;
  try {
    if (source.kind === "pdf" && pageCanvases?.length) {
      for (const { pageNumber, canvas } of pageCanvases) {
        const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
        if (!blob) continue;
        const bytes = new Uint8Array(await blob.arrayBuffer());
        const tempPath = PathUtils.join(PathUtils.tempDir, `evaarta-ocr-${crypto.randomUUID()}.png`);
        await IOUtils.write(tempPath, bytes);
        try {
          const tempFile = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);\n          tempFile.initWithPath(tempPath);\n          const sourceRef = Services.io.newFileURI(tempFile).spec;
          const result = await extractOcrText({
            id: source.id + "-page-" + pageNumber,
            sourceRef,
            title: source.title + " — page " + pageNumber,
            kind: "image",
            mimeType: "image/png",
          });
          if (!result?.text?.trim()) continue;
          const fingerprint = fingerprintText(result.text);
          const kind = "ocr-text-page";
          if (!needsReindex(contentIndex, source.id + "-page-" + pageNumber, kind, fingerprint)) continue;
          contentIndex = upsertExtractedContent(contentIndex, {
            documentId: source.id + "-page-" + pageNumber,
            sourceRef: source.sourceRef,
            title: source.title,
            kind,
            text: result.text,
            metadata: {
              mimeType: "application/pdf",
              page: pageNumber,
              language: result.language,
              confidence: result.confidence,
            },
            fingerprint,
          });
        } finally {
          await IOUtils.remove(tempPath, { ignoreAbsent: true });
        }
      }
      saveContentIndex();
      return;
    }

    const result = await extractOcrText({
      id: source.id,
      sourceRef: source.sourceRef,
      title: source.title,
      kind: source.kind,
      mimeType: source.mimeType,
    });
    if (!result?.text?.trim()) return;
    const fingerprint = fingerprintText(result.text);
    if (!needsReindex(contentIndex, source.id, "ocr-text", fingerprint)) return;
    contentIndex = upsertExtractedContent(contentIndex, {
      documentId: source.id,
      sourceRef: source.sourceRef,
      title: source.title,
      kind: "ocr-text",
      text: result.text,
      metadata: {
        mimeType: source.mimeType,
        language: result.language,
        confidence: result.confidence,
        pages: result.pages,
      },
      fingerprint,
    });
    saveContentIndex();
  } catch (error) {
    console.warn("e-Vaarta: OCR indexing unavailable", error);
  }
}

function indexOfficeSource(source) {
  if (!source || !["word", "powerpoint"].includes(source.kind)) return;
  try {
    const text = extractOfficeText(source.sourceRef, source.kind);
    if (!text) return;
    const fingerprint = fingerprintText(text);
    if (!needsReindex(contentIndex, source.id, "office-text", fingerprint)) return;
    contentIndex = upsertExtractedContent(contentIndex, {
      documentId: source.id,
      sourceRef: source.sourceRef,
      title: source.title,
      kind: "office-text",
      text,
      metadata: {
        mimeType: source.mimeType || (source.kind === "word"
          ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          : "application/vnd.openxmlformats-officedocument.presentationml.presentation"),
      },
      fingerprint,
    });
    saveContentIndex();
  } catch (error) {
    console.warn("e-Vaarta: Office text indexing unavailable", error);
  }
}

function indexPdfSource(source, frameWindow) {
  if (!source || source.kind !== "pdf" || !frameWindow) return;
  try {
    const pages = [...frameWindow.document.querySelectorAll(".page")];
    const text = pages.map(page => page.innerText || "").join("\n").replace(/\s+/g, " ").trim();
    if (!text) return;
    const fingerprint = fingerprintText(text);
    if (!needsReindex(contentIndex, source.id, "pdf-text", fingerprint)) return;
    contentIndex = upsertExtractedContent(contentIndex, {
      documentId: source.id,
      sourceRef: source.sourceRef,
      title: source.title,
      kind: "pdf-text",
      text,
      metadata: { mimeType: "application/pdf", pageCount: pages.length },
      fingerprint,
    });
    saveContentIndex();
  } catch (error) {
    console.warn("e-Vaarta: PDF text indexing unavailable", error);
  }
}

function inspectPdfSelection(frameWindow) {
  let selection;
  try { selection = frameWindow.getSelection(); } catch (error) { return null; }
  const text = selection?.toString().trim();
  if (!text || !selection.rangeCount) return null;
  const range = selection.getRangeAt(0);
  let page = null;
  let node = range.commonAncestorContainer;
  if (node.nodeType !== node.ELEMENT_NODE) node = node.parentElement;
  try {
    const pageElement = node?.closest?.(".page[data-page-number]");
    if (pageElement) page = Number(pageElement.dataset.pageNumber) || null;
  } catch (error) {}
  return {
    text,
    page,
    startOffset: range.startOffset,
    endOffset: range.endOffset,
    selector: pdfSelector(range, page),
    rects: selectionRects(range, frameWindow),
  };
}

function rememberSourceSelection(source, selection) {
  if (!selection?.text || restoringSourceAnchor) return;
  activeSourceSelection = {
    documentId: source.id,
    page: selection.page,
    quote: selection.text,
    startOffset: selection.startOffset,
    endOffset: selection.endOffset,
    selector: selection.selector || null,
    rects: selection.rects || null,
  };
  document.getElementById("sourceSelectionStatus").textContent =
    selection.page ? "Selection ready • page " + selection.page : "Selection ready";
}

function attachSelectionBridge(source, frameWindow, seen = new Set()) {
  if (!frameWindow || seen.has(frameWindow)) return;
  seen.add(frameWindow);
  const onSelectionChange = () => {
    const selection = inspectPdfSelection(frameWindow);
    if (selection) {
      rememberSourceSelection(source, selection);
      syncAnnotationFromSelection(source, selection);
    }
  };
  try {
    frameWindow.document.addEventListener("selectionchange", onSelectionChange, true);
    for (const frame of frameWindow.frames) attachSelectionBridge(source, frame, seen);
  } catch (error) {}
}

function attachSourceSelectionBridge(source) {
  const viewer = document.getElementById("sourceViewer");
  if (!viewer) return;
  activeSourceSelection = null;
  document.getElementById("sourceSelectionStatus").textContent = "Select text in the source reader.";
  try {
    attachSelectionBridge(source, viewer.contentWindow);
    indexPdfSource(source, viewer.contentWindow);
    if (source.kind === "pdf") {
      const pages = [...viewer.contentWindow.document.querySelectorAll(".page[data-page-number]")];
      const nativePages = new Set(
        pages
          .filter(page => (page.innerText || "").trim())
          .map(page => Number(page.dataset.pageNumber))
      );
      renderPdfPagesForOcr(viewer.contentWindow)
        .then(renderedPages =>
          indexOcrSource(
            source,
            renderedPages.filter(({ pageNumber }) => !nativePages.has(pageNumber))
          )
        )
        .catch(error => console.warn("e-Vaarta: PDF OCR rendering failed", error));
    }
  } catch (error) {
    console.warn("e-Vaarta: PDF selection bridge unavailable", error);
  }
}

function selectionForCurrentSource() {
  const source = workspace.documents.find(document => document.id === selectedDocumentId);
  if (!source || activeSourceSelection?.documentId !== source.id) return null;
  return activeSourceSelection;
}

function captureSelection() {
  const source = workspace.documents.find(document => document.id === selectedDocumentId) || workspace.documents[0];
  if (!source) { alert("Open a document first."); return; }
  const selection = selectionForCurrentSource();
  if (!selection?.quote) { alert("Select text in the source reader first."); return; }
  workspace = addItem(workspace, createExcerpt({
    anchor: createSourceAnchor({
      documentId: source.id,
      page: selection.page,
      startOffset: selection.startOffset,
      endOffset: selection.endOffset,
      quote: selection.quote,
      selector: selection.selector,
      rects: selection.rects,
    }),
    title: "Selected excerpt",
    text: selection.quote,
  }));
  saveWorkspace();
  render();
}

function annotateSelection() {
  const source = workspace.documents.find(document => document.id === selectedDocumentId) || workspace.documents[0];
  if (!source) { alert("Open a document first."); return; }
  const selection = selectionForCurrentSource();
  if (!selection?.quote) { alert("Select text in the source reader first."); return; }
  workspace = addItem(workspace, createAnnotation({
    anchor: createSourceAnchor({
      documentId: source.id,
      page: selection.page,
      startOffset: selection.startOffset,
      endOffset: selection.endOffset,
      quote: selection.quote,
      selector: selection.selector,
      rects: selection.rects,
    }),
    annotationType: "highlight",
    color: document.getElementById("annotationColor")?.value || "#ffdc00",
    text: selection.quote,
  }));
  saveWorkspace();
  render();
}

function addExcerpt(options = {}) {
  const source = workspace.documents.find(document => document.id === selectedDocumentId) || workspace.documents[0];
  if (!source) {
    alert("Open a document first.");
    return;
  }
  openEditor("excerpt", null, options);
}

function clearWorkspace() {
  workspace.items = [];
  workspace.documents = [];
  workspace.links = [];
  selectedItemId = null;
  selectedLinkId = null;
  linkSourceId = null;
  saveWorkspace();
  render();
}

window.addEventListener("DOMContentLoaded", async () => {
  updateOcrStatus();
  updateOfflineStatus("Offline storage: preparing…", false);
  try { await ensureOfflineStorage(); } catch (error) {
    await migrateLegacyVaultRecords();
    await reconcileVaultManifest();
    console.error("e-Vaarta: offline storage unavailable", error);
    updateOfflineStatus("Offline • recovery mode", false);
  }
  workspace = await loadWorkspace();
  contentIndex = await loadContentIndex();
  indexWorkspace();
  saveWorkspace();
  document.getElementById("newNoteButton").addEventListener("click", addNote);
  document.getElementById("openEmailSourceButton").addEventListener("click", openSelectedEmailSource);
  document.getElementById("openDocumentButton").addEventListener("click", openDocument);
  document.getElementById("addExcerptButton").addEventListener("click", addExcerpt);
  document.getElementById("captureSelectionButton").addEventListener("click", captureSelection);
  document.getElementById("annotateSelectionButton").addEventListener("click", annotateSelection);
  document.getElementById("annotationPanelButton").addEventListener("click", () => toggleAnnotationPanel(true));
  document.getElementById("createEvidenceGroupSelectionButton").addEventListener("click", createEvidenceGroupFromSelection);
  document.getElementById("evidenceNavigatorPrevButton").addEventListener("click", () => { navigateEvidenceGroup(-1); renderEvidenceNavigator(); });
  document.getElementById("evidenceNavigatorNextButton").addEventListener("click", () => { navigateEvidenceGroup(1); renderEvidenceNavigator(); });
  document.getElementById("evidenceNavigatorCloseButton").addEventListener("click", () => document.getElementById("evidenceNavigator").close());
  document.getElementById("clearEvidenceSelectionButton").addEventListener("click", clearMultiSelection);
  document.getElementById("evidenceGroupsButton").addEventListener("click", openEvidenceGroups);
  document.getElementById("evidenceGroupsCloseButton").addEventListener("click", () => document.getElementById("evidenceGroupsPane").close());
  document.getElementById("newEvidenceGroupButton").addEventListener("click", createEvidenceGroupFromManager);
  document.getElementById("searchButton").addEventListener("click", () => toggleSearch(true));
  document.getElementById("closeSearchButton").addEventListener("click", () => toggleSearch(false));
  document.getElementById("workspaceSearchInput").addEventListener("input", event => renderSearchResults(event.target.value));
  document.getElementById("saveSearchButton").addEventListener("click", saveCurrentSearchAsCollection);
  document.getElementById("closeAnnotationPanelButton").addEventListener("click", () => toggleAnnotationPanel(false));
  document.getElementById("clearButton").addEventListener("click", clearWorkspace);
  document.getElementById("cancelLinkButton").addEventListener("click", cancelLinkMode);
  document.getElementById("collectionManagerButton").addEventListener("click", openCollectionManager);
  document.getElementById("vaultManagerButton").addEventListener("click", openVaultManager);
  document.getElementById("vaultManagerRepairButton").addEventListener("click", async () => {
    await repairVaultManifest();
    await openVaultManager();
  });
  document.getElementById("vaultManagerCollectButton").addEventListener("click", async () => {
    const removed = await garbageCollectVault();
    Services.prompt.alert(window, "e-Vaarta", removed + " orphaned vault file" + (removed === 1 ? "" : "s") + " removed.");
    await openVaultManager();
  });
  document.getElementById("vaultManagerCloseButton").addEventListener("click", () => document.getElementById("vaultManager").close());
  document.getElementById("sourceContextCloseButton").addEventListener("click", closeSourceContextMenu);
  document.getElementById("sourceContextOpenButton").addEventListener("click", sourceContextOpen);
  document.getElementById("sourceContextMetadataButton").addEventListener("click", sourceContextMetadata);
  document.getElementById("sourceContextCollectionButton").addEventListener("click", sourceContextCollection);
document.getElementById("sourceContextVaultRecoverButton").addEventListener("click", sourceContextVaultRecover);
  document.getElementById("sourceContextVaultDetachButton").addEventListener("click", sourceContextVaultDetach);
  document.getElementById("sourceContextExcerptButton").addEventListener("click", sourceContextAddExcerpt);
  document.getElementById("sourceContextRemoveButton").addEventListener("click", sourceContextRemoveCard);
  document.getElementById("collectionManagerCloseButton").addEventListener("click", closeCollectionManager);
  document.getElementById("newCollectionButton").addEventListener("click", createCustomCollection);
  document.getElementById("ruleEditorCloseButton").addEventListener("click", () => document.getElementById("collectionRuleEditor").close());
  document.getElementById("ruleCancelButton").addEventListener("click", () => document.getElementById("collectionRuleEditor").close());
  document.getElementById("ruleSaveButton").addEventListener("click", event => {
    event.preventDefault();
    const collection = workspace.collections.find(item => item.id === selectedCustomCollectionId);
    if (collection) saveCollectionRule(collection);
    document.getElementById("collectionRuleEditor").close();
  });
  document.getElementById("metadataCloseButton").addEventListener("click", closeDocumentMetadataEditor);
  document.getElementById("metadataCancelButton").addEventListener("click", closeDocumentMetadataEditor);
  document.getElementById("documentMetadataForm").addEventListener("submit", event => {
    event.preventDefault();
    saveDocumentMetadata();
  });
  document.getElementById("editorCloseButton").addEventListener("click", closeEditor);
  document.getElementById("editorCancelButton").addEventListener("click", closeEditor);
  document.getElementById("itemEditorForm").addEventListener("submit", event => {
    event.preventDefault();
    saveEditor();
  });
  installCanvasDropTarget();
  document.getElementById("editorCloseButton").addEventListener("click", closeEditor);
  document.getElementById("editorCancelButton").addEventListener("click", closeEditor);
  document.getElementById("itemEditorForm").addEventListener("submit", event => {
    event.preventDefault();
    saveEditor();
  });
  window.addEventListener("resize", () => { layoutCards(); requestAnimationFrame(renderGraphEdges); });
  render();
  if (workspace.documents[0]) selectDocument(workspace.documents[0]);
}
