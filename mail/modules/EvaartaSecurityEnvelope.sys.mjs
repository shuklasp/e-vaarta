/* MPL-2.0 */
export function createEnvelope({projectId,eventId,deviceId,capability,payload,signature}={}){if(!projectId||!eventId||!deviceId||!capability)throw new TypeError("identity and capability are required");if(!signature)throw new Error("plaintext/unsigned fallback is prohibited");return {schema:"evaarta.envelope.v1",projectId,eventId,deviceId,capability,payload,signature};}
export function validateEnvelope(e){return e?.schema==="evaarta.envelope.v1"&&Boolean(e.projectId&&e.eventId&&e.deviceId&&e.capability&&e.signature);}
