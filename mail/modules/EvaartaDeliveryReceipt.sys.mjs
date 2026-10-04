/* MPL-2.0 */
export function createDeliveryReceipt({messageId,recipient,status,transport,reason=null}){return {version:1,messageId,recipient,status,transport,reason,receivedAt:new Date().toISOString()};}
export function validateDeliveryReceipt(r){return !!r&&r.version===1&&!!r.messageId&&!!r.recipient&&["accepted","rejected","queued"].includes(r.status);}
