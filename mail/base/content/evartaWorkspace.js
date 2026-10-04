/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const { Services } = ChromeUtils.importESModule(
  "resource://gre/modules/Services.sys.mjs"
);
const {
  createWorkspace, createNote, createExcerpt, createAnnotation, createDocument,
  createSourceAnchor, createLink, addDocument, addItem, addLink,
} = ChromeUtils.importESModule(
  "resource:///modules/EvaartaDocumentWorkspace.sys.mjs"
);

const PREF = "mail.evaarta.workspace.json";
let workspace;
let selectedDocumentId = null;
let selectedItemId = null;
let linkSourceId = null;
let selectedLinkId = null;

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
  } catch (error) { console.error("e-Vaarta: failed to import pending attachments", error); }
  return workspace;
}

function loadWorkspace() {
  try {
    const value = Services.prefs.getStringPref(PREF, "");
    if (value) return importPendingAttachments(JSON.parse(value));
  } catch (error) { console.error("e-Vaarta: failed to load workspace", error); }
  return importPendingAttachments(createWorkspace({ name: "My workspace" }));
}

function saveWorkspace() { Services.prefs.setStringPref(PREF, JSON.stringify(workspace)); }
function findItem(itemId) { return workspace.items.find(item => item.id === itemId) || null; }
function itemLabel(item) { return item?.title || (item?.kind === "note" ? "Note" : "Excerpt"); }
function linkLabel(kind) { return kind.replaceAll("-", " "); }

function jumpToSource(item) {
  if (!item.anchor?.documentId) return;
  const source = workspace.documents.find(document => document.id === item.anchor.documentId);
  if (source) selectDocument(source, item.anchor.page);
}

let editorMode = null;
let editorItemId = null;

