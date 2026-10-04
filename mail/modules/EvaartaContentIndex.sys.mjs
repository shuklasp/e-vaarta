/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Lightweight e-Vaarta content index.
 *
 * The index deliberately stores extracted/searchable text separately from the
 * workspace model. Adapters can feed it email bodies, PDF text, attachment
 * metadata, OCR output, or other sources without inflating workspace JSON.
 */

export const EVAARTA_INDEX_VERSION = 3;

function now() {
  return new Date().toISOString();
}

function normalize(value) {
  return String(value || "").toLocaleLowerCase().replace(/\s+/g, " ").trim();
}

export function createIndex() {
  return {
    version: EVAARTA_INDEX_VERSION,
    updatedAt: now(),
    entries: [],
  };
}

export function createIndexEntry({
  documentId,
  sourceRef = null,
  title = "",
  kind = "document",
  text = "",
  metadata = {},
}) {
  if (!documentId) throw new TypeError("documentId is required.");
  return {
    id: "idx-" + crypto.randomUUID(),
    documentId,
    sourceRef,
    title,
    kind,
    text,
    metadata,
    updatedAt: now(),
  };
}

export function upsertIndexEntry(index, entry) {
  const existing = index.entries.find(candidate =>
    candidate.documentId === entry.documentId && candidate.kind === entry.kind
  );
  if (existing) {
    Object.assign(existing, entry, { id: existing.id, updatedAt: now() });
  } else {
    index.entries.push(entry);
  }
  index.updatedAt = now();
  return index;
}

export function removeIndexEntries(index, documentId) {
  index.entries = index.entries.filter(entry => entry.documentId !== documentId);
  index.updatedAt = now();
  return index;
}

export function upsertExtractedContent(index, {
  documentId,
  sourceRef = null,
  title = "",
  kind = "document-content",
  text = "",
  metadata = {},
  fingerprint = null,
}) {
  return upsertIndexEntry(index, createIndexEntry({
    documentId,
    sourceRef,
    title,
    kind,
    text,
    metadata: { ...metadata, fingerprint },
  }));
}

export function needsReindex(index, documentId, kind, fingerprint) {
  const entry = index.entries.find(candidate =>
    candidate.documentId === documentId && candidate.kind === kind
  );
  return !entry || entry.metadata?.fingerprint !== fingerprint;
}

export function fingerprintText(text) {
  const value = String(text || "");
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

function buildSearchExcerpt(text, terms, radius = 120) {
  const value = String(text || "").replace(/\s+/g, " ").trim();
  if (!value) return "";
  const lower = value.toLocaleLowerCase();
  const positions = terms.map(term => lower.indexOf(term)).filter(position => position >= 0);
  const position = positions.length ? Math.min(...positions) : 0;
  const start = Math.max(0, position - radius);
  const end = Math.min(value.length, position + radius);
  return (start > 0 ? "… " : "") + value.slice(start, end) + (end < value.length ? " …" : "");
}

export function searchIndex(index, query, limit = 100) {
  const needle = normalize(query);
  if (!needle) return [];
  const terms = needle.split(" ").filter(Boolean);
  return index.entries
    .map(entry => {
      const haystack = normalize([entry.title, entry.text, JSON.stringify(entry.metadata)].join(" "));
      const matched = terms.filter(term => haystack.includes(term)).length;
      if (!matched) return null;
      return {
        ...entry,
        type: entry.metadata?.itemKind || (entry.kind === "document" ? "document" : entry.kind),
        id: entry.metadata?.itemId || entry.documentId,
        score: matched / terms.length,
        page: entry.metadata?.page ?? null,
        excerpt: buildSearchExcerpt(entry.text, terms),
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, limit);
}

export function serializeIndex(index) {
  return JSON.stringify(index);
}

export function deserializeIndex(serialized) {
  const index = typeof serialized === "string" ? JSON.parse(serialized) : serialized;
  if (index?.version === 1 || index?.version === 2) {
    index.version = EVAARTA_INDEX_VERSION;
    for (const entry of index.entries || []) {
      entry.metadata ||= {};
      if (entry.kind === "ocr-text-page" && entry.metadata.page == null) {
        entry.metadata.page = null;
      }
    }
  }
  if (index?.version !== EVAARTA_INDEX_VERSION) {
    throw new Error(`Unsupported e-Vaarta index version: ${index?.version}`);
  }
  return index;
}
