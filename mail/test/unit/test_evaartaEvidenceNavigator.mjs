import assert from "node:assert/strict";
import {
  getEvidenceForDocument,
  getEvidenceGroupsForDocument,
  getEvidenceSummary,
} from "../../modules/EvaartaEvidenceNavigator.sys.mjs";

const workspace = {
  documents: [{ id: "doc-1", title: "Source" }],
  items: [
    { id: "annotation-2", kind: "annotation", anchor: { documentId: "doc-1", page: 2, startOffset: 10 }, createdAt: "2026-01-02T00:00:00Z" },
    { id: "excerpt-1", kind: "excerpt", anchor: { documentId: "doc-1", page: 1, startOffset: 50 }, createdAt: "2026-01-01T00:00:00Z" },
    { id: "note-1", kind: "note", text: "not anchored" },
    { id: "excerpt-other", kind: "excerpt", anchor: { documentId: "doc-2", page: 1, startOffset: 1 } },
  ],
  evidenceGroups: [
    { id: "group-a", name: "Primary", itemIds: ["excerpt-1", "annotation-2"] },
    { id: "group-b", name: "Other", itemIds: ["excerpt-other"] },
  ],
};

assert.deepEqual(
  getEvidenceForDocument(workspace, "doc-1").map(item => item.id),
  ["excerpt-1", "annotation-2"],
);

assert.deepEqual(
  getEvidenceForDocument(workspace, "doc-1", { kind: "annotation" }).map(item => item.id),
  ["annotation-2"],
);

assert.deepEqual(
  getEvidenceForDocument(workspace, "doc-1", { page: 2 }).map(item => item.id),
  ["annotation-2"],
);

assert.deepEqual(
  getEvidenceForDocument(workspace, "doc-1", { groupId: "group-a" }).map(item => item.id),
  ["excerpt-1", "annotation-2"],
);

assert.deepEqual(
  getEvidenceGroupsForDocument(workspace, "doc-1").map(group => [group.id, group.evidenceCount]),
  [["group-a", 2]],
);

assert.deepEqual(getEvidenceSummary(workspace, "doc-1"), {
  documentId: "doc-1",
  evidenceCount: 2,
  excerptCount: 1,
  annotationCount: 1,
  groupCount: 1,
  pages: [1, 2],
});

console.log("e-Vaarta evidence navigator tests passed");
