/* MPL-2.0 */
const MAX_SERIALIZED_WORKSPACE=50*1024*1024;
export function validateWorkspaceTransfer(serialized,{maxBytes=MAX_SERIALIZED_WORKSPACE}={}) {
  if(typeof serialized!=="string")return{valid:false,reason:"not-text"};
  if(serialized.length>maxBytes)return{valid:false,reason:"too-large"};
  try{const value=JSON.parse(serialized);if(!value||typeof value!=="object")return{valid:false,reason:"not-object"};if(!value.persistenceVersion||!value.workspaceId||!value.workspace)return{valid:false,reason:"missing-envelope"};return{valid:true,workspaceId:value.workspaceId,revision:value.revision||1};}catch{return{valid:false,reason:"invalid-json"}}
}
