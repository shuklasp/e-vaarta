/* MPL-2.0 */
export function createAttachmentAck(attachmentId,received){return {version:1,attachmentId,received:[...new Set(received)].sort((a,b)=>a-b)};}
export function nextAttachmentChunks(total,received){const set=new Set(received??[]);return Array.from({length:total},(_,i)=>i).filter(i=>!set.has(i));}
