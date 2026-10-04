/* SPDX-License-Identifier: MPL-2.0 */
import {
  ProductClass,
  AcceptanceLevel,
  getProductContract,
  createAcceptanceRecord,
  isValidated,
} from "resource:///modules/EvaartaProductContracts.sys.mjs";
import {
  createPdfRequest,
  createPdfPageDescriptor,
  createPdfEvidence,
  validatePdfCapabilityResult,
} from "resource:///modules/EvaartaPdfPlatform.sys.mjs";
import {
  createAutomation,
  authorizeAutomation,
} from "resource:///modules/EvaartaAutomationEngine.sys.mjs";
import {
  createAccessibilityProfile,
  validateAccessibilityProfile,
} from "resource:///modules/EvaartaAccessibility.sys.mjs";

add_task(function testProductContracts() {
  const pdf = getProductContract(ProductClass.PDF);
  Assert.ok(pdf.capabilities.includes("rendering"));
  const record = createAcceptanceRecord({
    productClass: ProductClass.PDF,
    capability: "rendering",
    level: AcceptanceLevel.IMPLEMENTED,
  });
  Assert.ok(!isValidated(record));
});

add_task(function testPdfPlatform() {
  const request = createPdfRequest("render", { page: 1 });
  Assert.equal(request.operation, "render");
  const page = createPdfPageDescriptor({ documentId: "d", page: 2, width: 800, height: 1100 });
  const evidence = createPdfEvidence({
    anchor: { documentId: "d", page: 2, rects: [{ x: 1, y: 2, width: 3, height: 4 }] },
    quote: "test",
  });
  Assert.equal(page.page, 2);
  Assert.equal(evidence.anchor.documentId, "d");
  Assert.ok(validatePdfCapabilityResult({ operation: "render", status: "success" }));
});

add_task(function testAutomationAndAccessibility() {
  const automation = createAutomation({
    id: "a",
    trigger: "document-imported",
    action: "classify",
    requiredCapabilities: ["classification"],
  });
  Assert.ok(authorizeAutomation(automation, ["classification"]));
  Assert.ok(!authorizeAutomation(automation, []));
  Assert.ok(validateAccessibilityProfile(createAccessibilityProfile()));
});

add_task(function testSemanticProductContract() {
  const semantic = getProductContract(ProductClass.SEMANTIC);
  Assert.ok(semantic.capabilities.includes("evidence-action-graph"));
  const record = createAcceptanceRecord({
    productClass: ProductClass.SEMANTIC,
    capability: "evidence-action-graph",
    level: AcceptanceLevel.IMPLEMENTED,
    evidence: ["unit-test"],
  });
  Assert.equal(record.level, AcceptanceLevel.IMPLEMENTED);
});
