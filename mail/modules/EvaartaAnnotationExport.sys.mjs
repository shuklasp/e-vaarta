/* MPL-2.0 */
export function exportAnnotations(workspace,{documentId=null}={}) {
  return (workspace?.items||[]).filter(item=>item.kind==="annotation" && (!documentId||item.anchor?.documentId===documentId)).map(item=>({id:item.id,title:item.title||"",text:item.text||"",type:item.annotation?.type||"highlight",color:item.annotation?.color||null,documentId:item.anchor?.documentId||null,page:item.anchor?.page??null,quote:item.anchor?.quote||null,selector:item.anchor?.selector||null,createdAt:item.createdAt||null,updatedAt:item.updatedAt||null}));
}
export function serializeAnnotations(workspace,options={}) { return JSON.stringify({version:1,annotations:exportAnnotations(workspace,options)},null,2); }
