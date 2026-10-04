import assert from "node:assert/strict";
import {
  classifyWorkspaceWrite,
  createWorkspaceRecord,
  deserializeWorkspaceRecord,
  nextWorkspaceRecord,
  serializeWorkspaceRecord,
  WorkspaceWriteStatus,
} from "../../modules/EvaartaWorkspacePersistence.sys.mjs";

const workspace = {
  modelVersion: 5,
  id: "workspace-1",
  name: "Offline",
  description: "",
  documents: [],
  collections: [],
  evidenceGroups: [],
  items: [],
  links: [],
};

const first = createWorkspaceRecord(workspace, {
  writerId: "desktop",
  writtenAt: "2026-10-04T12:00:00Z",
});
assert.equal(first.revision, 1);
assert.equal(first.persistenceVersion, 1);
assert.equal(classifyWorkspaceWrite(null, first), WorkspaceWriteStatus.CREATE);

const secondWorkspace = {...workspace, description: "Updated locally"};
const second = nextWorkspaceRecord(first, secondWorkspace, {
  writerId: "desktop",
  writtenAt: "2026-10-04T12:01:00Z",
});
assert.equal(second.revision, 2);
assert.equal(classifyWorkspaceWrite(first, second), WorkspaceWriteStatus.REPLACE);

const encoded = serializeWorkspaceRecord(second);
const decoded = deserializeWorkspaceRecord(encoded);
assert.deepEqual(decoded.workspace, secondWorkspace);
assert.equal(decoded.checksum, second.checksum);

assert.equal(
  classifyWorkspaceWrite(second, first),
  WorkspaceWriteStatus.CONFLICT,
);

const forged = {...second, checksum: "bad"};
assert.throws(
  () => deserializeWorkspaceRecord(forged),
  /checksum mismatch/,
);

const gap = nextWorkspaceRecord(second, {...workspace, description: "gap"}, {
  revision: undefined,
});
gap.revision = 4;
assert.throws(
  () => classifyWorkspaceWrite(second, gap),
  /revision has a gap/,
);

console.log("e-Vaarta workspace persistence tests passed");
