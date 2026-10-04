/* MPL-2.0 */
/**
 * Import/export round-trip validation contract.
 */

export function createRoundTripCase({
  id, format, sourceId, expectedPreserved = [], expectedLoss = [],
} = {}) {
  if (!id || !format || !sourceId) throw new TypeError("id, format and sourceId are required");
  return Object.freeze({ id, format, sourceId, expectedPreserved: [...expectedPreserved], expectedLoss: [...expectedLoss] });
}

export function createRoundTripResult({
  caseId, preserved = [], converted = [], lost = [], warnings = [],
} = {}) {
  if (!caseId) throw new TypeError("caseId is required");
  return Object.freeze({ caseId, preserved: [...preserved], converted: [...converted], lost: [...lost], warnings: [...warnings] });
}

export function roundTripPassed(result, allowedLoss = []) {
  const allowed = new Set(allowedLoss);
  return result.lost.every(item => allowed.has(item));
}

export function lossReport(result) {
  return Object.freeze({
    preserved: result.preserved.length,
    converted: result.converted.length,
    lost: result.lost.length,
    warnings: result.warnings.length,
  });
}
