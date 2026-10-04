/* MPL-2.0 */
/**
 * The signature e-Vaarta benchmark: prove that evidence can flow through the
 * entire lifecycle without losing provenance.
 */

export const EvidenceActionStage = Object.freeze([
  "communication",
  "document",
  "evidence",
  "claim",
  "finding",
  "decision",
  "task",
  "project",
  "report",
  "citation",
  "communication-output",
]);

export function createEvidenceActionCase({ id, seedId, requiredStages = EvidenceActionStage } = {}) {
  if (!id || !seedId) throw new TypeError("id and seedId are required");
  return Object.freeze({ id, seedId, requiredStages: [...requiredStages] });
}

export function validateEvidenceActionTrace(trace, requiredStages = EvidenceActionStage) {
  const stages = new Set(trace?.map(item => item.stage));
  const missing = requiredStages.filter(stage => !stages.has(stage));
  const provenanceBroken = trace?.some(item =>
    !item.id || !item.sourceIds || !Array.isArray(item.sourceIds)
  ) ?? true;
  return Object.freeze({
    passed: missing.length === 0 && !provenanceBroken,
    missing,
    provenanceBroken,
  });
}
