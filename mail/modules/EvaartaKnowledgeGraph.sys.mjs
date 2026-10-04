/* MPL-2.0 */
/** Typed semantic graph for documents, evidence, claims and project execution. */
export const GraphEntityKind = Object.freeze({
  DOCUMENT:"document", REVISION:"revision", ANNOTATION:"annotation", EVIDENCE:"evidence",
  NOTE:"note", CLAIM:"claim", ARGUMENT:"argument", FINDING:"finding", DECISION:"decision",
  TASK:"task", PERSON:"person", PROJECT:"project", SOURCE:"source"
});
export const GraphRelation = Object.freeze({
  SUPPORTS:"supports", CONTRADICTS:"contradicts", DERIVED_FROM:"derived-from",
  REFERENCES:"references", RELATES_TO:"relates-to", QUALIFIES:"qualifies",
  ANSWERS:"answers", RAISES:"raises", DEPENDS_ON:"depends-on", CAUSED_BY:"caused-by",
  IMPLEMENTS:"implements", RESULTS_IN:"results-in", ASSIGNED_TO:"assigned-to",
  VERIFIED_BY:"verified-by", SUPERSEDES:"supersedes"
});
function uid(prefix){ return prefix+"-"+(globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)); }
export function createGraphEntity(kind, data={}) {
  if(!Object.values(GraphEntityKind).includes(kind)) throw new TypeError("Unsupported graph entity kind");
  const now=new Date().toISOString();
  return {id:data.id||uid(kind),kind,...data,createdAt:data.createdAt||now,updatedAt:data.updatedAt||now};
}
export function createGraphRelation({fromId,toId,kind,confidence=null,provenance=null}={}) {
  if(!fromId||!toId||fromId===toId) throw new TypeError("Valid distinct graph endpoints are required");
  if(!Object.values(GraphRelation).includes(kind)) throw new TypeError("Unsupported graph relation");
  return {id:uid("rel"),fromId,toId,kind,confidence,provenance,createdAt:new Date().toISOString()};
}
export function addGraphEntity(graph,entity){ graph.entities ||= []; if(!graph.entities.some(x=>x.id===entity.id)) graph.entities.push(entity); return graph; }
export function addGraphRelation(graph,relation){
  graph.relations ||= [];
  if(!graph.entities.some(x=>x.id===relation.fromId)||!graph.entities.some(x=>x.id===relation.toId)) throw new TypeError("Graph endpoint does not exist");
  if(!graph.relations.some(x=>x.fromId===relation.fromId&&x.toId===relation.toId&&x.kind===relation.kind)) graph.relations.push(relation);
  return graph;
}
export function neighbors(graph,id,relationKind=null){
  const ids=new Set((graph.relations||[]).filter(r=>!relationKind||r.kind===relationKind).flatMap(r=>r.fromId===id?[r.toId]:r.toId===id?[r.fromId]:[]));
  return (graph.entities||[]).filter(e=>ids.has(e.id));
}
export function lineage(graph,id,{direction="up",maxDepth=20}={}){
  const result=[]; const seen=new Set([id]); let frontier=[id];
  for(let depth=0;depth<maxDepth&&frontier.length;depth++){
    const next=[];
    for(const current of frontier){
      for(const r of graph.relations||[]){
        const candidate=direction==="up"&&r.toId===current?r.fromId:direction==="down"&&r.fromId===current?r.toId:null;
        if(candidate&&!seen.has(candidate)){seen.add(candidate);next.push(candidate);result.push({depth:depth+1,relation:r,entity:(graph.entities||[]).find(e=>e.id===candidate)});}
      }
    }
    frontier=next;
  }
  return result;
}
export function graphStats(graph){return {entities:(graph.entities||[]).length,relations:(graph.relations||[]).length,byKind:Object.fromEntries(Object.values(GraphEntityKind).map(k=>[k,(graph.entities||[]).filter(e=>e.kind===k).length]))};}
