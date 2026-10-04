/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const { Services } = ChromeUtils.importESModule(
  "resource://gre/modules/Services.sys.mjs"
);
const {
  createWorkspace,
  createNote,
  createExcerpt,
  createDocument,
  createSourceAnchor,
  createLink,
  addDocument,
  addItem,
  addLink,
} = ChromeUtils.importESModule(
  "resource:///modules/EvaartaDocumentWorkspace.sys.mjs"
);

const PREF = "mail.evaarta.workspace.json";

let workspace;
let selectedDocumentId = null;
let linkSourceId = null;

function importPendingAttachments(workspace) {
  try {
    const value = Services.prefs.getStringPref("mail.evaarta.pendingAttachments", "");
    if (!value) return workspace;
    const pending = JSON.parse(value);
    Services.prefs.clearUserPref("mail.evaarta.pendingAttachments");
    for (const source of pending) {
      if (!source?.title || !source?.sourceRef) continue;
      workspace = addDocument(workspace, createDocument(source));
    }
  } catch (error) {
    console.error("e-Vaarta: failed to import pending attachments", error);
  }
  return workspace;
}

function loadWorkspace() {
  try {
    const value = Services.prefs.getStringPref(PREF, "");
    if (value) {
      return importPendingAttachments(JSON.parse(value));
    }
  } catch (error) {
    console.error("e-Vaarta: failed to load workspace", error);
  }
  return importPendingAttachments(createWorkspace({ name: "My workspace" }));
}

function saveWorkspace() {
  Services.prefs.setStringPref(PREF, JSON.stringify(workspace));
}

function findItem(itemId) {
  return workspace.items.find(item => item.id === itemId) || null;
}

function jumpToSource(item) {
  if (!item.anchor?.documentId) {
    return;
  }
  const source = workspace.documents.find(document => document.id === item.anchor.documentId);
  if (!source) {
    return;
  }
  selectDocument(source, item.anchor.page);
}

function editNote(item) {
  const title = window.prompt("Note title:", item.title || "Note");
  if (title === null) return;
  const text = window.prompt("Note:", item.text || "");
  if (text === null) return;
  item.title = title.trim() || "Note";
  item.text = text;
  item.updatedAt = new Date().toISOString();
  workspace.updatedAt = item.updatedAt;
  saveWorkspace();
  render();
}

function linkItem(item) {
  if (!linkSourceId) {
    linkSourceId = item.id;
    render();
    return;
  }
  if (linkSourceId === item.id) {
    linkSourceId = null;
    render();
    return;
  }
  const kind = window.prompt(
    "Relationship (relates-to, supports, contradicts, derived-from, references):",
    "relates-to"
  );
  if (!kind) return;
  try {
    workspace = addLink(workspace, createLink({
      fromId: linkSourceId,
      toId: item.id,
      kind: kind.trim(),
    }));
    saveWorkspace();
  } catch (error) {
    alert(error.message);
  }
  linkSourceId = null;
  render();
}

function openSelectedEmailSource() {
  const source = workspace.documents.find(document => document.id === selectedDocumentId);
  if (!source?.sourceRef || source.kind !== "email") {
    return;
  }
  try {
    window.openDialog(
      "chrome://messenger/content/messageWindow.xhtml",
      "_blank",
      "chrome,dialog=no,all",
      source.sourceRef
    );
  } catch (error) {
    console.error("e-Vaarta: unable to open email source", error);
  }
}

function render() {
  const sourceList = document.getElementById("sourceList");
  const canvas = document.getElementById("workspaceCanvas");
  const empty = document.getElementById("canvasEmpty");
  const count = document.getElementById("itemCount");

  document.getElementById("workspaceName").textContent = workspace.name;
  count.textContent = `${workspace.items.length} item${workspace.items.length === 1 ? "" : "s"}`;

  sourceList.replaceChildren();
  if (!workspace.documents.length) {
    const state = document.createElement("div");
    state.className = "empty-state";
    state.innerHTML =
      "<strong>No documents yet</strong><span>Documents and email attachments will appear here as sources.</span>";
    sourceList.append(state);
  } else {
    for (const document of workspace.documents) {
      const row = document.createElement("button");
      row.className = "source-row";
      row.textContent = document.title;
      row.addEventListener("click", () => selectDocument(document));
      sourceList.append(row);
    }
  }

  canvas.querySelectorAll(".workspace-card").forEach(card => card.remove());
  empty.hidden = workspace.items.length > 0;

  for (const item of workspace.items) {
    const card = document.createElement("article");
    card.className = "workspace-card";
    const kind = document.createElement("span");
    kind.className = "card-kind";
    kind.textContent = item.kind;
    const title = document.createElement("h3");
    title.textContent = item.title || (item.kind === "note" ? "Note" : "Excerpt");
    const body = document.createElement("p");
    body.textContent = item.text || "";
    card.append(kind, title, body);

    const controls = document.createElement("div");
    controls.className = "card-controls";
    if (item.kind === "note") {
      const edit = document.createElement("button");
      edit.textContent = "Edit";
      edit.addEventListener("click", () => editNote(item));
      controls.append(edit);
    }
    if (item.anchor?.documentId) {
      const jump = document.createElement("button");
      jump.textContent = "Jump to source";
      jump.addEventListener("click", () => jumpToSource(item));
      controls.append(jump);
    }
    const link = document.createElement("button");
    link.textContent = linkSourceId === item.id ? "Select target…" : "Link";
    link.className = linkSourceId === item.id ? "link-active" : "";
    link.addEventListener("click", () => linkItem(item));
    controls.append(link);
    card.append(controls);

    if (item.anchor?.page) {
      const source = document.createElement("span");
      source.className = "source-anchor";
      source.textContent = `Source • page ${item.anchor.page}`;
      card.append(source);
    }
    canvas.append(card);
  }
}

