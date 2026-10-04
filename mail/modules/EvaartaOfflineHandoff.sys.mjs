/* MPL-2.0 */
export function createOfflineHandoff({workspaceId,ready,pendingOperations=0}={}){return{version:1,workspaceId,ready:Boolean(ready),pendingOperations:Number(pendingOperations)||0}}