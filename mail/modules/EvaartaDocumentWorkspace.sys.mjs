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

export const EVAARTA_DOCUMENT_MODEL_VERSION = 1;

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

/**
 * Creates a source document record.
 *
 * sourceRef is intentionally opaque: it may be a local file URI, message
 * identifier, attachment identifier or a future cloud document identifier.
 */
export function createDocument({
  title,
  kind = DocumentKind.OTHER,
  sourceRef = null,
  mimeType = null,
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
    createdAt: now(),
    updatedAt: now(),
  };
}

/**
 * A source anchor identifies the exact material an excerpt/annotation came
 * from. page is one-based for paginated formats; character offsets are
 * optional and are useful for HTML/email/text sources.
 */
export function createSourceAnchor({
  documentId,
  page = null,
  startOffset = null,
  endOffset = null,
  quote = null,
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

  return {
    id: id("link"),
    fromId,
    toId,
    kind,
    createdAt: now(),
  };
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
    items: [],
    links: [],
    createdAt: now(),
    updatedAt: now(),
  };
}

/**
 * Adds a document to a workspace without duplicating it.
 */
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

/**
 * Adds an excerpt, note or annotation to the workspace.
 */
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

/**
 * Adds a semantic relationship between workspace items.
 */
export function addLink(workspace, link) {
  const knownIds = new Set(workspace.items.map(item => item.id));
  if (!knownIds.has(link.fromId) || !knownIds.has(link.toId)) {
    throw new TypeError("Both link endpoints must exist in the workspace.");
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

/**
 * Returns all items linked to an item. The result is intentionally simple so
 * UI layers can render lists, graph views or contextual navigation themselves.
 */
export function getLinkedItems(workspace, itemId) {
  const linkedIds = new Set();
  for (const link of workspace.links) {
    if (link.fromId === itemId) {
      linkedIds.add(link.toId);
    }
    if (link.toId === itemId) {
      linkedIds.add(link.fromId);
    }
  }
  return workspace.items.filter(item => linkedIds.has(item.id));
}

export function serializeWorkspace(workspace) {
  return JSON.stringify(workspace, null, 2);
}

export function deserializeWorkspace(serialized) {
  const workspace = typeof serialized === "string"
    ? JSON.parse(serialized)
    : serialized;

  if (workspace?.modelVersion !== EVAARTA_DOCUMENT_MODEL_VERSION) {
    throw new Error(
      `Unsupported e-Vaarta document model version: ${workspace?.modelVersion}`
    );
  }
  return workspace;
}
