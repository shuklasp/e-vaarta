/* MPL-2.0 */
export function filterWorkspaceDocuments(workspace,{query="",kind="all",collectionId=null,collectionResolver=null}={}) {
  const needle=String(query||"").trim().toLocaleLowerCase();
  let documents=[...(workspace?.documents||[])];
  if(kind!=="all") documents=documents.filter(d=>d.kind===kind);
  if(collectionId&&collectionResolver) documents=collectionResolver(collectionId);
  if(!needle)return documents;
  return documents.filter(d=>[d.title,d.description,...(d.tags||[])].join(" ").toLocaleLowerCase().includes(needle));
}