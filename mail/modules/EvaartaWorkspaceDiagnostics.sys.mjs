/* MPL-2.0 */
export function diagnoseWorkspace(workspace) {
  const issues=[],documents=workspace?.documents||[],ids=new Set();
  for(const document of documents){if(!document.id)issues.push({code:"document-missing-id",severity:"error"});if(ids.has(document.id))issues.push({code:"duplicate-document-id",severity:"error",id:document.id});ids.add(document.id);}
  const itemIds=new Set((workspace?.items||[]).map(i=>i.id));
  for(const item of workspace?.items||[]) if(item.anchor?.documentId&&!ids.has(item.anchor.documentId)) issues.push({code:"orphaned-item-anchor",severity:"warning",itemId:item.id,documentId:item.anchor.documentId});
  for(const link of workspace?.links||[]) { if(!ids.has(link.fromId)&&!itemIds.has(link.fromId))issues.push({code:"orphaned-link-source",severity:"warning",linkId:link.id}); if(!ids.has(link.toId)&&!itemIds.has(link.toId))issues.push({code:"orphaned-link-target",severity:"warning",linkId:link.id}); }
  return {healthy:!issues.some(i=>i.severity==="error"),counts:{errors:issues.filter(i=>i.severity==="error").length,warnings:issues.filter(i=>i.severity==="warning").length},issues};
}
