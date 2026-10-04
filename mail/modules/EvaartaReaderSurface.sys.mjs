/* MPL-2.0 */
export function createReaderSurface(workspace, documentId) { const document=workspace?.documents?.find(d=>d.id===documentId)||null; return {documentId,document,mode:"read",canAnnotate:!!document,canCaptureEvidence:!!document}; }
export function readerSelection(text,start=0,end=text?.length||0){ return {text:String(text||"").slice(start,end),start,end}; }