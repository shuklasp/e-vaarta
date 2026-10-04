/* MPL-2.0 */

/**
 * Cross-product acceptance contracts.
 * These are executable data structures rather than marketing claims.
 */

export const ProductClass = Object.freeze({
  PDF: "pdf",
  RESEARCH: "research",
  DOCUMENTS: "documents",
  KNOWLEDGE: "knowledge",
  CITATIONS: "citations",
  COMMUNICATION: "communication",
  SEARCH: "search",
  AI: "ai",
  PROJECTS: "projects",
  COLLABORATION: "collaboration",
  MOBILE: "mobile",
  ACCESSIBILITY: "accessibility",
  AUTOMATION: "automation",
  INTEROPERABILITY: "interoperability",
  SECURITY: "security",
  SEMANTIC: "semantic",
});

export const AcceptanceLevel = Object.freeze({
  CONTRACTED: "contracted",
  IMPLEMENTED: "implemented",
  INTEGRATED: "integrated",
  VALIDATED: "validated",
});

const CONTRACTS = Object.freeze([
  ["pdf", [
    "rendering", "navigation", "reflow", "selection", "annotations",
    "forms", "editing", "redaction", "signatures", "ocr", "comparison",
    "accessibility", "large-document-performance", "print-export",
    "multi-document-reading", "evidence-extraction",
  ]],
  ["research", [
    "fluid-extraction", "spatial-workspace", "multi-document-reading",
    "source-navigation", "pen-touch", "revision-awareness",
  ]],
  ["documents", [
    "content-addressed-storage", "revisions", "duplicates", "metadata",
    "smart-filing", "rules", "batch-processing", "conversion",
  ]],
  ["knowledge", [
    "markdown", "block-references", "transclusion", "aliases", "properties",
    "backlinks", "graph", "canvas", "queries", "templates", "bases",
  ]],
  ["citations", [
    "doi", "isbn", "pmid", "arxiv", "orcid", "ris", "bibtex", "csl",
    "bibliography", "word", "libreoffice", "google-docs",
  ]],
  ["communication", [
    "email", "attachments", "conversations", "offline-mail", "calendar",
    "contacts", "capture", "message-intelligence", "universal-message-model", "identity-resolution", "provider-adapters", "unified-inbox", "threading", "team-chat", "offline-send-queue", "notifications", "meeting-workspace", "availability", "external-channel-adapters", "communication-ai", "reply-grounding", "communication-to-task", "communication-to-decision", "workflow-automation", "encryption-boundary", "dlp", "retention", "legal-hold", "audit", "interoperability", "production-integration", "provider-transport", "calendar-provider-boundary", "credential-isolation", "capability-authorization", "end-to-end-validation",
  ]],
  ["search", [
    "lexical", "hybrid", "semantic", "metadata", "ocr", "annotations",
    "evidence", "projects", "saved-searches", "federated-local-search",
  ]],
  ["ai", [
    "grounded-answers", "citation-grounding", "local-models",
    "provider-abstraction", "document-ai", "email-ai", "research-ai",
    "meeting-ai", "controlled-agents", "permissioned-actions",
  ]],
  ["projects", [
    "tasks", "subtasks", "dependencies", "critical-path", "milestones", "kanban", "list",
    "calendar", "timeline", "gantt", "sprints", "backlog", "capacity", "workload", "assignment",
    "acceptance", "monitoring", "stalled-detection", "escalation", "sla", "recurrence", "checklists",
    "time-tracking", "activity-stream", "decisions", "reports", "evidence-linked-tasks", "verification",
    "portfolio", "risk", "predictive-deadlines", "decision-to-task", "evidence-to-task", "evidence-completion",
    "impact-analysis", "grounded-project-control", "weekly-review", "authorization-boundary",
  ]],
  ["collaboration", [
    "semantic-events", "three-way-merge", "conflict-review",
    "offline-collaboration", "store-forward", "peer-sync",
  ]],
  ["mobile", [
    "reader", "annotations", "workspace", "search", "offline-vault",
    "scan", "camera-capture", "voice-capture", "touch-pen",
  ]],
  ["accessibility", [
    "keyboard", "screen-reader", "reflow", "high-contrast", "text-scale",
    "focus", "reduced-motion", "accessible-forms", "accessible-export",
  ]],
  ["automation", [
    "rules", "triggers", "conditions", "ai-actions", "permissions",
    "audit", "undo", "scheduled-actions",
  ]],
  ["interoperability", [
    "round-trip-validation", "loss-report", "eml", "mbox", "maildir", "pdf", "docx", "pptx", "xlsx", "markdown",
    "html", "bibtex", "ris", "csl-json", "opml", "ics", "json-canvas",
    "evaarta-json",
  ]],
  ["security", [
    "threat-model", "malicious-document-isolation", "device-identity", "capabilities", "signed-events", "encrypted-envelopes",
    "secure-storage", "audit-log", "retention", "legal-hold",
  ]],
  ["semantic", [
    "evidence-action-graph", "provenance", "revision-awareness", "cross-platform-semantic-model",
    "typed-edges", "evidence-linked-decisions", "evidence-linked-tasks",
    "report-traceability", "communication-traceability", "validation-evidence", "human-benchmark",
  ]],
]);

export function listProductContracts() {
  return CONTRACTS.map(([productClass, capabilities]) => ({
    productClass,
    capabilities: [...capabilities],
  }));
}

export function getProductContract(productClass) {
  const item = CONTRACTS.find(([name]) => name === productClass);
  return item ? { productClass: item[0], capabilities: [...item[1]] } : null;
}

export function createAcceptanceRecord({
  productClass,
  capability,
  level = AcceptanceLevel.CONTRACTED,
  evidence = [],
}) {
  if (!getProductContract(productClass)?.capabilities.includes(capability)) {
    throw new RangeError("capability is not in the product contract");
  }
  if (!Object.values(AcceptanceLevel).includes(level)) {
    throw new RangeError("unsupported acceptance level");
  }
  return Object.freeze({
    productClass,
    capability,
    level,
    evidence: [...evidence],
  });
}

export function isValidated(record) {
  return record?.level === AcceptanceLevel.VALIDATED;
}
