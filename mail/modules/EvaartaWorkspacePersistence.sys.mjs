/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Offline persistence contract for e-Vaarta workspaces.
 *
 * The persistence record is deliberately separate from the semantic workspace.
 * It gives every client a stable envelope for atomic local writes, recovery,
 * and later synchronization without putting storage-engine concerns into the
 * document model.
 */

export const EVAARTA_WORKSPACE_PERSISTENCE_VERSION = 1;

export const WorkspaceWriteStatus = Object.freeze({
  CREATE: "create",
  REPLACE: "replace",
  CONFLICT: "conflict",
});

function now() {
  return new Date().toISOString();
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function stableJson(value) {
  return JSON.stringify(value);
}

function hashString(value) {
  // Deterministic lightweight fingerprint. This is an identity aid, not a
  // cryptographic integrity guarantee; storage implementations may add SHA-256.
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function createWorkspaceRecord(workspace, {
  revision = 1,
  writerId = "local",
  writtenAt = now(),
} = {}) {
  if (!workspace?.id) throw new TypeError("A workspace with an id is required.");
  if (!Number.isInteger(revision) || revision < 1) {
    throw new TypeError("revision must be a positive integer.");
  }

  const payload = clone(workspace);
  const serialized = stableJson(payload);

  return {
    persistenceVersion: EVAARTA_WORKSPACE_PERSISTENCE_VERSION,
    workspaceId: workspace.id,
    revision,
    writerId: String(writerId || "local"),
    writtenAt,
    checksum: hashString(serialized),
    workspace: payload,
  };
}

export function serializeWorkspaceRecord(record) {
  validateWorkspaceRecord(record);
  return JSON.stringify(record, null, 2);
}

export function deserializeWorkspaceRecord(serialized) {
  const record = typeof serialized === "string" ? JSON.parse(serialized) : clone(serialized);
  validateWorkspaceRecord(record);
  return record;
}

export function validateWorkspaceRecord(record) {
  if (!record || record.persistenceVersion !== EVAARTA_WORKSPACE_PERSISTENCE_VERSION) {
    throw new Error("Unsupported e-Vaarta workspace persistence version.");
  }
  if (!record.workspaceId || !record.workspace?.id || record.workspace.id !== record.workspaceId) {
    throw new Error("Workspace persistence identity is invalid.");
  }
  if (!Number.isInteger(record.revision) || record.revision < 1) {
    throw new Error("Workspace persistence revision is invalid.");
  }
  const expected = hashString(stableJson(record.workspace));
  if (record.checksum !== expected) {
    throw new Error("Workspace persistence checksum mismatch.");
  }
  return true;
}

export function classifyWorkspaceWrite(currentRecord, nextRecord) {
  if (!currentRecord) return WorkspaceWriteStatus.CREATE;
  validateWorkspaceRecord(currentRecord);
  validateWorkspaceRecord(nextRecord);

  if (currentRecord.workspaceId !== nextRecord.workspaceId) {
    throw new Error("Workspace identity mismatch.");
  }

  if (nextRecord.revision === currentRecord.revision + 1) {
    return WorkspaceWriteStatus.REPLACE;
  }

  if (nextRecord.revision <= currentRecord.revision) {
    return WorkspaceWriteStatus.CONFLICT;
  }

  throw new Error("Workspace revision has a gap.");
}

export function nextWorkspaceRecord(currentRecord, workspace, options = {}) {
  const revision = currentRecord ? currentRecord.revision + 1 : 1;
  return createWorkspaceRecord(workspace, {...options, revision});
}
