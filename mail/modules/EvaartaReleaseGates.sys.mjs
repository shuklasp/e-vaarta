/* MPL-2.0 */
/**
 * e-Vaarta production release gates.
 *
 * A capability can advance only when objective evidence exists for the
 * applicable validation dimensions. This module deliberately does not
 * manufacture validation results.
 */

export const ValidationDimension = Object.freeze({
  UNIT: "unit",
  INTEGRATION: "integration",
  REAL_DATA: "real-data",
  ADVERSARIAL: "adversarial",
  PERFORMANCE: "performance",
  ACCESSIBILITY: "accessibility",
  DEVICE_OFFLINE: "device-offline",
  INTEROPERABILITY: "interoperability",
  HUMAN_BENCHMARK: "human-benchmark",
});

export const REQUIRED_DIMENSIONS = Object.freeze(Object.values(ValidationDimension));

export const ReleaseStatus = Object.freeze({
  CONTRACTED: "contracted",
  IMPLEMENTED: "implemented",
  INTEGRATED: "integrated",
  VALIDATED: "validated",
  BLOCKED: "blocked",
});

export function createValidationEvidence({
  dimension,
  status = "pending",
  artifact = null,
  corpusId = null,
  version = null,
  hardware = null,
  notes = "",
} = {}) {
  if (!REQUIRED_DIMENSIONS.includes(dimension)) {
    throw new RangeError("unsupported validation dimension");
  }
  if (!["pending", "passed", "failed", "not-applicable"].includes(status)) {
    throw new RangeError("unsupported validation status");
  }
  return Object.freeze({
    dimension,
    status,
    artifact,
    corpusId,
    version,
    hardware,
    notes,
  });
}

export function createReleaseRecord({
  productClass,
  capability,
  evidence = [],
  implementationStatus = "implemented",
} = {}) {
  if (!productClass || !capability) {
    throw new TypeError("productClass and capability are required");
  }
  return Object.freeze({
    productClass,
    capability,
    implementationStatus,
    evidence: evidence.map(item => createValidationEvidence(item)),
  });
}

export function evaluateReleaseGate(record, {
  requireHumanBenchmark = true,
  requireDeviceOffline = true,
} = {}) {
  const applicable = REQUIRED_DIMENSIONS.filter(dimension =>
    (dimension !== ValidationDimension.HUMAN_BENCHMARK || requireHumanBenchmark) &&
    (dimension !== ValidationDimension.DEVICE_OFFLINE || requireDeviceOffline)
  );
  const evidence = new Map(record.evidence.map(item => [item.dimension, item]));
  const missing = [];
  const failed = [];
  for (const dimension of applicable) {
    const item = evidence.get(dimension);
    if (!item || item.status === "pending") {
      missing.push(dimension);
    } else if (item.status === "failed") {
      failed.push(dimension);
    }
  }
  const validated = missing.length === 0 && failed.length === 0 &&
    record.implementationStatus === "integrated";
  return Object.freeze({
    status: validated ? ReleaseStatus.VALIDATED :
      failed.length ? ReleaseStatus.BLOCKED : ReleaseStatus.INTEGRATED,
    validated,
    missing,
    failed,
  });
}

export function createValidationMatrix(productClasses) {
  return Object.freeze(productClasses.map(productClass => Object.freeze({
    productClass,
    dimensions: REQUIRED_DIMENSIONS.map(dimension => Object.freeze({
      dimension,
      status: "pending",
    })),
  })));
}