function openEditor(mode, item = null) {
  editorMode = mode;
  editorItemId = item?.id || null;
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
  } else if (editorMode === "excerpt") {
    const source = workspace.documents.find(document => document.id === selectedDocumentId);
    if (!source) {
      alert("Open a source document first.");
      return;
    }
    const pageValue = document.getElementById("editorPage").value.trim();
    const page = pageValue ? Number(pageValue) : null;
    workspace = addItem(workspace, createExcerpt({
      anchor: createSourceAnchor({
        documentId: source.id,
        page: Number.isInteger(page) && page > 0 ? page : null,
        quote: text,
      }),
      title: title || "Source excerpt",
      text,
    }));
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

function linkItem(item) {
  if (!linkSourceId) {
    linkSourceId = item.id;
    document.getElementById("cancelLinkButton").hidden = false;
    document.getElementById("linkModeStatus").textContent = "Source selected: " + itemLabel(item) + ". Now select a target card.";
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

function selectItem(item) {
  selectedItemId = item.id;
  selectedLinkId = null;
  renderRelationshipInspector();
  render();
}

function selectLink(link) {
  selectedLinkId = link.id;
  selectedItemId = null;
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
  const from = findItem(link.fromId);
  const to = findItem(link.toId);
  inspector.hidden = false;
  inspector.replaceChildren();
  const summary = document.createElement("span");
  summary.textContent = itemLabel(from) + " → " + linkLabel(link.kind) + " → " + itemLabel(to);
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

function render() {
  const sourceList = document.getElementById("sourceList");
  const canvas = document.getElementById("workspaceCanvas");
  const empty = document.getElementById("canvasEmpty");
  const count = document.getElementById("itemCount");
  document.getElementById("workspaceName").textContent = workspace.name;
  count.textContent = workspace.items.length + " item" + (workspace.items.length === 1 ? "" : "s") + " • " + workspace.links.length + " relationship" + (workspace.links.length === 1 ? "" : "s");

  sourceList.replaceChildren();
  if (!workspace.documents.length) {
    const state = document.createElement("div");
    state.className = "empty-state";
    state.innerHTML = "<strong>No documents yet</strong><span>Documents and email attachments will appear here as sources.</span>";
    sourceList.append(state);
  } else {
    for (const source of workspace.documents) {
      const row = document.createElement("button");
      row.className = "source-row";
      row.textContent = source.title;
      row.setAttribute("aria-current", source.id === selectedDocumentId ? "true" : "false");
      row.addEventListener("click", () => selectDocument(source));
      sourceList.append(row);
    }
  }

  canvas.querySelectorAll(".workspace-card").forEach(card => card.remove());
  empty.hidden = workspace.items.length > 0;

  for (const item of workspace.items) {
    const card = document.createElement("article");
    card.className = "workspace-card";
    card.dataset.itemId = item.id;
    card.tabIndex = 0;
    if (item.id === selectedItemId) card.classList.add("card-selected");
    if (item.id === linkSourceId) card.classList.add("card-link-source");
    if (selectedItemId && workspace.links.some(link => (link.fromId === item.id || link.toId === item.id))) card.classList.add("card-linked");
    card.addEventListener("click", () => selectItem(item));
    card.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); selectItem(item); } });

    const kind = document.createElement("span");
    kind.className = "card-kind";
    kind.textContent = item.kind;
    const title = document.createElement("h3");
    title.textContent = itemLabel(item);
    const body = document.createElement("p");
    body.textContent = item.text || "";
    card.append(kind, title, body);

    const source = sourceForItem(item);
    if (source) {
      const badge = document.createElement("span");
      badge.className = "card-source";
      badge.textContent = "Source • " + source.title;
      card.append(badge);
    }

    const controls = document.createElement("div");
    controls.className = "card-controls";
    if (item.kind === "note") {
      const edit = document.createElement("button");
      edit.textContent = "Edit";
      edit.addEventListener("click", event => { event.stopPropagation(); editNote(item); });
      controls.append(edit);
    }
    if (item.anchor?.documentId) {
      const jump = document.createElement("button");
      jump.textContent = "Jump to source";
      jump.addEventListener("click", event => { event.stopPropagation(); jumpToSource(item); });
      controls.append(jump);
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
        chip.textContent = linkLabel(link.kind) + " • " + itemLabel(findItem(otherId));
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
  const kind = lowerName.endsWith(".pdf") ? "pdf" : "other";
  const source = createDocument({ title: file.leafName, kind, sourceRef: Services.io.newFileURI(file).spec, mimeType: kind == "pdf" ? "application/pdf" : null });
  workspace = addDocument(workspace, source);
  workspace.updatedAt = new Date().toISOString();
  saveWorkspace();
  selectDocument(source);
}

function selectDocument(source, page = null) {
  selectedDocumentId = source.id;
  document.getElementById("sourceTitle").textContent = source.title;
  document.getElementById("sourceLocation").textContent = source.kind.toUpperCase();
  document.getElementById("openEmailSourceButton").hidden = source.kind !== "email";
  const sourceRef = source.sourceRef || "about:blank";
  document.getElementById("sourceViewer").src = page && source.kind === "pdf" ? sourceRef + "#page=" + page : sourceRef;
  render();
}

function captureSelection() {
  const source = workspace.documents.find(document => document.id === selectedDocumentId) || workspace.documents[0];
  const viewer = document.getElementById("sourceViewer");
  if (!source || !viewer?.contentWindow) { alert("Open a document first."); return; }
  let selectedText = "";
  let page = null;
  try {
    selectedText = viewer.contentWindow.getSelection()?.toString().trim() || "";
    const match = viewer.contentWindow.location.hash.replace(/^#/, "").match(/(?:^|&)page=(\\d+)/);
    page = match ? Number(match[1]) : null;
  } catch (error) { console.warn("e-Vaarta: unable to read source selection", error); }
  if (!selectedText) { alert("Select text in the source reader first."); return; }
  workspace = addItem(workspace, createExcerpt({ anchor: createSourceAnchor({ documentId: source.id, page, quote: selectedText }), title: "Selected excerpt", text: selectedText }));
  saveWorkspace();
  render();
}

function annotateSelection() {
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
    const match = viewer.contentWindow.location.hash.replace(/^#/, "").match(/(?:^|&)page=(\d+)/);
    page = match ? Number(match[1]) : null;
  } catch (error) {
    console.warn("e-Vaarta: unable to read source selection", error);
  }

  if (!selectedText) {
    alert("Select text in the source reader first.");
    return;
  }

  workspace = addItem(workspace, createAnnotation({
    anchor: createSourceAnchor({
      documentId: source.id,
      page,
      quote: selectedText,
    }),
    annotationType: "highlight",
    text: selectedText,
  }));
  saveWorkspace();
  render();
}

function addExcerpt() {
  const source = workspace.documents.find(document => document.id === selectedDocumentId) || workspace.documents[0];
  if (!source) {
    alert("Open a document first.");
    return;
  }
  openEditor("excerpt");
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

window.addEventListener("DOMContentLoaded", () => {
  workspace = loadWorkspace();
  saveWorkspace();
  document.getElementById("newNoteButton").addEventListener("click", addNote);
  document.getElementById("openEmailSourceButton").addEventListener("click", openSelectedEmailSource);
  document.getElementById("openDocumentButton").addEventListener("click", openDocument);
  document.getElementById("addExcerptButton").addEventListener("click", addExcerpt);
  document.getElementById("captureSelectionButton").addEventListener("click", captureSelection);
  document.getElementById("annotateSelectionButton").addEventListener("click", annotateSelection);
  document.getElementById("clearButton").addEventListener("click", clearWorkspace);
  document.getElementById("cancelLinkButton").addEventListener("click", cancelLinkMode);
  document.getElementById("editorCloseButton").addEventListener("click", closeEditor);
  document.getElementById("editorCancelButton").addEventListener("click", closeEditor);
  document.getElementById("itemEditorForm").addEventListener("submit", event => {
    event.preventDefault();
    saveEditor();
  });
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
