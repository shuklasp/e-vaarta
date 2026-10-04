/* MPL-2.0 */
/**
 * Accessibility workflow benchmark contract.
 */

export const AccessibilityMode = Object.freeze({
  KEYBOARD: "keyboard",
  SCREEN_READER: "screen-reader",
  REFLOW: "reflow",
  TEXT_SCALE: "text-scale",
  HIGH_CONTRAST: "high-contrast",
  FOCUS: "focus",
  REDUCED_MOTION: "reduced-motion",
});

export function createAccessibilityCase({ id, mode, workflow, expected } = {}) {
  if (!id || !Object.values(AccessibilityMode).includes(mode) || !workflow || !expected) {
    throw new TypeError("invalid accessibility case");
  }
  return Object.freeze({ id, mode, workflow, expected });
}

export function createAccessibilityResult({ caseId, passed, blockers = [], notes = "" } = {}) {
  if (!caseId) throw new TypeError("caseId is required");
  return Object.freeze({ caseId, passed: Boolean(passed), blockers: [...blockers], notes });
}
