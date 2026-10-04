/* MPL-2.0 */
export const SourceOpenPolicy=Object.freeze({OFFLINE:"offline",PREFER_OFFLINE:"prefer-offline",EXTERNAL:"external"});
export function resolveSourceOpen(document,{offlineAvailable=false,policy=SourceOpenPolicy.PREFER_OFFLINE}={}) {
  if(policy===SourceOpenPolicy.EXTERNAL)return {mode:"external",sourceRef:document?.sourceRef||null};
  if(offlineAvailable&&document?.vault?.relativePath)return {mode:"offline",relativePath:document.vault.relativePath};
  if(document?.sourceRef)return {mode:"external",sourceRef:document.sourceRef};
  return {mode:"unavailable"};
}