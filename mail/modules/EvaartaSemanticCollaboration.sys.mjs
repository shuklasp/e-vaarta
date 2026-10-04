/* MPL-2.0 */
/** Offline-first semantic event and conflict-review contract. */
export const CollaborationEventType = Object.freeze({
  CREATE: "create", UPDATE: "update", DELETE: "delete", LINK: "link", UNLINK: "unlink",
});
export function createSemanticEvent({ id, actorId, lamport, objectId, type, payload = {}, baseRevision = null }) {
  if (!id || !actorId || !objectId || !Number.isInteger(lamport) || !Object.values(CollaborationEventType).includes(type)) {
    throw new TypeError("invalid semantic event");
  }
  return Object.freeze({ id, actorId, lamport, objectId, type, payload: structuredClone(payload), baseRevision });
}
export function compareEvents(a, b) {
  return a.lamport - b.lamport || String(a.actorId).localeCompare(String(b.actorId)) || String(a.id).localeCompare(String(b.id));
}
export function createConflict({ objectId, baseRevision, local, remote, reason = "concurrent-update" }) {
  return Object.freeze({ objectId, baseRevision, local: structuredClone(local), remote: structuredClone(remote), reason, resolution: null });
}
export function resolveConflict(conflict, resolution, resolvedBy) {
  if (!["local", "remote", "merged"].includes(resolution) || !resolvedBy) throw new TypeError("invalid conflict resolution");
  return Object.freeze({ ...conflict, resolution, resolvedBy });
}
