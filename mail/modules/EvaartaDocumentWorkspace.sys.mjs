/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Core data model for e-Vaarta's document workspace.
 *
 * The model deliberately stores semantic objects rather than rendered pixels:
 * documents, source anchors, excerpts, notes, annotations and links. This
 * allows desktop, Android and iOS clients to present the same workspace while
 * keeping the original source context addressable.
 */

export const EVAARTA_DOCUMENT_MODEL_VERSION = 5;

export const DocumentKind = Object.freeze({
  PDF: "pdf",
  WORD: "word",
  POWERPOINT: "powerpoint",
  IMAGE: "image",
  WEB: "web",
  EMAIL: "email",
  OTHER: "other",
});

export const WorkspaceItemKind = Object.freeze({
  EXCERPT: "excerpt",
  NOTE: "note",
  ANNOTATION: "annotation",
});

export const LinkKind = Object.freeze({
  RELATES_TO: "relates-to",
  SUPPORTS: "supports",
  CONTRADICTS: "contradicts",
  DERIVED_FROM: "derived-from",
  REFERENCES: "references",
});

function id(prefix) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function now() {
  return new Date().toISOString();
}

export function createLocalVaultRecord(options = {}) {
  return {
    vaultId: options.vaultId || id("vault"),
    relativePath: options.relativePath || null,
    originalName: options.originalName || null,
    size: Number.isFinite(options.size) ? options.size : null,
    mimeType: options.mimeType || null,
    sha256: options.sha256 || null,
    importedAt: options.importedAt || now(),
    health: options.health || "unknown",
  };
}

export function createDocument({
  title,
  kind = DocumentKind.OTHER,
  sourceRef = null,
  mimeType = null,
  tags = [],
  description = "",
  vault = null,
}) {
  if (!title?.trim()) {
    throw new TypeError("A document title is required.");
  }

  return {
    id: id("doc"),
    title: title.trim(),
    kind,
    sourceRef,
    mimeType,
    description,
    tags: [...new Set(tags.filter(Boolean).map(tag => String(tag).trim()).filter(Boolean))],
    createdAt: now(),
    updatedAt: now(),
    vault,
  };
}

export function createSourceAnchor({
  documentId,
  page = null,
  startOffset = null,
  endOffset = null,
  quote = null,
  selector = null,
  rects = null,
}) {
  if (!documentId) {
    throw new TypeError("documentId is required.");
  }
  return {
    documentId,
    page,
    startOffset,
    endOffset,
    quote,
    selector,
    rects,
  };
}

export function createExcerpt({ anchor, text, title = null }) {
  if (!anchor?.documentId) {
    throw new TypeError("An excerpt requires a source anchor.");
  }
  if (!text?.trim()) {
    throw new TypeError("An excerpt requires source text.");
  }

  return {
    id: id("excerpt"),
    kind: WorkspaceItemKind.EXCERPT,
    title,
    text: text.trim(),
    anchor,
    createdAt: now(),
    updatedAt: now(),
  };
}

export function createNote({ text = "", title = null }) {
  return {
    id: id("note"),
    kind: WorkspaceItemKind.NOTE,
    title,
    text,
    createdAt: now(),
    updatedAt: now(),
  };
}

export function createAnnotation({
  anchor,
  annotationType = "highlight",
  text = null,
  color = null,
}) {
  if (!anchor?.documentId) {
    throw new TypeError("An annotation requires a source anchor.");
  }

  return {
    id: id("annotation"),
    kind: WorkspaceItemKind.ANNOTATION,
    annotationType,
    text,
    color,
    anchor,
    createdAt: now(),
    updatedAt: now(),
  };
}

export function createLink({fromId, toId, kind = LinkKind.RELATES_TO}) {
  if (!fromId || !toId) {
    throw new TypeError("A link requires both endpoints.");
  }
  if (fromId === toId) {
    throw new TypeError("A workspace item cannot link to itself.");
  }
  if (!Object.values(LinkKind).includes(kind)) {
    throw new TypeError(`Unsupported relationship kind: ${kind}`);
  }

  return {
    id: id("link"),
    fromId,
    toId,
    kind,
    createdAt: now(),
  };
}

