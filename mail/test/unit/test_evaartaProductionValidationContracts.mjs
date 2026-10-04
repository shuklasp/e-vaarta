/* SPDX-License-Identifier: MPL-2.0 */
import { createValidationEvidence, createReleaseRecord, evaluateReleaseGate } from "resource:///modules/EvaartaReleaseGates.sys.mjs";
import { benchmarkTasks, createBenchmarkCase, createBenchmarkResult } from "resource:///modules/EvaartaBenchmarkSuite.sys.mjs";
import { createPdfFidelityCase, createPdfFidelityResult, redactionIsSecure } from "resource:///modules/EvaartaPdfFidelity.sys.mjs";
import { createSearchBenchmark, createSearchResult, meetsSearchTarget } from "resource:///modules/EvaartaSearchBenchmark.sys.mjs";
import { createFaultScenario, createRecoveryResult, recoveryPassed, Fault } from "resource:///modules/EvaartaRecoveryHarness.sys.mjs";
import { createThreatCase, createThreatResult, Threat } from "resource:///modules/EvaartaSecurityThreatModel.sys.mjs";
import { createRoundTripCase, createRoundTripResult, roundTripPassed, lossReport } from "resource:///modules/EvaartaInteroperabilityHarness.sys.mjs";
import { createAccessibilityCase, createAccessibilityResult, AccessibilityMode } from "resource:///modules/EvaartaAccessibilityBenchmark.sys.mjs";
import { createEvidenceActionCase, validateEvidenceActionTrace } from "resource:///modules/EvaartaEvidenceToActionBenchmark.sys.mjs";

add_task(function testReleaseGate() {
  const dimensions = ["unit","integration","real-data","adversarial","performance","accessibility","device-offline","interoperability","human-benchmark"];
  const record = createReleaseRecord({
    productClass:"pdf", capability:"rendering", implementationStatus:"integrated",
    evidence: dimensions.map(d => createValidationEvidence({dimension:d,status:"passed"}))
  });
  const gate = evaluateReleaseGate(record);
  Assert.equal(gate.status,"validated");
  Assert.ok(gate.validated);
});

add_task(function testBenchmarkSuite() {
  Assert.ok(benchmarkTasks("pdf").includes("redact"));
  const c = createBenchmarkCase({id:"b1",domain:"pdf",task:"open",corpusId:"pdf-corpus-v1"});
  const r = createBenchmarkResult({caseId:c.id,product:"e-vaarta",version:"dev",elapsedMs:10,completed:true});
  Assert.equal(r.completed,true);
});

add_task(function testPdfFidelity() {
  const c = createPdfFidelityCase({id:"p1",sourceId:"doc",operation:"redact"});
  const r = createPdfFidelityResult({caseId:c.id,passed:true,recoveredContent:false});
  Assert.ok(redactionIsSecure(r));
});

add_task(function testSearch() {
  const b = createSearchBenchmark({id:"s1",corpusId:"search-v1",queryCount:10});
  const r = createSearchResult({benchmarkId:b.id,metrics:{recall:.95,"p95-latency-ms":100}});
  Assert.ok(meetsSearchTarget(r,{recall:.9,"p95-latency-ms":200}));
});

add_task(function testRecoverySecurityInteropAccessibility() {
  const scenario = createFaultScenario({id:"f1",fault:Fault.PROCESS_CRASH});
  Assert.ok(recoveryPassed(createRecoveryResult({scenarioId:scenario.id,recovered:true})));
  const threat = createThreatCase({id:"t1",threat:Threat.MALICIOUS_PDF,control:"sandbox",expected:"blocked"});
  Assert.ok(createThreatResult({caseId:threat.id,passed:true}).passed);
  const rt = createRoundTripResult({caseId:"rt",preserved:["text"],converted:["font"],lost:[],warnings:[]});
  Assert.ok(roundTripPassed(rt));
  Assert.equal(lossReport(rt).lost,0);
  const a = createAccessibilityCase({id:"a1",mode:AccessibilityMode.KEYBOARD,workflow:"open-and-annotate",expected:"complete"});
  Assert.ok(createAccessibilityResult({caseId:a.id,passed:true}).passed);
});

add_task(function testEvidenceAction() {
  const c = createEvidenceActionCase({id:"e1",seedId:"mail-1"});
  const trace = c.requiredStages.map((stage,index) => ({stage,id:"n"+index,sourceIds:["s"+index]}));
  const result = validateEvidenceActionTrace(trace);
  Assert.ok(result.passed);
});
