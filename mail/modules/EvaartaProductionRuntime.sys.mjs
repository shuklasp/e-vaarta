/* MPL-2.0 */
import { SemanticNodeType, SemanticEdgeType, createSemanticNode, createSemanticEdge } from "./EvaartaEvidenceActionGraph.sys.mjs";

export const EvaartaRuntimeCapability = Object.freeze({
  PDF: "pdf",
  PDF_PRODUCTION: "pdf-production",
  RESEARCH: "research",
  SEARCH: "search",
  DOCUMENTS: "documents",
  KNOWLEDGE: "knowledge",
  CITATIONS: "citations",
  AI: "ai",
  PROJECTS: "projects",
  COLLABORATION: "collaboration",
  MOBILE: "mobile",
  ACCESSIBILITY: "accessibility",
  SECURITY: "security",
  INTEROPERABILITY: "interoperability",
  AUTOMATION: "automation",
});

export function createRuntimeAdapter(capability, operations = {}) {
  if (!Object.values(EvaartaRuntimeCapability).includes(capability)) {
    throw new TypeError("Unsupported e-Vaarta runtime capability");
  }
  return Object.freeze({
    capability,
    operations: Object.freeze({ ...operations }),
    supports(operation) {
      return typeof operations[operation] === "function";
    },
  });
}

export function requireRuntimeOperation(adapter, operation) {
  if (!adapter?.supports?.(operation)) {
    throw new Error(`Runtime operation not bound: ${adapter?.capability || "unknown"}/${operation}`);
  }
  return adapter.operations[operation];
}

export function createEvidenceLifecycle() {
  return {
    nodes: [],
    edges: [],
    addNode(type, id, sourceIds = [], properties = {}) {
      const node = createSemanticNode(type, id, sourceIds, properties);
      this.nodes.push(node);
      return node;
    },
    link(from, to, type, evidenceIds = []) {
      const edge = createSemanticEdge(from, to, type, evidenceIds);
      this.edges.push(edge);
      return edge;
    },
    snapshot() {
      return Object.freeze({
        nodes: this.nodes.map(node => ({ ...node })),
        edges: this.edges.map(edge => ({ ...edge })),
      });
    },
  };
}

export function buildEvidenceActionTrace(ids) {
  const required = [
    ["communication", SemanticNodeType.COMMUNICATION],
    ["document", SemanticNodeType.DOCUMENT],
    ["evidence", SemanticNodeType.EVIDENCE],
    ["claim", SemanticNodeType.CLAIM],
    ["finding", SemanticNodeType.FINDING],
    ["decision", SemanticNodeType.DECISION],
    ["task", SemanticNodeType.TASK],
    ["project", SemanticNodeType.PROJECT],
    ["report", SemanticNodeType.REPORT],
    ["citation", SemanticNodeType.CITATION],
  ];
  const trace = [];
  let previous = null;
  for (const [name, type] of required) {
    const id = ids?.[name];
    if (!id) continue;
    trace.push({ stage: name, id, sourceIds: previous ? [previous] : [id] });
    previous = id;
  }
  return trace;
}

export function createProductRuntimePlan() {
  return Object.freeze({
    tier1: [
      EvaartaRuntimeCapability.PDF,
      EvaartaRuntimeCapability.PDF_PRODUCTION,
      EvaartaRuntimeCapability.AI,
      EvaartaRuntimeCapability.COLLABORATION,
      EvaartaRuntimeCapability.MOBILE,
      EvaartaRuntimeCapability.SECURITY,
    ],
    tier2: [
      EvaartaRuntimeCapability.RESEARCH,
      EvaartaRuntimeCapability.SEARCH,
      EvaartaRuntimeCapability.DOCUMENTS,
      EvaartaRuntimeCapability.KNOWLEDGE,
      EvaartaRuntimeCapability.CITATIONS,
      EvaartaRuntimeCapability.PROJECTS,
      EvaartaRuntimeCapability.ACCESSIBILITY,
      EvaartaRuntimeCapability.INTEROPERABILITY,
      EvaartaRuntimeCapability.AUTOMATION,
    ],
    tier3: [
      "evidence-graph",
      "provenance",
      "grounded-ai",
      "evidence-to-decision",
      "decision-to-task",
      "evidence-to-project",
      "report-traceability",
      "communication-traceability",
      "end-to-end-traceability",
    ],
  });
}
