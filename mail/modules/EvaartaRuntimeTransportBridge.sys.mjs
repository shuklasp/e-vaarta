/* MPL-2.0 */
export class EvaartaRuntimeTransportBridge { constructor(registry,queue){this.registry=registry;this.queue=queue;} async send(envelope,transport,context={}){try{return await this.registry.send(transport,envelope,context);}catch(error){this.queue.enqueue(envelope,error.message);return {status:"queued",transport,reason:error.message};}} }
