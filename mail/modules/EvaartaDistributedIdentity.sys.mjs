/* MPL-2.0 */
export const EVAARTA_IDENTITY_VERSION=1;
export function validateIdentity(identity){if(!identity||identity.version!==1||typeof identity.actorId!=="string"||typeof identity.publicKey!=="string")return {valid:false,reason:"invalid-identity"};return {valid:true};}
export function identityFingerprint(publicKey){let h=2166136261;for(const c of String(publicKey)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)>>>0;}return h.toString(16).padStart(8,"0");}
export function createIdentityDescriptor({actorId,publicKey,devices=[]}){const x={version:EVAARTA_IDENTITY_VERSION,actorId,publicKey,devices:[...devices]};if(!validateIdentity(x).valid)throw new TypeError("invalid identity");return {...x,fingerprint:identityFingerprint(publicKey)};}
