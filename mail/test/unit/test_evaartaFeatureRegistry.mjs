import assert from "node:assert/strict";
import {
  FeatureStatus,
  featureStatus,
  getFeatureCapability,
  hasFeatureStatus,
  listFeatureCapabilities,
} from "../../modules/EvaartaFeatureRegistry.sys.mjs";

assert.equal(featureStatus("workspace"), FeatureStatus.IMPLEMENTED);
assert.equal(featureStatus("spatial-canvas"), FeatureStatus.CONTRACTED);
assert.equal(featureStatus("missing"), null);
assert.equal(hasFeatureStatus("workspace", FeatureStatus.IMPLEMENTED), true);
assert.equal(hasFeatureStatus("workspace", FeatureStatus.VALIDATED), false);
assert.equal(hasFeatureStatus("spatial-canvas", FeatureStatus.IMPLEMENTED), false);
assert.equal(getFeatureCapability("secure-sync").area, "security");
assert.ok(listFeatureCapabilities().length >= 20);

console.log("e-Vaarta feature registry tests passed");
