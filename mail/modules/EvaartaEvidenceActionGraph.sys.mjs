/* MPL-2.0 */

/**
 * Canonical evidence-to-action semantic graph.
 *
 * This is the shared lifecycle contract:
 * communication -> document -> evidence -> claim -> finding -> decision ->
 * task -> project -> report -> citation -> communication.
 *
 * UI and storage implementations may differ, but object identity, provenance,
 * edge semantics and lifecycle validation must remain stable.
 */

export const SemanticNodeType = Object.freeze({
  COMMUNICATION: "communication",
  DOCUMENT: "document",
  EVIDENCE: "evidence",
  CLAIM: "claim",
  FINDING: "finding",
  DECISION: "decision",
  TASK: "task",
  PROJECT: "project",
  REPORT: "report",
  CITATION: "citation",
});

export const SemanticEdgeType = Object.freeze({
  DERIVED_FROM: "derived-from",
  SUPPORTS: "supports",
  CONTRADICTS: "contradicts",
  REFERENCES: "references",
  RESULTS_IN: "results-in",
  ASSIGNED_TO: "assigned-to",
  REPORTS: "reports",
  COMMUNICATES: "communicates",
});

const TYPES = new Set(Object.values(SemanticNodeType));
const EDGES = new Set(Object.values(SemanticEdgeType));

export function createSemanticNode({
  id,
  type,
  title = "",
  sourceIds = [],
  revisionId = null,
  properties = {},
}) {
  if (!id || typeof id !== "string") throw new TypeError("node id is required");
  if (!TYPES.has(type)) throw new RangeError("unsupported semantic node type");
  return Object.freeze({
    id,
    type,
    title,
    sourceIds: [...sourceIds],
    revisionId,
    properties: { ...properties },
  });
}

export function createSemanticEdge({ from, to, type, evidenceIds = [] }) {
  if (!from || !to) throw new TypeError("edge endpoints are required");
  if (!EDGES.has(type)) throw new RangeError("unsupported semantic edge type");
  if (from === to) throw new RangeError("self-referential semantic edge");
  return Object.freeze({ from, to, type, evidenceIds: [...evidenceIds] });
}

export function createSemanticGraph({ nodes = [], edges = [] } = {}) {
  const nodeIds = new Set();
  for (const node of nodes) {
    if (!node?.id || nodeIds.has(node.id)) throw new RangeError("duplicate or invalid node");
    if (!TYPES.has(node.type)) throw new RangeError("unsupported semantic node type");
    nodeIds.add(node.id);
  }
  for (const edge of edges) {
    if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) {
      throw new RangeError("semantic edge references an unknown node");
    }
    if (!EDGES.has(edge.type)) throw new RangeError("unsupported semantic edge type");
  }
  return Object.freeze({
    nodes: nodes.map(node => ({ ...node, sourceIds: [...node.sourceIds], properties: { ...node.properties } })),
    edges: edges.map(edge => ({ ...edge, evidenceIds: [...edge.evidenceIds] })),
  });
}

export function validateSemanticGraph(graph) {
  try {
    createSemanticGraph(graph);
    return true;
  } catch {
    return false;
  }
}

export function nodesOfType(graph, type) {
  if (!TYPES.has(type)) throw new RangeError("unsupported semantic node type");
  return graph.nodes.filter(node => node.type === type);
}

export function linkedNodes(graph, nodeId, edgeType = null) {
  if (edgeType !== null && !EDGES.has(edgeType)) {
    throw new RangeError("unsupported semantic edge type");
  }
  const ids = new Set();
  for (const edge of graph.edges) {
    if (edgeType !== null && edge.type !== edgeType) continue;
    if (edge.from === nodeId) ids.add(edge.to);
    if (edge.to === nodeId) ids.add(edge.from);
  }
  return graph.nodes.filter(node => ids.has(node.id));
}
