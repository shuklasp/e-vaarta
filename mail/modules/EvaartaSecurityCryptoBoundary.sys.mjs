/* MPL-2.0 */
export const KEY_STATE=Object.freeze({GENERATED:"generated",ACTIVE:"active",REVOKED:"revoked",RECOVERED:"recovered"});
export function createDeviceKeyRef({deviceId,keyId,algorithm="ed25519",state=KEY_STATE.GENERATED}={}){return Object.freeze({deviceId,keyId,algorithm,state,privateMaterialExcluded:true});}
export function createAccountKeySet({accountId,deviceKeys=[],recoveryRequired=true}={}){return Object.freeze({accountId,deviceKeys:[...deviceKeys],recoveryRequired});}
export function rotateKeySet(keySet,newKey){return Object.freeze({...keySet,deviceKeys:[...keySet.deviceKeys.map(k=>k.state===KEY_STATE.ACTIVE?{...k,state:KEY_STATE.REVOKED}:k),{...newKey,state:KEY_STATE.ACTIVE}]});}
export function revokeDevice(keySet,deviceId){return Object.freeze({...keySet,deviceKeys:keySet.deviceKeys.map(k=>k.deviceId===deviceId?{...k,state:KEY_STATE.REVOKED}:k)});}
export function cryptoBoundaryContract(){return Object.freeze({privateMaterialExcluded:true,rotation:true,revocation:true,recovery:true,transportPayloadEncryption:true});}
