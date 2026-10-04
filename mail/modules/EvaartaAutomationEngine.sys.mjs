/* MPL-2.0 */

/**
 * Auditable local automation. Actions are data until a permissioned executor
 * explicitly accepts them.
 */

export function createAutomation({
  id, trigger, conditions = [], action, requiredCapabilities = [],
}) {
  if (!id || !trigger || !action) {
    throw new TypeError("automation id, trigger and action are required");
  }
  return Object.freeze({
    id, trigger, conditions: [...conditions], action,
    requiredCapabilities: [...requiredCapabilities],
  });
}

export function evaluateConditions(context, conditions) {
  return conditions.every(condition => {
    if (typeof condition === "function") return Boolean(condition(context));
    if (condition?.field) return context?.[condition.field] === condition.equals;
    return false;
  });
}

export function authorizeAutomation(automation, capabilities = []) {
  return automation.requiredCapabilities.every(
    required => capabilities.includes(required)
  );
}

export function createAutomationExecution({
  automationId, context, result, auditEvent, undo = null,
}) {
  return Object.freeze({
    automationId,
    context: structuredClone(context),
    result: structuredClone(result),
    auditEvent: structuredClone(auditEvent),
    undo,
  });
}
