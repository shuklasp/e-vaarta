/* MPL-2.0 */
export class EvaartaConflictResolutionRuntime {
 constructor({mergeEngine}){this.mergeEngine=mergeEngine;}
 reconcile(localEvents,remoteEvents){
  const conflicts=this.mergeEngine.detectConflicts(localEvents,remoteEvents);
  if(!conflicts.length) return {status:"merged",events:this.mergeEngine.mergeEvents(localEvents,remoteEvents),conflicts:[]};
  return {status:"conflict",events:[],conflicts};
 }
 resolve(conflict,resolution){
  if(!conflict||!resolution) throw new Error("resolution required");
  return {conflictId:conflict.id,resolution,status:"resolved"};
 }
}
