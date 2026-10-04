/* MPL-2.0 */
/** Declarative production contract for PDF edit/form/redaction/sign workflows. */
export const PdfProductionOperation = Object.freeze({
  EDIT: "edit", FORM_FILL: "form-fill", REDACT: "redact", SIGN: "sign",
  MERGE: "merge", SPLIT: "split", ROTATE: "rotate", EXPORT: "export",
});
export function createPdfProductionRequest(operation, payload = {}) {
  if (!Object.values(PdfProductionOperation).includes(operation)) throw new RangeError("unsupported PDF production operation");
  return Object.freeze({ operation, payload: structuredClone(payload) });
}
export function createRedaction({ documentId, revisionId = null, page, rects = [], reason = "" }) {
  if (!documentId || !Number.isInteger(page) || page < 1 || !Array.isArray(rects)) throw new TypeError("invalid redaction");
  return Object.freeze({ documentId, revisionId, page, rects: structuredClone(rects), reason });
}
export function createSignatureIntent({ documentId, signerId, fieldId = null, reason = "", appearance = null }) {
  if (!documentId || !signerId) throw new TypeError("documentId and signerId are required");
  return Object.freeze({ documentId, signerId, fieldId, reason, appearance: appearance ? structuredClone(appearance) : null });
}
export function validateProductionResult(result) {
  return !!result && typeof result.operation === "string" &&
    ["success", "partial", "failed"].includes(result.status);
}