export function createLibraryEntry({ documentId, workspaceId = null, text = "", title = null, kind = "document" }) {
  if (!documentId) throw new TypeError("documentId is required.");
  return {
    id: id("index"),
    documentId,
    workspaceId,
    kind,
    title,
    text: text?.trim() || "",
    createdAt: now(),
    updatedAt: now(),
  };
}

export function searchWorkspace(workspace, query) {
  const needle = String(query || "").trim().toLocaleLowerCase();
  if (!needle) return [];
  const results = [];
  for (const document of workspace.documents || []) {
    const haystack = [document.title, document.description, ...(document.tags || [])].join(" ").toLocaleLowerCase();
    if (haystack.includes(needle)) {
      results.push({ type: "document", id: document.id, title: document.title, text: document.description || "", documentId: document.id });
    }
  }
  for (const item of workspace.items || []) {
    const source = workspace.documents.find(document => document.id === item.anchor?.documentId);
    const haystack = [item.title, item.text, item.anchor?.quote, source?.title].join(" ").toLocaleLowerCase();
    if (haystack.includes(needle)) {
      results.push({ type: item.kind, id: item.id, title: item.title || item.kind, text: item.text || item.anchor?.quote || "", documentId: item.anchor?.documentId || null });
    }
  }
  return results;
}

export function createWorkspace({name, description = ""}) {
  if (!name?.trim()) {
    throw new TypeError("A workspace name is required.");
  }

  return {
    modelVersion: EVAARTA_DOCUMENT_MODEL_VERSION,
    id: id("workspace"),
    name: name.trim(),
    description,
    documents: [],
    collections: [],
    evidenceGroups: [],
    items: [],
    links: [],
    createdAt: now(),
    updatedAt: now(),
  };
}

export function createEvidenceGroup({ name, description = "", documentId = null } = {}) {
  if (!name?.trim()) throw new TypeError("An evidence group name is required.");
  return {
    id: id("evidence-group"),
    name: name.trim(),
    description: String(description || "").trim(),
    documentId,
    itemIds: [],
    createdAt: now(),
    updatedAt: now(),
  };
}

export function addEvidenceGroup(workspace, group) {
  workspace.evidenceGroups ||= [];
  if (workspace.evidenceGroups.some(existing =>
    existing.id === group.id ||
    existing.name.toLocaleLowerCase() === group.name.toLocaleLowerCase()
  )) return workspace;
  workspace.evidenceGroups.push(group);
  workspace.updatedAt = now();
  return workspace;
}

export function updateEvidenceGroup(workspace, groupId, changes = {}) {
  const group = (workspace.evidenceGroups || []).find(item => item.id === groupId);
  if (!group) return workspace;
  if (changes.name?.trim()) group.name = changes.name.trim();
  if (changes.description !== undefined) group.description = String(changes.description || "").trim();
  if (changes.documentId !== undefined) group.documentId = changes.documentId || null;
  group.updatedAt = now();
  workspace.updatedAt = now();
  return workspace;
}

export function removeEvidenceGroup(workspace, groupId) {
  workspace.evidenceGroups = (workspace.evidenceGroups || []).filter(group => group.id !== groupId);
  workspace.updatedAt = now();
  return workspace;
}

export function setEvidenceGroupItems(workspace, groupId, itemIds = []) {
  const group = (workspace.evidenceGroups || []).find(item => item.id === groupId);
  if (!group) return workspace;
  const known = new Set(workspace.items.map(item => item.id));
  group.itemIds = [...new Set(itemIds)].filter(itemId => known.has(itemId));
  group.updatedAt = now();
  workspace.updatedAt = now();
  return workspace;
}

