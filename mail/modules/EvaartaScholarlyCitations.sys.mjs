/* MPL-2.0 */
/** Zotero-class scholarly metadata and citation contract. */
export const CitationOutput = Object.freeze({ CSL_JSON: "csl-json", BIBTEX: "bibtex", RIS: "ris", TEXT: "text" });
export function normalizeScholarlyRecord(record = {}) {
  const out = { ...record };
  out.id = out.id || out.DOI || out.doi || out.ISBN || out.isbn || crypto.randomUUID?.() || String(Date.now());
  if (out.doi || out.DOI) out.DOI = String(out.doi || out.DOI).replace(/^https?:\/\/doi.org\//i, "").replace(/[.,;:)]+$/, "").toLowerCase();
  if (out.author && typeof out.author === "string") out.author = out.author.split(/\s+and\s+/i).map(name => ({ literal: name.trim() }));
  if (out.year && !out.issued) out.issued = { "date-parts": [[Number(out.year)]] };
  return Object.freeze(out);
}
export function createCitationLocator({ sourceId, page = null, locator = null, prefix = "", suffix = "" }) {
  if (!sourceId) throw new TypeError("sourceId is required");
  return Object.freeze({ sourceId, page, locator, prefix, suffix });
}
export function createBibliographyRequest({ records = [], style = "apa", locale = "en-US" }) {
  return Object.freeze({ records: records.map(normalizeScholarlyRecord), style, locale });
}
export function citationRoundTrip(record) {
  const normalized = normalizeScholarlyRecord(record);
  return { source: structuredClone(record), normalized, stableId: normalized.id };
}
