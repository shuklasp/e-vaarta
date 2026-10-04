/* MPL-2.0 */
export const EVAARTA_RUNTIME_PROTOCOL_VERSION=1;
export const EvaartaRuntimeMessage=Object.freeze({
 HELLO:"hello", HELLO_ACK:"hello-ack", MANIFEST:"manifest", EVENTS:"events",
 EVENT_ACK:"event-ack", ATTACHMENT_REQUEST:"attachment-request",
 ATTACHMENT_CHUNK:"attachment-chunk", RECEIPT:"receipt", REVOKED:"revoked"
});
export function createRuntimeMessage(type,payload,{messageId=crypto.randomUUID(),sessionId}={}) {
 if(!Object.values(EvaartaRuntimeMessage).includes(type)) throw new Error("unsupported runtime message");
 return {protocol:"e-vaarta-runtime",version:EVAARTA_RUNTIME_PROTOCOL_VERSION,messageId,sessionId,type,payload};
}
export function validateRuntimeMessage(message) {
 if(!message||message.protocol!=="e-vaarta-runtime"||message.version!==1) throw new Error("invalid e-Vaarta runtime message");
 if(!Object.values(EvaartaRuntimeMessage).includes(message.type)) throw new Error("unsupported runtime message");
 if(typeof message.messageId!=="string"||!message.messageId) throw new Error("runtime message id required");
 return true;
}
