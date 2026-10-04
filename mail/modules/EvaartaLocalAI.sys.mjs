/* MPL-2.0 */
/** Provider-neutral local/remote AI boundary; grounded execution stays auditable. */
export const AiCapability = Object.freeze({
  EMBEDDING: "embedding", CHAT: "chat", OCR: "ocr", SUMMARIZE: "summarize",
  EXTRACT: "extract", CLASSIFY: "classify", TRANSCRIBE: "transcribe",
});
export function createAiProvider({ id, locality = "local", capabilities = [], model = null }) {
  if (!id || !["local", "remote", "hybrid"].includes(locality)) throw new TypeError("invalid AI provider");
  return Object.freeze({ id, locality, capabilities: [...capabilities], model });
}
export function createGroundedAiRequest({ query, sourceIds = [], evidenceIds = [], action = null }) {
  if (!query || !Array.isArray(sourceIds) || !Array.isArray(evidenceIds)) throw new TypeError("invalid grounded AI request");
  return Object.freeze({ query, sourceIds: [...sourceIds], evidenceIds: [...evidenceIds], action });
}
export function validateGrounding(result) {
  return !!result && Array.isArray(result.citations) && result.citations.every(c => c.sourceId && c.evidenceId);
}
