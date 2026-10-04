/* MPL-2.0 */
export function buildEvidenceTimeline(workspace,documentId) {
  return (workspace?.items||[]).filter(i=>i.anchor?.documentId===documentId).sort((a,b)=>(a.anchor?.page??Number.MAX_SAFE_INTEGER)-(b.anchor?.page??Number.MAX_SAFE_INTEGER)||(a.anchor?.startOffset??Number.MAX_SAFE_INTEGER)-(b.anchor?.startOffset??Number.MAX_SAFE_INTEGER)||String(a.id).localeCompare(String(b.id))).map((item,index)=>({index,id:item.id,kind:item.kind,title:item.title||item.kind,text:item.text||item.anchor?.quote||"",page:item.anchor?.page??null}));
}