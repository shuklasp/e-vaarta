/* MPL-2.0 */
export const ATTACHMENT_STATE=Object.freeze({DISCOVERED:"discovered",QUARANTINED:"quarantined",SAFE:"safe",BLOCKED:"blocked",ARCHIVED:"archived"});
export function createAttachmentRecord({id,name,mime,size,hash,sourceId=null}={}){if(!id||!hash)throw new TypeError("attachment id and content hash required");return Object.freeze({id,name,mime,size,hash,sourceId,state:ATTACHMENT_STATE.DISCOVERED});}
export function dedupeAttachments(items=[]){const seen=new Set();return items.filter(x=>{if(seen.has(x.hash))return false;seen.add(x.hash);return true;});}
export function attachmentScanDecision({malware=false,encrypted=false,sourceTrusted=false}={}){if(malware)return ATTACHMENT_STATE.BLOCKED;if(!sourceTrusted)return ATTACHMENT_STATE.QUARANTINED;return ATTACHMENT_STATE.SAFE;}
export function attachmentLifecycle(record,{state=record.state,retention=null}={}){return Object.freeze({...record,state,retention});}
