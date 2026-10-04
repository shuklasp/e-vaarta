/* MPL-2.0 */
export class EvaartaRevocationEngine {
 constructor({trustStore,capabilities,replayGuard}){Object.assign(this,{trustStore,capabilities,replayGuard});}
 revoke(actorId,reason="revoked"){
  this.trustStore.revoke(actorId);
  this.capabilities?.revoke?.(actorId);
  this.replayGuard?.revoke?.(actorId);
  return {actorId,reason,status:"revoked"};
 }
 assertUsable(actorId){if(!this.trustStore.isTrusted(actorId)) throw new Error("peer is revoked or untrusted");}
}
