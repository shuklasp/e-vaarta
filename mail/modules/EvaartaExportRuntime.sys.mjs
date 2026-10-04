/* MPL-2.0 */
export const EXPORT_OPERATION=Object.freeze({MESSAGE:"message",CONVERSATION:"conversation",DOCUMENT:"document",EVIDENCE:"evidence",PROJECT:"project",REPORT:"report"});
export function createExportJob({id,operation,format,entityIds=[],includeProvenance=true}={}){return Object.freeze({id,operation,format,entityIds:[...entityIds],includeProvenance,status:"queued"});}
export function completeExportJob(job,{artifactId,warnings=[]}={}){return Object.freeze({...job,artifactId,warnings:[...warnings],status:"completed"});}
export function failExportJob(job,reason){return Object.freeze({...job,status:"failed",reason});}
