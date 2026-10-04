/* MPL-2.0 */
import {createGraphEntity,createGraphRelation,addGraphEntity,addGraphRelation,lineage} from "../mail/modules/EvaartaKnowledgeGraph.sys.mjs";
import {createEvidence,createClaim,createFinding,createDecision} from "../mail/modules/EvaartaEvidenceModel.sys.mjs";
import {createCanvas,addCanvasNode,connectCanvasNodes,layoutCanvas} from "../mail/modules/EvaartaEvidenceCanvas.sys.mjs";
import {createDocumentRevision,makeAnchor,resolveAnchorAcrossRevision} from "../mail/modules/EvaartaDocumentRevisions.sys.mjs";
import {createProject,createTask,createDecisionTaskLink,projectStatus} from "../mail/modules/EvaartaProjectKnowledge.sys.mjs";

add_task(async function test_evaartaKnowledgeSuiteGraph(){
  const graph={entities:[],relations:[]};
  const evidence=createEvidence({documentId:"doc-1",revisionId:"rev-1",anchor:makeAnchor({documentId:"doc-1",revisionId:"rev-1",page:4,quote:"solar"}),text:"solar evidence"});
  const claim=createClaim({text:"solar is useful"});
  const finding=createFinding({text:"finding",claimIds:[claim.id]});
  const decision=createDecision({text:"use solar",findingIds:[finding.id]});
  for(const e of [evidence,claim,finding,decision])addGraphEntity(graph,e);
  addGraphRelation(graph,createGraphRelation({fromId:evidence.id,toId:claim.id,kind:"supports"}));
  addGraphRelation(graph,createGraphRelation({fromId:claim.id,toId:finding.id,kind:"supports"}));
  addGraphRelation(graph,createGraphRelation({fromId:finding.id,toId:decision.id,kind:"supports"}));
  Assert.equal(lineage(graph,decision.id).length,3);
});
add_task(async function test_evaartaCanvasAndRevision(){
  const c=createCanvas();addCanvasNode(c,{entityId:"e1",kind:"evidence"});addCanvasNode(c,{entityId:"e2",kind:"claim"});connectCanvasNodes(c,"e1","e2","supports");layoutCanvas(c);Assert.equal(c.nodes.length,2);Assert.equal(c.edges.length,1);
  const r1=createDocumentRevision({documentId:"d",contentHash:"a"});const a=makeAnchor({documentId:"d",revisionId:r1.id,quote:"hello"});const r2=createDocumentRevision({documentId:"d",contentHash:"b",parentRevisionId:r1.id});const resolved=resolveAnchorAcrossRevision(a,{revisionId:r2.id,text:"hello world"});Assert.equal(resolved.status,"reanchored");
});
add_task(async function test_evaartaProjectStatus(){
 const project=createProject({name:"P"});const a=createTask({title:"A",status:"completed"});const b=createTask({title:"B",status:"open"});const graph={entities:[project,a,b],relations:[createDecisionTaskLink(project.id,a.id)]};Assert.equal(projectStatus(graph).completed,1);
});
