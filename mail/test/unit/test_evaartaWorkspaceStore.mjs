import assert from "node:assert/strict";
import { EvaartaWorkspaceStore } from "../../modules/EvaartaWorkspaceStore.sys.mjs";

const files = new Map();
const paths = {
  join: (...parts) => parts.join("/"),
};
const missing = () => Object.assign(new Error("missing"), { becauseNoSuchFile: true });

const io = {
  async makeDirectory() {},
  async readUTF8(path) {
    if (!files.has(path)) throw missing();
    return files.get(path);
  },
  async writeAtomic(path, data, options = {}) {
    if (options.backupTo && files.has(path)) {
      files.set(options.backupTo, files.get(path));
    }
    files.set(path, data);
    files.delete(options.tmpPath);
  },
  async remove(path) {
    if (!files.delete(path)) throw missing();
  },
};

const store = new EvaartaWorkspaceStore("/profile/evaarta/workspaces", { io, paths });
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

const first = await store.save(workspace, {
  writerId: "desktop",
  writtenAt: "2026-10-04T12:00:00Z",
});
assert.equal(first.status, "create");
assert.equal((await store.load(workspace.id)).record.revision, 1);

const second = await store.save({...workspace, description: "Updated"}, {
  writerId: "desktop",
  writtenAt: "2026-10-04T12:01:00Z",
});
assert.equal(second.status, "replace");
assert.equal(second.record.revision, 2);

const pathsForWorkspace = store.pathsFor(workspace.id);
files.set(pathsForWorkspace.primary, "{corrupt}");
const recovered = await store.load(workspace.id);
assert.equal(recovered.source, "backup");
assert.equal(recovered.recovered, true);
assert.equal(recovered.record.revision, 1);
assert.equal(recovered.record.workspace.description, "");

const repaired = await store.recover(workspace.id);
assert.equal(repaired.source, "primary");
assert.equal(repaired.record.revision, 1);

files.set(pathsForWorkspace.primary, "{corrupt}");
files.set(pathsForWorkspace.backup, "{also-corrupt}");
await assert.rejects(
  () => store.load(workspace.id),
  /No valid e-Vaarta workspace snapshot is available/
);

console.log("e-Vaarta crash-safe workspace store tests passed");
