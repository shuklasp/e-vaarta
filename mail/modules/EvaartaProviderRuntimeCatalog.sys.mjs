/* MPL-2.0 */
export const RUNTIME_PROVIDER_STATUS=Object.freeze({MODEL_ONLY:"model-only",ADAPTER_READY:"adapter-ready",LIVE_UNVALIDATED:"live-unvalidated",LIVE_VALIDATED:"live-validated"});
const providers=["imap","smtp","jmap","google","microsoft","matrix","slack","teams","whatsapp","telegram","zoom","webex","ringcentral","mattermost","signal","rcs"];
export function providerRuntimeCatalog(){return providers.map(provider=>({provider,status:RUNTIME_PROVIDER_STATUS.ADAPTER_READY,requiresCredentials:true,liveValidated:false}));}
export function providerRuntimeStatus(provider){return providerRuntimeCatalog().find(x=>x.provider===provider)||null;}
