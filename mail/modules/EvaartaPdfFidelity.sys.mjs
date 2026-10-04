/* MPL-2.0 */
/**
 * Renderer/production-neutral PDF fidelity evidence.
 * Native rendering and PDF engines consume this contract.
 */

export const PdfFidelityDimension = Object.freeze({
  PIXEL: "pixel",
  STRUCTURE: "structure",
  TEXT: "text",
  ANNOTATION: "annotation",
  METADATA: "metadata",
  ACCESSIBILITY: "accessibility",
  SECURITY: "security",
});

export function createPdfFidelityCase({
  id,
  sourceId,
  operation,
  dimensions = Object.values(PdfFidelityDimension),
} = {}) {
  if (!id || !sourceId || !operation) {
    throw new TypeError("id, sourceId and operation are required");
  }
  return Object.freeze({ id, sourceId, operation, dimensions: [...dimensions] });
}

export function createPdfFidelityResult({
  caseId,
  passed,
  scores = {},
  recoveredContent = false,
  details = "",
} = {}) {
  if (!caseId) throw new TypeError("caseId is required");
  return Object.freeze({ caseId, passed: Boolean(passed), scores: {...scores}, recoveredContent: Boolean(recoveredContent), details });
}

export function redactionIsSecure(result) {
  return result?.passed === true && result?.recoveredContent === false;
}
