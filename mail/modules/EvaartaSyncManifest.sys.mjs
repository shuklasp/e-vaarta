export const EVAARTA_SYNC_MANIFEST_VERSION = 1;

export function createSyncManifest(record, deviceId = "local") {
  return { manifestVersion: EVAARTA_SYNC_MANIFEST_VERSION, workspaceId: record.workspaceId,
    revision: record.revision, checksum: record.checksum, writerId: record.writerId,
    deviceId, updatedAt: record.writtenAt };
}
export function compareSyncManifests(local, remote) {
  if (local.workspaceId !== remote.workspaceId) throw new Error("Workspace identity mismatch.");
  if (local.checksum === remote.checksum) return "equal";
  if (local.revision > remote.revision) return "local-newer";
  if (local.revision < remote.revision) return "remote-newer";
  return "conflict";
}
