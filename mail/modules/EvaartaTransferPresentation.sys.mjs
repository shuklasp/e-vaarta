/* MPL-2.0 */
export function presentTransferStatus({valid=false,revision=null,workspaceId=null,reason=null}={}){return{valid,revision,workspaceId,reason,status:valid?"ready":"blocked"}}