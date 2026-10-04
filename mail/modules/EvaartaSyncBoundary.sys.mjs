/* MPL-2.0 */
export function createSyncBoundary({workspaceId,deviceId,transport=null}={}){return{version:1,workspaceId,deviceId,transport,networkRequired:false,ready:Boolean(workspaceId&&deviceId)}}