/* SPDX-License-Identifier: MPL-2.0 */
import { createPdfProductionRequest, createRedaction, createSignatureIntent, validateProductionResult } from "resource:///modules/EvaartaPdfProduction.sys.mjs";
import { createResearchWorkspace, createResearchCard, createResearchLink } from "resource:///modules/EvaartaResearchInteraction.sys.mjs";
import { normalizeScholarlyRecord, createCitationLocator, citationRoundTrip } from "resource:///modules/EvaartaScholarlyCitations.sys.mjs";
import { createMarkdownDocument, parseFrontmatter, createVaultIndex } from "resource:///modules/EvaartaMarkdownVault.sys.mjs";
import { createAiProvider, createGroundedAiRequest, validateGrounding } from "resource:///modules/EvaartaLocalAI.sys.mjs";
import { createSemanticEvent, createConflict, resolveConflict } from "resource:///modules/EvaartaSemanticCollaboration.sys.mjs";
import { createCapture, createCaptureEvidence } from "resource:///modules/EvaartaMobileCapture.sys.mjs";

add_task(function testPdfProduction() {
  Assert.equal(createPdfProductionRequest("redact").operation, "redact");
  Assert.equal(createRedaction({documentId:"d",page:1}).page,1);
  Assert.equal(createSignatureIntent({documentId:"d",signerId:"s"}).signerId,"s");
  Assert.ok(validateProductionResult({operation:"redact",status:"success"}));
});
add_task(function testResearch() {
  const card=createResearchCard({id:"c",sourceId:"d",anchor:{page:1},text:"evidence"});
  const ws=createResearchWorkspace({id:"w",cards:[card]});
  Assert.equal(ws.cards[0].sourceId,"d");
  Assert.equal(createResearchLink({from:"c",to:"d"}).type,"supports");
});
add_task(function testCitations() {
  const r=normalizeScholarlyRecord({title:"T",doi:"https://doi.org/10.1000/Test"});
  Assert.equal(r.DOI,"10.1000/test");
  Assert.equal(createCitationLocator({sourceId:r.id,page:2}).page,2);
  Assert.equal(citationRoundTrip(r).stableId,r.id);
});
add_task(function testMarkdown() {
  const p=parseFrontmatter("---\ntags: [a]\n---\nBody");
  Assert.equal(p.frontmatter.tags,"[a]");
  const d=createMarkdownDocument({id:"d",path:"d.md",markdown:"[[other]]"});
  Assert.deepEqual(createVaultIndex([d]).links.get("d"),["other"]);
});
add_task(function testAIAndCollaboration() {
  const provider=createAiProvider({id:"local",capabilities:["chat"]});
  Assert.equal(provider.locality,"local");
  const req=createGroundedAiRequest({query:"q",sourceIds:["d"],evidenceIds:["e"]});
  Assert.deepEqual(req.evidenceIds,["e"]);
  Assert.ok(validateGrounding({citations:[{sourceId:"d",evidenceId:"e"}]}));
  const event=createSemanticEvent({id:"e",actorId:"a",lamport:1,objectId:"d",type:"create"});
  Assert.equal(event.objectId,"d");
  Assert.equal(resolveConflict(createConflict({objectId:"d",baseRevision:"r",local:"a",remote:"b"}),"merged","a").resolution,"merged");
});
add_task(function testMobileCapture() {
  const c=createCapture({id:"c",type:"scan",uri:"file://scan"});
  Assert.equal(createCaptureEvidence({captureId:c.id,quote:"text"}).captureId,"c");
});
