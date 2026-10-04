/* MPL-2.0 */
/**
 * Security test taxonomy. This is a threat-model contract, not a claim of
 * security certification.
 */

export const Threat = Object.freeze({
  MALICIOUS_PDF: "malicious-pdf",
  MALICIOUS_ATTACHMENT: "malicious-attachment",
  SCRIPTED_CONTENT: "scripted-content",
  COMPROMISED_PEER: "compromised-peer",
  STOLEN_DEVICE: "stolen-device",
  POISONED_AI_CONTENT: "poisoned-ai-content",
  CORRUPTED_VAULT: "corrupted-vault",
  UNSAFE_EXTERNAL_LINK: "unsafe-external-link",
  REDACTION_RECOVERY: "redaction-recovery",
  SIGNATURE_TAMPERING: "signature-tampering",
});

export function createThreatCase({ id, threat, control, expected } = {}) {
  if (!id || !Object.values(Threat).includes(threat) || !control || !expected) {
    throw new TypeError("id, threat, control and expected are required");
  }
  return Object.freeze({ id, threat, control, expected });
}

export function createThreatResult({ caseId, passed, evidence = null, notes = "" } = {}) {
  if (!caseId) throw new TypeError("caseId is required");
  return Object.freeze({ caseId, passed: Boolean(passed), evidence, notes });
}
