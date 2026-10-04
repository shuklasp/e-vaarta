/* MPL-2.0 */
import {validateRuntimeMessage} from "./EvaartaRuntimeProtocol.sys.mjs";
export class EvaartaRuntimeReceiver {
 constructor({trustStore,replayGuard,syncEngine,attachmentAssembler,capabilityChecker=()=>true}){Object.assign(this,{trustStore,replayGuard,syncEngine,attachmentAssembler,capabilityChecker});}
 async receive(message,{peerId,session,capabilities=[]}={}) {
  validateRuntimeMessage(message);
  if(!session?.authenticated) throw new Error("unauthenticated runtime session");
  if(!this.trustStore.isTrusted(peerId)) throw new Error("untrusted runtime peer");
  if(this.replayGuard?.seen(message.messageId)) return {status:"duplicate",messageId:message.messageId};
  this.replayGuard?.record(message.messageId);
  if(message.type==="events") return this.syncEngine.acceptEvents(message.payload.events,{sessionId:message.sessionId,peerId,capability:"project.write"});
  if(message.type==="manifest") return {status:"manifest-received",manifest:message.payload};
  if(message.type==="attachment-chunk"){this.attachmentAssembler?.add(message.payload);return {status:"chunk-received",index:message.payload.index};}
  if(message.type==="revoked") throw new Error("peer revoked");
  if(!this.capabilityChecker(peerId,capabilities)) throw new Error("capability denied");
  return {status:"accepted",type:message.type};
 }
}
