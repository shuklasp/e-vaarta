/* MPL-2.0 */
import {createRuntimeMessage} from "./EvaartaRuntimeProtocol.sys.mjs";
export class EvaartaRuntimeIntegration {
 constructor({orchestrator,syncEngine,transportSelector,retryEngine,revocationEngine}){Object.assign(this,{orchestrator,syncEngine,transportSelector,retryEngine,revocationEngine});}
 async syncProject({projectId,peer,sessionId,transport,capabilities=[]}){
  this.revocationEngine.assertUsable(peer.actorId);
  const selected=transport??this.transportSelector.select({peer,requiredCapabilities:capabilities});
  const manifest=await this.syncEngine.createManifestMessage(projectId,sessionId);
  return this.orchestrator.dispatch({eventId:manifest.messageId,type:manifest.type,...manifest},peer,selected,capabilities);
 }
 async retry(options){return this.retryEngine.drain(options);}
}
