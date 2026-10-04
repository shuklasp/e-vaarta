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
  addDocument,
  addItem,
} = ChromeUtils.importESModule(
  "resource:///modules/EvaartaDocumentWorkspace.sys.mjs"
);

const PREF = "mail.evaarta.workspace.json";

let workspace;

function loadWorkspace() {
  try {
    const value = Services.prefs.getStringPref(PREF, "");
    if (value) {
      return JSON.parse(value);
    }
  } catch (error) {
    console.error("e-Vaarta: failed to load workspace", error);
  }
  return createWorkspace({ name: "My workspace" });
}

function saveWorkspace() {
  Services.prefs.setStringPref(PREF, JSON.stringify(workspace));
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

function selectDocument(source) {
  const viewer = document.getElementById("sourceViewer");
  document.getElementById("sourceTitle").textContent = source.title;
  document.getElementById("sourceLocation").textContent = source.kind.toUpperCase();
  viewer.src = source.sourceRef || "about:blank";
}

function addExcerpt() {
  const source = workspace.documents[0];
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
  document.getElementById("newNoteButton").addEventListener("click", addNote);
  document.getElementById("openDocumentButton").addEventListener("click", openDocument);
  document.getElementById("addExcerptButton").addEventListener("click", addExcerpt);
  document.getElementById("clearButton").addEventListener("click", clearWorkspace);
  render();
  if (workspace.documents[0]) {
    selectDocument(workspace.documents[0]);
  }
});
