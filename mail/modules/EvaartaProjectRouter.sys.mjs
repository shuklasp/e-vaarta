/* MPL-2.0 */
import { createEnvelope } from "./EvaartaSecureEnvelope.sys.mjs";
export class EvaartaProjectRouter { constructor({journal,registry,router,queue,crypto}){Object.assign(this,{journal,registry,router,queue,crypto});}
 async publish(event,{source,destination,capabilities=[]}={}){const envelope=createEnvelope({messageId:event.eventId,source,destination,type:event.type,payload:event});const signature=await this.crypto.sign(JSON.stringify(envelope),source);const signed={...envelope,signature};const result=await this.router.deliver(signed,{capabilities});if(result.status==="queued")this.queue.enqueue(signed,"no-route");return result;}
}
