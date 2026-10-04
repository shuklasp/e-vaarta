/* SPDX-License-Identifier: MPL-2.0 */
import {
  SemanticNodeType,
  SemanticEdgeType,
  createSemanticNode,
  createSemanticEdge,
  createSemanticGraph,
  validateSemanticGraph,
  linkedNodes,
  nodesOfType,
} from "resource:///modules/EvaartaEvidenceActionGraph.sys.mjs";

add_task(function testCanonicalEvidenceActionGraph() {
  const evidence = createSemanticNode({
    id: "e1", type: SemanticNodeType.EVIDENCE, title: "Observed result",
    sourceIds: ["doc-1"], revisionId: "r1",
  });
  const claim = createSemanticNode({
    id: "c1", type: SemanticNodeType.CLAIM, title: "Claim",
    sourceIds: ["e1"],
  });
  const decision = createSemanticNode({
    id: "d1", type: SemanticNodeType.DECISION, title: "Decision",
    sourceIds: ["c1"],
  });
  const task = createSemanticNode({
    id: "t1", type: SemanticNodeType.TASK, title: "Follow-up",
    sourceIds: ["d1"],
  });
  const graph = createSemanticGraph({
    nodes: [evidence, claim, decision, task],
    edges: [
      createSemanticEdge({ from: "e1", to: "c1", type: SemanticEdgeType.SUPPORTS, evidenceIds: ["e1"] }),
      createSemanticEdge({ from: "c1", to: "d1", type: SemanticEdgeType.RESULTS_IN }),
      createSemanticEdge({ from: "d1", to: "t1", type: SemanticEdgeType.RESULTS_IN }),
    ],
  });
  Assert.ok(validateSemanticGraph(graph));
  Assert.equal(nodesOfType(graph, SemanticNodeType.EVIDENCE).length, 1);
  Assert.equal(linkedNodes(graph, "c1").length, 2);
});

add_task(function testGraphRejectsBrokenReferences() {
  Assert.throws(() =>
    createSemanticGraph({
      nodes: [createSemanticNode({ id: "e", type: SemanticNodeType.EVIDENCE })],
      edges: [createSemanticEdge({ from: "e", to: "missing", type: SemanticEdgeType.SUPPORTS })],
    })
  );
});
