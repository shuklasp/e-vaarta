/* MPL-2.0 */
import {createRuntimeMessage} from "./EvaartaRuntimeProtocol.sys.mjs";
export class EvaartaRuntimeSyncEngine {
 constructor({journal,crypto,replayGuard,capabilityChecker=()=>true}){Object.assign(this,{journal,crypto,replayGuard,capabilityChecker});}
 buildManifest(projectId){return {projectId,...this.journal.manifest?.(projectId)};}
 async createManifestMessage(projectId,sessionId){
  return createRuntimeMessage("manifest",this.buildManifest(projectId),{sessionId});
 }
 async acceptEvents(events,{sessionId,peerId,capability="project.write"}={}){
  if(!this.capabilityChecker(peerId,capability)) throw new Error("capability denied");
  const accepted=[];
  for(const event of events){
   if(this.replayGuard?.seen(event.eventId)) continue;
   if(!event.signature) throw new Error("unsigned event rejected");
   accepted.push(event);
   this.journal.append(event);
   this.replayGuard?.record(event.eventId);
  }
  return createRuntimeMessage("event-ack",{accepted:accepted.map(e=>e.eventId)},{sessionId});
 }
}
