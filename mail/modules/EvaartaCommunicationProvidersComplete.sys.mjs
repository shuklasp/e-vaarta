/* MPL-2.0 */
export const PROVIDER_FAMILY=Object.freeze({EMAIL:"email",CHAT:"chat",MEETING:"meeting",CALENDAR:"calendar",SMS:"sms",SOCIAL:"social"});
export const PROVIDER=Object.freeze({IMAP:"imap",SMTP:"smtp",JMAP:"jmap",GOOGLE:"google",MICROSOFT:"microsoft",MATRIX:"matrix",SLACK:"slack",TEAMS:"teams",WHATSAPP:"whatsapp",TELEGRAM:"telegram",ZOOM:"zoom",WEBEX:"webex",RINGCENTRAL:"ringcentral",MATTERMOST:"mattermost",SIGNAL:"signal",RCS:"rcs"});
export const OPERATION=Object.freeze({LIST:"list",FETCH:"fetch",SEND:"send",EDIT:"edit",DELETE:"delete",REACT:"react",SEARCH:"search",SYNC:"sync",CALL:"call",MEET:"meet",FREEBUSY:"freebusy"});
const CATALOG=Object.freeze(Object.values(PROVIDER).map(id=>({id,operations:Object.values(OPERATION),families:[PROVIDER.MATRIX,PROVIDER.MATTERMOST].includes(id)?[PROVIDER_FAMILY.CHAT]:[PROVIDER_FAMILY.CHAT]})));
export function providerCapabilities(provider){return CATALOG.find(x=>x.id===provider)||null;}
export function createProviderCredentialRef({provider,accountId,secretRef,scopes=[]}={}){return Object.freeze({provider,accountId,secretRef,scopes:[...scopes],secretMaterialExcluded:true});}
export function createTransportRequest({provider,operation,accountId,payload=null,cursor=null,idempotencyKey=null}={}){if(!providerCapabilities(provider))throw new RangeError("unsupported provider");return Object.freeze({provider,operation,accountId,payload,cursor,idempotencyKey});}
export function normalizeProviderIdentity({provider,externalId,address,displayName=null}={}){return Object.freeze({provider,externalId,address:address?.trim().toLowerCase(),displayName});}
export function providerCoverage(){return CATALOG.map(x=>({provider:x.id,operations:[...x.operations]}));}