function addNote() {
  workspace = addItem(
    workspace,
    createNote({
      title: "New thought",
      text: "Write your observation here.",
    })
  );
  saveWorkspace();
  render();
}

async function openDocument() {
  const picker = Cc["@mozilla.org/filepicker;1"].createInstance(Ci.nsIFilePicker);
  picker.init(window, "Open document", Ci.nsIFilePicker.modeOpen);
  picker.appendFilter("PDF documents", "*.pdf");
  picker.appendFilter("Office documents", "*.doc;*.docx;*.ppt;*.pptx");
  picker.appendFilters(Ci.nsIFilePicker.filterAll);
  const result = await new Promise(resolve => picker.open(resolve));
  if (result != Ci.nsIFilePicker.returnOK || !picker.file) {
    return;
  }

  const file = picker.file;
  const lowerName = file.leafName.toLowerCase();
  const kind = lowerName.endsWith(".pdf") ? "pdf" : "other";
  const source = createDocument({
    title: file.leafName,
    kind,
    sourceRef: Services.io.newFileURI(file).spec,
    mimeType: kind == "pdf" ? "application/pdf" : null,
  });
  workspace = addDocument(workspace, source);
  workspace.updatedAt = new Date().toISOString();
  saveWorkspace();
  selectDocument(source);
  render();
}

function selectDocument(source, page = null) {
  selectedDocumentId = source.id;
  const viewer = document.getElementById("sourceViewer");
  document.getElementById("sourceTitle").textContent = source.title;
  document.getElementById("sourceLocation").textContent = source.kind.toUpperCase();
  const sourceRef = source.sourceRef || "about:blank";
  viewer.src = page && source.kind === "pdf" ? `${sourceRef}#page=${page}` : sourceRef;
}

function captureSelection() {
  const source = workspace.documents.find(document => document.id === selectedDocumentId) || workspace.documents[0];
  const viewer = document.getElementById("sourceViewer");
  if (!source || !viewer?.contentWindow) {
    alert("Open a document first.");
    return;
  }

  let selectedText = "";
  let page = null;
  try {
    selectedText = viewer.contentWindow.getSelection()?.toString().trim() || "";
    const match = viewer.contentWindow.location.hash.replace(/^#/, "").match(/(?:^|&)page=(\\d+)/);
    page = match ? Number(match[1]) : null;
  } catch (error) {
    console.warn("e-Vaarta: unable to read source selection", error);
  }

  if (!selectedText) {
    alert("Select text in the source reader first.");
    return;
  }

  workspace = addItem(
    workspace,
    createExcerpt({
      anchor: createSourceAnchor({
        documentId: source.id,
        page,
        quote: selectedText,
      }),
      title: "Selected excerpt",
      text: selectedText,
    })
  );
  saveWorkspace();
  render();
}

function addExcerpt() {
  const source = workspace.documents.find(document => document.id === selectedDocumentId) || workspace.documents[0];
  if (!source) {
    alert("Open a document first.");
    return;
  }

  const text = window.prompt("Paste or type the source excerpt:");
  if (!text?.trim()) {
    return;
  }

  const pageValue = window.prompt("Source page number (optional):", "1");
  const page = pageValue && /^\\d+$/.test(pageValue) ? Number(pageValue) : null;

  workspace = addItem(
    workspace,
    createExcerpt({
      anchor: createSourceAnchor({
        documentId: source.id,
        page,
        quote: text.trim(),
      }),
      title: "Source excerpt",
      text: text.trim(),
    })
  );
  saveWorkspace();
  render();
}

function clearWorkspace() {
  workspace.items = [];
  workspace.documents = [];
  workspace.links = [];
  workspace.updatedAt = new Date().toISOString();
  saveWorkspace();
  render();
}

window.addEventListener("DOMContentLoaded", () => {
  workspace = loadWorkspace();
  saveWorkspace();
  document.getElementById("newNoteButton").addEventListener("click", addNote);
  document.getElementById("openDocumentButton").addEventListener("click", openDocument);
  document.getElementById("addExcerptButton").addEventListener("click", addExcerpt);
  document.getElementById("clearButton").addEventListener("click", clearWorkspace);
  render();
  if (workspace.documents[0]) {
    selectDocument(workspace.documents[0]);
  }
});
