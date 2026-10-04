import assert from "node:assert/strict";
import { searchWorkspace } from "../../modules/EvaartaWorkspaceSearch.sys.mjs";
import { EvaartaUndoManager } from "../../modules/EvaartaUndoManager.sys.mjs";
import { createMutation, inverseMutation } from "../../modules/EvaartaMutationJournal.sys.mjs";
import { createSyncManifest, compareSyncManifests } from "../../modules/EvaartaSyncManifest.sys.mjs";
import { ConflictResolution, resolveConflict } from "../../modules/EvaartaConflictResolver.sys.mjs";

const workspace = {
  modelVersion: 5, id: "workspace-1", name: "Offline", description: "research",
  documents: [{id:"doc-1", title:"Solar Plant", description:"energy", tags:["science"]}],
  evidenceGroups: [], items: [{id:"note-1", kind:"note", title:"Solar", text:"photovoltaic energy"}], links:[]
};

const results = searchWorkspace(workspace, "photovoltaic");
assert.equal(results[0].id, "note-1");

const mutation = createMutation({id:"m1", operation:"update", targetId:"note-1", before:{text:"old"}, after:{text:"new"}});
assert.deepEqual(inverseMutation(mutation).before, mutation.after);

const undo = new EvaartaUndoManager(2);
undo.record(mutation);
assert.equal(undo.undo().id, "m1");
assert.equal(undo.redo().id, "m1");

const record = {persistenceVersion:1, workspaceId:"workspace-1", revision:3, writerId:"desktop", writtenAt:"2026-10-04T12:00:00Z", checksum:"abc", workspace};
const local = createSyncManifest(record, "desktop");
assert.equal(compareSyncManifests(local, local), "equal");
assert.equal(compareSyncManifests(local, {...local, revision:4, checksum:"def"}), "remote-newer");
assert.equal(compareSyncManifests(local, {...local, checksum:"def"}), "conflict");

const remote = {...record, writerId:"phone", checksum:"def", workspace:{...workspace, description:"remote"}};
const merged = resolveConflict(record, remote, ConflictResolution.KEEP_BOTH);
assert.match(merged.workspace.description, /remote conflict/);

console.log("e-Vaarta phases 73-82 tests passed");
