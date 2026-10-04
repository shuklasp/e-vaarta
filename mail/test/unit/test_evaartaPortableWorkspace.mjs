import assert from "node:assert/strict";
import {
  deserializeWorkspace,
  serializeWorkspace,
} from "../../modules/EvaartaDocumentWorkspace.sys.mjs";
import {
  getEvidenceForDocument,
  getEvidenceGroupsForDocument,
  getEvidenceSummary,
} from "../../modules/EvaartaEvidenceNavigator.sys.mjs";

const portableV2 = {
  modelVersion: 2,
  id: "workspace-demo",
  name: "Evidence Workspace",
  description: "Portable e-Vaarta evidence-group fixture.",
  documents: [
    {
      id: "doc-1",
      title: "Research Paper",
      kind: "pdf",
      sourceRef: "vault/research.pdf",
      mimeType: "application/pdf",
    },
  ],
  items: [
    {
      id: "excerpt-1",
      kind: "excerpt",
      title: "Finding",
      text: "The observed result supports the hypothesis.",
      anchor: {
        documentId: "doc-1",
        page: 2,
        startOffset: 120,
        endOffset: 168,
        quote: "The observed result supports the hypothesis.",
      },
    },
    {
      id: "annotation-1",
      kind: "annotation",
      title: "Important",
      text: "Primary supporting evidence.",
      anchor: {
        documentId: "doc-1",
        page: 2,
        startOffset: 220,
        endOffset: 246,
        quote: "Primary supporting evidence.",
      },
      annotationType: "highlight",
      color: "#F4C542",
    },
  ],
  evidenceGroups: [
    {
      id: "evidence-group-1",
      name: "Supporting Evidence",
      description: "Evidence selected for the conclusion.",
      documentId: "doc-1",
      itemIds: ["excerpt-1", "annotation-1"],
    },
  ],
  links: [],
};


const legacy = deserializeWorkspace({
  modelVersion: 1,
  id: "legacy-workspace",
  name: "Legacy",
  description: "",
  documents: [],
  items: [],
  links: [],
});

assert.equal(legacy.modelVersion, 5);
assert.deepEqual(legacy.evidenceGroups, []);
assert.deepEqual(legacy.collections, []);

const migrated = deserializeWorkspace(portableV2);

assert.equal(migrated.modelVersion, 5);
assert.equal(migrated.evidenceGroups.length, 1);
assert.deepEqual(migrated.evidenceGroups[0].itemIds, [
  "excerpt-1",
  "annotation-1",
]);
assert.equal(migrated.evidenceGroups[0].documentId, "doc-1");
assert.ok(migrated.evidenceGroups[0].createdAt);
assert.ok(migrated.evidenceGroups[0].updatedAt);
assert.equal(migrated.items[0].anchor.selector, null);
assert.equal(migrated.items[0].anchor.rects, null);

assert.deepEqual(
  getEvidenceForDocument(migrated, "doc-1").map(item => item.id),
  ["excerpt-1", "annotation-1"],
);
assert.deepEqual(
  getEvidenceGroupsForDocument(migrated, "doc-1").map(group => [
    group.id,
    group.evidenceCount,
  ]),
  [["evidence-group-1", 2]],
);
assert.deepEqual(getEvidenceSummary(migrated, "doc-1"), {
  documentId: "doc-1",
  evidenceCount: 2,
  excerptCount: 1,
  annotationCount: 1,
  groupCount: 1,
  pages: [2],
});

const roundTrip = deserializeWorkspace(serializeWorkspace(migrated));
assert.deepEqual(
  roundTrip.evidenceGroups.map(group => ({
    id: group.id,
    documentId: group.documentId,
    itemIds: group.itemIds,
  })),
  [{
    id: "evidence-group-1",
    documentId: "doc-1",
    itemIds: ["excerpt-1", "annotation-1"],
  }],
);

console.log("e-Vaarta portable workspace validation tests passed");
