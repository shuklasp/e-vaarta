/* MPL-2.0 */
export function resolveAnchor(document,anchor,{text=""}={}) {
  if(!anchor?.documentId || anchor.documentId!==document?.id) return {status:"invalid",reason:"document-mismatch"};
  if(anchor.startOffset!=null && anchor.endOffset!=null && anchor.endOffset>=anchor.startOffset) return {status:"exact",method:"offset",startOffset:anchor.startOffset,endOffset:anchor.endOffset};
  if(anchor.selector) return {status:"selector",method:"selector",selector:anchor.selector};
  if(anchor.quote && text){const start=text.indexOf(anchor.quote);if(start>=0)return {status:"exact",method:"quote",startOffset:start,endOffset:start+anchor.quote.length};}
  if(anchor.quote) return {status:"approximate",method:"quote",quote:anchor.quote};
  if(anchor.page!=null) return {status:"page",method:"page",page:anchor.page};
  return {status:"unresolved",method:null};
}
