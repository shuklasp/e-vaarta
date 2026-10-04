export const ConflictResolution = Object.freeze({
  KEEP_LOCAL: "keep-local", KEEP_REMOTE: "keep-remote", KEEP_BOTH: "keep-both",
});

export function describeConflict(localRecord, remoteRecord) {
  if (localRecord.workspaceId !== remoteRecord.workspaceId) throw new Error("Workspace identity mismatch.");
  return {
    workspaceId: localRecord.workspaceId, localRevision: localRecord.revision,
    remoteRevision: remoteRecord.revision, localWriter: localRecord.writerId,
    remoteWriter: remoteRecord.writerId, sameRevision: localRecord.revision === remoteRecord.revision,
  };
}

export function resolveConflict(localRecord, remoteRecord, strategy) {
  describeConflict(localRecord, remoteRecord);
  if (strategy === ConflictResolution.KEEP_LOCAL) return { strategy, record: localRecord };
  if (strategy === ConflictResolution.KEEP_REMOTE) return { strategy, record: remoteRecord };
  if (strategy === ConflictResolution.KEEP_BOTH) {
    return {
      strategy, record: null,
      workspaces: [localRecord.workspace, remoteRecord.workspace],
      requiresNewRevision: true,
    };
  }
  throw new TypeError("Unsupported conflict resolution strategy.");
}
