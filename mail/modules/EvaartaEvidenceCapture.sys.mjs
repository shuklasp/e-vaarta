/* MPL-2.0 */
export function normalizeCaptureSelection({documentId,text,page=null,startOffset=null,endOffset=null,quote=null}={}) {
  if(!documentId) throw new TypeError("documentId is required.");
  const normalizedText=String(text||"").trim();
  if(!normalizedText) throw new TypeError("Selected text is required.");
  return {documentId,text:normalizedText,page:page==null?null:Math.max(1,Number(page)),startOffset:startOffset==null?null:Math.max(0,Number(startOffset)),endOffset:endOffset==null?null:Math.max(0,Number(endOffset)),quote:quote==null?normalizedText:String(quote)};
}
export function isDuplicateEvidence(workspace,capture) {
  return (workspace?.items||[]).some(item=>item.anchor?.documentId===capture.documentId && String(item.text||"").trim()===capture.text && item.anchor?.page===capture.page && item.anchor?.startOffset===capture.startOffset);
}
