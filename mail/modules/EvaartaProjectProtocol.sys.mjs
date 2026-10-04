/* MPL-2.0 */
import { validateEnvelope } from "./EvaartaSecureEnvelope.sys.mjs";
import { mergeEvents } from "./EvaartaMergeEngine.sys.mjs";
export async function receiveEnvelope({envelope,journal,crypto,identity}){const check=validateEnvelope(envelope);if(!check.valid)throw new Error(check.reason);if(journal.has(envelope.messageId))return {status:"duplicate"};if(!(await crypto.verify(JSON.stringify({...envelope,signature:null}),envelope.signature,envelope.source)))throw new Error("signature verification failed");const event=envelope.payload;if(envelope.destination!==identity.actorId)throw new Error("destination mismatch");mergeEvents(journal,[event]);return {status:"accepted",eventId:event.eventId};}
