/* MPL-2.0 */
export const AnchorStatus=Object.freeze({EXACT:"exact",REANCHORED:"reanchored",APPROXIMATE:"approximate",UNRESOLVED:"unresolved",STALE:"stale"});
function uid(p){return p+"-"+(globalThis.crypto?.randomUUID?.()||Math.random().toString(36).slice(2));}
export function createDocumentRevision({documentId,contentHash,size=null,mimeType=null,sourcePath=null,createdBy="local",parentRevisionId=null}={}){
 if(!documentId||!contentHash) throw new TypeError("documentId and contentHash are required");
 return {id:uid("rev"),documentId,contentHash,size,mimeType,sourcePath,createdBy,parentRevisionId,createdAt:new Date().toISOString()};
}
export function compareRevisions(a,b){return {sameContent:a?.contentHash===b?.contentHash,sizeDelta:(b?.size||0)-(a?.size||0),parentMatch:a?.parentRevisionId===b?.id};}
export function makeAnchor({documentId,revisionId=null,page=null,startOffset=null,endOffset=null,quote=null,selector=null,rects=null}={}){
 return {documentId,revisionId,page,startOffset,endOffset,quote,selector,rects};
}
export function resolveAnchorAcrossRevision(anchor,{revisionId,text="",candidateText=""}={}){
 if(anchor?.revisionId===revisionId&&anchor.startOffset!=null&&anchor.endOffset!=null) return {status:AnchorStatus.EXACT,method:"offset",anchor};
 if(anchor?.quote&&text){const i=text.indexOf(anchor.quote);if(i>=0)return {status:AnchorStatus.REANCHORED,method:"quote",anchor:{...anchor,revisionId,startOffset:i,endOffset:i+anchor.quote.length}};}
 if(anchor?.selector) return {status:AnchorStatus.APPROXIMATE,method:"selector",anchor:{...anchor,revisionId}};
 if(candidateText&&anchor?.quote&&candidateText.includes(anchor.quote)) return {status:AnchorStatus.REANCHORED,method:"candidate-quote",anchor:{...anchor,revisionId}};
 return {status:AnchorStatus.STALE,method:null,anchor};
}
