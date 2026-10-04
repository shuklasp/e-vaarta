/* MPL-2.0 */
export const IDENTITY_MATCH=Object.freeze({EXACT:"exact",STRONG:"strong",POSSIBLE:"possible",CONFLICT:"conflict"});
export function identityKey({type,value}={}){return type+"|"+String(value||"").trim().toLowerCase();}
export function createIdentity({id,personId,type,value,verified=false,source=null}={}){if(!id||!personId||!type||!value)throw new TypeError("identity requires id, personId, type and value");return Object.freeze({id,personId,type,value,verified,source,key:identityKey({type,value})});}
export function matchIdentities(a,b){if(!a||!b)return IDENTITY_MATCH.CONFLICT;if(a.key===b.key)return IDENTITY_MATCH.EXACT;if(a.type===b.type&&a.value?.toLowerCase()===b.value?.toLowerCase())return IDENTITY_MATCH.STRONG;return IDENTITY_MATCH.POSSIBLE;}
export function mergePeople({canonical,duplicates=[]}={}){return Object.freeze({canonicalId:canonical,mergedIds:[canonical,...duplicates.filter(x=>x!==canonical)],requiresAudit:true});}
export function splitIdentity({personId,identityId,reason}={}){return Object.freeze({personId,identityId,reason,requiresAudit:true});}
