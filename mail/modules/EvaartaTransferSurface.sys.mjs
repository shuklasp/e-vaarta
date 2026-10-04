/* MPL-2.0 */
export function createTransferSurface(workspace){ return {workspaceId:workspace?.id||null,formats:["evaarta-workspace-json"],canExport:!!workspace,canImport:true}; }