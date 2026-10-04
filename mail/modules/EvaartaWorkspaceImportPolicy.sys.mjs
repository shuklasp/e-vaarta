/* MPL-2.0 */
export function classifyImport({workspaceId,existingWorkspaceId=null,revision=1,existingRevision=null}={}) {
  if(!workspaceId)return {action:"reject",reason:"missing-workspace-id"};
  if(existingWorkspaceId&&workspaceId!==existingWorkspaceId)return {action:"reject",reason:"workspace-identity-mismatch"};
  if(existingRevision==null)return {action:"create"};
  if(revision>existingRevision)return {action:"replace"};
  if(revision===existingRevision)return {action:"compare"};
  return {action:"reject",reason:"stale-revision"};
}