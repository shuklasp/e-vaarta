/* MPL-2.0 */
import { Assert } from "./head.js";
import {
  EvaartaRuntimeCapability,
  createRuntimeAdapter,
  requireRuntimeOperation,
  createProductRuntimePlan,
  buildEvidenceActionTrace,
} from "../../modules/EvaartaProductionRuntime.sys.mjs";

add_task(function testRuntimeAdapter() {
  const adapter = createRuntimeAdapter(EvaartaRuntimeCapability.PDF, {
    open: source => ({ source }),
  });
  Assert.equal(adapter.supports("open"), true);
  Assert.equal(adapter.supports("redact"), false);
  Assert.equal(requireRuntimeOperation(adapter, "open")("a.pdf").source, "a.pdf");
});

add_task(function testRuntimeOperationIsExplicit() {
  const adapter = createRuntimeAdapter(EvaartaRuntimeCapability.AI);
  Assert.throws(
    () => requireRuntimeOperation(adapter, "chat"),
    /Runtime operation not bound/
  );
});

add_task(function testTierCoverage() {
  const plan = createProductRuntimePlan();
  Assert.ok(plan.tier1.includes("pdf"));
  Assert.ok(plan.tier2.includes("research"));
  Assert.ok(plan.tier3.includes("end-to-end-traceability"));
});

add_task(function testEvidenceTrace() {
  const trace = buildEvidenceActionTrace({
    communication: "c1", document: "d1", evidence: "e1", claim: "c2",
    finding: "f1", decision: "dec1", task: "t1", project: "p1",
    report: "r1", citation: "cit1",
  });
  Assert.equal(trace.length, 10);
  Assert.equal(trace[0].stage, "communication");
  Assert.equal(trace[9].stage, "citation");
});