export function addItemToEvidenceGroup(workspace, groupId, itemId) {
  const group = (workspace.evidenceGroups || []).find(item => item.id === groupId);
  if (!group || !workspace.items.some(item => item.id === itemId)) return workspace;
  if (!group.itemIds.includes(itemId)) group.itemIds.push(itemId);
  group.updatedAt = now();
  workspace.updatedAt = now();
  return workspace;
}

export function removeItemFromEvidenceGroup(workspace, groupId, itemId) {
  const group = (workspace.evidenceGroups || []).find(item => item.id === groupId);
  if (!group) return workspace;
  group.itemIds = group.itemIds.filter(id => id !== itemId);
  group.updatedAt = now();
  workspace.updatedAt = now();
  return workspace;
}

export function getEvidenceGroupItems(workspace, groupId) {
  const group = (workspace.evidenceGroups || []).find(item => item.id === groupId);
  if (!group) return [];
  return workspace.items.filter(item => group.itemIds.includes(item.id));
}

export function evidenceGroupsForItem(workspace, itemId) {
  return (workspace.evidenceGroups || []).filter(group => group.itemIds.includes(itemId));
}

export function createCollection({ name, description = "" } = {}) {
  if (!name?.trim()) throw new TypeError("A collection name is required.");
  return {
    id: id("collection"),
    name: name.trim(),
    description: String(description || "").trim(),
    documentIds: [],
    smartRule: null,
    createdAt: now(),
    updatedAt: now(),
  };
}

export function addCollection(workspace, collection) {
  if (workspace.collections.some(existing => existing.id === collection.id || existing.name.toLocaleLowerCase() === collection.name.toLocaleLowerCase())) {
    return workspace;
  }
  workspace.collections.push(collection);
  workspace.updatedAt = now();
  return workspace;
}

export function updateCollection(workspace, collectionId, changes = {}) {
  const collection = workspace.collections.find(item => item.id === collectionId);
  if (!collection) return workspace;
  if (changes.name?.trim()) collection.name = changes.name.trim();
  if (changes.description !== undefined) collection.description = String(changes.description || "").trim();
  collection.updatedAt = now();
  workspace.updatedAt = now();
  return workspace;
}

export function removeCollection(workspace, collectionId) {
  workspace.collections = workspace.collections.filter(collection => collection.id !== collectionId);
  workspace.updatedAt = now();
  return workspace;
}

export function setCollectionRule(workspace, collectionId, rule = null) {
  const collection = workspace.collections.find(item => item.id === collectionId);
  if (!collection) return workspace;
  collection.smartRule = rule;
  collection.updatedAt = now();
  workspace.updatedAt = now();
  return workspace;
}

export function documentMatchesCollectionRule(document, rule) {
  if (!rule) return false;
  if (rule.kind && document.kind !== rule.kind) return false;
  if (rule.tag && !(document.tags || []).some(tag => tag.toLocaleLowerCase() === String(rule.tag).toLocaleLowerCase())) return false;
  if (rule.text && ![document.title, document.description, ...(document.tags || [])].join(" ").toLocaleLowerCase().includes(String(rule.text).toLocaleLowerCase())) return false;
  if (rule.updatedWithinDays != null) {
    const stamp = new Date(document.updatedAt || document.createdAt || 0).getTime();
    if (!stamp || Date.now() - stamp > Number(rule.updatedWithinDays) * 86400000) return false;
  }
  return true;
}

export function getCollectionDocuments(workspace, collectionId) {
  const collection = workspace.collections.find(item => item.id === collectionId);
  if (!collection) return [];
  if (!collection.smartRule) return workspace.documents.filter(document => collection.documentIds.includes(document.id));
  return workspace.documents.filter(document => documentMatchesCollectionRule(document, collection.smartRule));
}

