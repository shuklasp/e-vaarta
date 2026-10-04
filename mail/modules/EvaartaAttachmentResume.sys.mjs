/* MPL-2.0 */
export class EvaartaAttachmentResume {
 constructor({store}){this.store=store;}
 checkpoint(attachmentId,total,received){this.store.save?.({attachmentId,total,received:[...new Set(received)].sort((a,b)=>a-b)});}
 missing(attachmentId,total){const state=this.store.load?.(attachmentId);const received=new Set(state?.received??[]);return Array.from({length:total},(_,i)=>i).filter(i=>!received.has(i));}
 complete(attachmentId,total){return this.missing(attachmentId,total).length===0;}
}
