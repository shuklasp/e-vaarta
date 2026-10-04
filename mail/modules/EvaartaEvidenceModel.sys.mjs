/* MPL-2.0 */
import {GraphEntityKind,GraphRelation,createGraphEntity,createGraphRelation,addGraphEntity,addGraphRelation} from "./EvaartaKnowledgeGraph.sys.mjs";
export const EvidenceType=Object.freeze({QUOTE:"quote",HIGHLIGHT:"highlight",IMAGE:"image",TABLE:"table",OBSERVATION:"observation",EMAIL:"email",ATTACHMENT:"attachment"});
export const EvidenceStatus=Object.freeze({ACTIVE:"active",STALE:"stale",REANCHORED:"reanchored",OBSOLETE:"obsolete"});
export function createEvidence({documentId,revisionId=null,anchor,text="",type=EvidenceType.QUOTE,title=null,authorId=null,confidence=null}={}){
  if(!documentId||!anchor) throw new TypeError("Evidence requires documentId and anchor");
  return createGraphEntity(GraphEntityKind.EVIDENCE,{documentId,revisionId,anchor,text:String(text).trim(),type,title,authorId,confidence,status:EvidenceStatus.ACTIVE});
}
export function createClaim({text,evidenceIds=[],authorId=null,confidence=null}={}){return createGraphEntity(GraphEntityKind.CLAIM,{text:String(text||"").trim(),evidenceIds,authorId,confidence});}
export function createFinding({text,claimIds=[],evidenceIds=[],authorId=null,confidence=null}={}){return createGraphEntity(GraphEntityKind.FINDING,{text:String(text||"").trim(),claimIds,evidenceIds,authorId,confidence});}
export function createDecision({text,findingIds=[],evidenceIds=[],authorId=null}={}){return createGraphEntity(GraphEntityKind.DECISION,{text:String(text||"").trim(),findingIds,evidenceIds,authorId});}
export function createEvidenceRelation(fromId,toId,kind=GraphRelation.SUPPORTS,provenance=null){return createGraphRelation({fromId,toId,kind,provenance});}
export function attachEvidence(graph,evidence,targetId,relation=GraphRelation.SUPPORTS){addGraphEntity(graph,evidence);addGraphRelation(graph,createEvidenceRelation(evidence.id,targetId,relation));return graph;}
export function evidenceLineage(graph,id){return {upstream:graph.relations?.filter(r=>r.toId===id)||[],downstream:graph.relations?.filter(r=>r.fromId===id)||[]};}
