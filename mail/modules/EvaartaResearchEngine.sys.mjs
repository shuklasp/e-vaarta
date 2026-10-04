/* MPL-2.0 */
export function tokenize(value){return String(value||"").toLocaleLowerCase().split(/[^\p{L}\p{N}_-]+/u).filter(x=>x.length>1);}
export function searchDocuments(workspace,query,{kind=null,tag=null,projectId=null,limit=200}={}){
 const q=tokenize(query),docs=workspace?.documents||[];
 return docs.filter(d=>{
  if(kind&&d.kind!==kind)return false;if(tag&&!(d.tags||[]).some(t=>t.toLocaleLowerCase()===String(tag).toLocaleLowerCase()))return false;
  if(projectId&&d.projectId!==projectId)return false;
  const hay=tokenize([d.title,d.description,...(d.tags||[]),d.text].join(" ")); const set=new Set(hay);
  return !q.length||q.every(t=>set.has(t)||hay.some(x=>x.includes(t)));
 }).slice(0,limit);
}
export function searchEvidence(graph,query,{relation=null,documentId=null,limit=200}={}){
 const q=tokenize(query);
 return (graph?.entities||[]).filter(e=>{
  if(e.kind!=="evidence"&&e.kind!=="claim"&&e.kind!=="finding")return false;
  if(documentId&&e.documentId!==documentId)return false;
  if(!q.length)return true; const hay=tokenize([e.text,e.title,e.type].join(" "));
  return q.every(t=>hay.some(x=>x.includes(t)));
 }).slice(0,limit);
}
export function buildLiteratureMatrix(documents,evidence){
 return documents.map(d=>({documentId:d.id,title:d.title,authors:d.authors||[],year:d.year||null,evidence:(evidence||[]).filter(e=>e.documentId===d.id).map(e=>({id:e.id,text:e.text,type:e.type}))}));
}
