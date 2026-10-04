/* MPL-2.0 */

/**
 * Renderer-neutral PDF platform contract.
 * Native PDF engines implement these operations; the semantic layer owns
 * stable identity, provenance, annotations and evidence.
 */

export const PdfOperation = Object.freeze({
  OPEN: "open",
  CLOSE: "close",
  RENDER: "render",
  SEARCH: "search",
  SELECT: "select",
  ANNOTATE: "annotate",
  EXTRACT: "extract",
  EDIT: "edit",
  SPLIT: "split",
  MERGE: "merge",
  ROTATE: "rotate",
  FORM: "form",
  REDACT: "redact",
  SIGN: "sign",
  COMPARE: "compare",
  EXPORT: "export",
});

export function createPdfRequest(operation, payload = {}) {
  if (!Object.values(PdfOperation).includes(operation)) {
    throw new RangeError("unsupported PDF operation");
  }
  return Object.freeze({
    operation,
    payload: structuredClone(payload),
  });
}

export function createPdfPageDescriptor({
  documentId, revisionId = null, page, label = null, width = 0, height = 0,
}) {
  if (!documentId || !Number.isInteger(page) || page < 1) {
    throw new TypeError("documentId and positive page are required");
  }
  return Object.freeze({
    documentId, revisionId, page, label, width, height,
  });
}

export function createPdfEvidence({
  anchor, quote, context = "", confidence = 1, extractionMethod = "native",
}) {
  if (!anchor?.documentId || !Number.isInteger(anchor.page)) {
    throw new TypeError("a stable PDF anchor is required");
  }
  if (!Number.isFinite(confidence) || confidence < 0 || confidence > 1) {
    throw new RangeError("confidence must be between 0 and 1");
  }
  return Object.freeze({
    anchor: structuredClone(anchor),
    quote,
    context,
    confidence,
    extractionMethod,
  });
}

export function validatePdfCapabilityResult(result) {
  return Boolean(
    result &&
    typeof result.operation === "string" &&
    result.status &&
    ["success", "unsupported", "failed"].includes(result.status)
  );
}
