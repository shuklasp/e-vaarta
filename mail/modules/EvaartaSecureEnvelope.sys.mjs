/* MPL-2.0 */
export const EVAARTA_PROTOCOL_VERSION=1;
export function createEnvelope({messageId,source,destination,type,payload,ciphertext=null,signature=null,createdAt=new Date().toISOString(),expiresAt=null,hopLimit=8}={}){if(!messageId||!source||!destination||!type)throw new TypeError("message metadata required");return {protocol:"e-vaarta",version:EVAARTA_PROTOCOL_VERSION,messageId,source,destination,type,createdAt,expiresAt,hopLimit,payload:ciphertext?null:payload,ciphertext,signature};}
export function validateEnvelope(e){if(!e||e.protocol!=="e-vaarta"||e.version!==1||!e.messageId||!e.source||!e.destination||!e.type)return {valid:false,reason:"invalid-envelope"};if(e.hopLimit<0)return {valid:false,reason:"expired-hops"};return {valid:true};}
export function decrementHop(e){return {...e,hopLimit:Math.max(0,(e.hopLimit??0)-1)};}
