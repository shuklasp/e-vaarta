/* MPL-2.0 */
/**
 * Recovery/fault-injection contract.
 */

export const Fault = Object.freeze({
  PROCESS_CRASH: "process-crash",
  POWER_LOSS: "power-loss",
  DISK_FULL: "disk-full",
  INDEX_CORRUPTION: "index-corruption",
  INTERRUPTED_WRITE: "interrupted-write",
  NETWORK_LOSS: "network-loss",
  DUPLICATE_EVENT: "duplicate-event",
  CLOCK_SKEW: "clock-skew",
  MALFORMED_INPUT: "malformed-input",
});

export function createFaultScenario({ id, fault, checkpoint = null } = {}) {
  if (!id || !Object.values(Fault).includes(fault)) {
    throw new RangeError("invalid fault scenario");
  }
  return Object.freeze({ id, fault, checkpoint });
}

export function createRecoveryResult({
  scenarioId,
  recovered = false,
  dataLoss = false,
  semanticLoss = false,
  details = "",
} = {}) {
  if (!scenarioId) throw new TypeError("scenarioId is required");
  return Object.freeze({
    scenarioId, recovered: Boolean(recovered),
    dataLoss: Boolean(dataLoss), semanticLoss: Boolean(semanticLoss), details,
  });
}

export function recoveryPassed(result) {
  return result?.recovered === true &&
    result.dataLoss === false &&
    result.semanticLoss === false;
}