export function setDocumentCollections(workspace, documentId, collectionIds = []) {
  const known = new Set(workspace.collections.map(collection => collection.id));
  for (const collection of workspace.collections) {
    collection.documentIds = collection.documentIds.filter(id => id !== documentId);
  }
  for (const collectionId of new Set(collectionIds)) {
    if (known.has(collectionId)) {
      workspace.collections.find(collection => collection.id === collectionId).documentIds.push(documentId);
    }
  }
  workspace.updatedAt = now();
  return workspace;
}

export function addDocument(workspace, document) {
  if (workspace.documents.some(existing =>
    existing.id === document.id ||
    (document.sourceRef && existing.sourceRef === document.sourceRef && existing.kind === document.kind)
  )) {
    return workspace;
  }
  workspace.documents.push(document);
  workspace.updatedAt = now();
  return workspace;
}

export function addItem(workspace, item) {
  if (!Object.values(WorkspaceItemKind).includes(item.kind)) {
    throw new TypeError(`Unsupported workspace item kind: ${item.kind}`);
  }
  if (workspace.items.some(existing => existing.id === item.id)) {
    return workspace;
  }
  workspace.items.push(item);
  workspace.updatedAt = now();
  return workspace;
}

export function addLink(workspace, link) {
  const knownIds = new Set([
    ...workspace.items.map(item => item.id),
    ...(workspace.evidenceGroups || []).map(group => group.id),
  ]);
  if (!knownIds.has(link.fromId) || !knownIds.has(link.toId)) {
    throw new TypeError("Both graph endpoints must exist in the workspace.");
  }
  if (!Object.values(LinkKind).includes(link.kind)) {
    throw new TypeError(`Unsupported relationship kind: ${link.kind}`);
  }
  if (workspace.links.some(existing =>
    existing.fromId === link.fromId &&
    existing.toId === link.toId &&
    existing.kind === link.kind
  )) {
    return workspace;
  }
  workspace.links.push(link);
  workspace.updatedAt = now();
  return workspace;
}

export function getLinkedItems(workspace, itemId) {
  const linkedIds = new Set();
  for (const link of workspace.links) {
    if (link.fromId === itemId) linkedIds.add(link.toId);
    if (link.toId === itemId) linkedIds.add(link.fromId);
  }
  return workspace.items.filter(item => linkedIds.has(item.id));
}

export function getLinkedGraphEntities(workspace, entityId) {
  const linkedIds = new Set();
  for (const link of workspace.links) {
    if (link.fromId === entityId) linkedIds.add(link.toId);
    if (link.toId === entityId) linkedIds.add(link.fromId);
  }
  return [
    ...workspace.items.filter(item => linkedIds.has(item.id)),
    ...(workspace.evidenceGroups || []).filter(group => linkedIds.has(group.id)),
  ];
}

export function serializeWorkspace(workspace) {
  return JSON.stringify(workspace, null, 2);
}

export function deserializeWorkspace(serialized) {
  const workspace = typeof serialized === "string" ? JSON.parse(serialized) : serialized;
  if (workspace?.modelVersion === 1 || workspace?.modelVersion === 2 || workspace?.modelVersion === 3 || workspace?.modelVersion === 4) {
    workspace.modelVersion = EVAARTA_DOCUMENT_MODEL_VERSION;
    workspace.collections ||= [];
    workspace.evidenceGroups ||= [];
    for (const collection of workspace.collections) collection.smartRule ??= null;
    for (const group of workspace.evidenceGroups) {
      group.description ??= "";
      group.documentId ??= null;
      group.itemIds ||= [];
      group.createdAt ||= now();
      group.updatedAt ||= now();
    }
    for (const item of workspace.items || []) {
      if (item.anchor) {
        item.anchor.selector ??= null;
        item.anchor.rects ??= null;
      }
    }
  }
  if (workspace?.modelVersion !== EVAARTA_DOCUMENT_MODEL_VERSION) {
    throw new Error(
      `Unsupported e-Vaarta document model version: ${workspace?.modelVersion}`
    );
  }
  return workspace;
}
