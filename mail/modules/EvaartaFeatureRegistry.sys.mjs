/* MPL-2.0 */

export const FeatureStatus = Object.freeze({
  PLANNED: "planned",
  CONTRACTED: "contracted",
  IMPLEMENTED: "implemented",
  INTEGRATED: "integrated",
  VALIDATED: "validated",
});

const CAPABILITIES = Object.freeze([
  { id: "workspace", area: "knowledge", status: FeatureStatus.IMPLEMENTED },
  { id: "source-anchors", area: "evidence", status: FeatureStatus.IMPLEMENTED },
  { id: "annotations", area: "evidence", status: FeatureStatus.IMPLEMENTED },
  { id: "evidence-groups", area: "evidence", status: FeatureStatus.IMPLEMENTED },
  { id: "offline-persistence", area: "offline", status: FeatureStatus.IMPLEMENTED },
  { id: "crash-safe-storage", area: "offline", status: FeatureStatus.IMPLEMENTED },
  { id: "deep-links", area: "ux", status: FeatureStatus.IMPLEMENTED },
  { id: "command-system", area: "ux", status: FeatureStatus.IMPLEMENTED },
  { id: "spatial-canvas", area: "research", status: FeatureStatus.IMPLEMENTED },
  { id: "fluid-extraction", area: "research", status: FeatureStatus.CONTRACTED },
  { id: "multi-document-reader", area: "research", status: FeatureStatus.CONTRACTED },
  { id: "pen-and-touch", area: "research", status: FeatureStatus.CONTRACTED },
  { id: "document-comparison", area: "documents", status: FeatureStatus.IMPLEMENTED },
  { id: "hybrid-search", area: "search", status: FeatureStatus.IMPLEMENTED },
  { id: "citation-engine", area: "research", status: FeatureStatus.IMPLEMENTED },
  { id: "smart-filing", area: "knowledge", status: FeatureStatus.IMPLEMENTED },
  { id: "grounded-ai", area: "ai", status: FeatureStatus.IMPLEMENTED },
  { id: "controlled-agents", area: "ai", status: FeatureStatus.CONTRACTED },
  { id: "offline-collaboration", area: "collaboration", status: FeatureStatus.CONTRACTED },
  { id: "secure-sync", area: "security", status: FeatureStatus.IMPLEMENTED },
  { id: "browser-capture", area: "integrations", status: FeatureStatus.CONTRACTED },
  { id: "calendar", area: "integrations", status: FeatureStatus.IMPLEMENTED },
  { id: "contacts-graph", area: "integrations", status: FeatureStatus.CONTRACTED },
  { id: "media-intelligence", area: "media", status: FeatureStatus.IMPLEMENTED },
  { id: "institutional-governance", area: "enterprise", status: FeatureStatus.CONTRACTED },

  { id: "pdf-reader-model", area: "pdf", status: FeatureStatus.IMPLEMENTED },
  { id: "pdf-native-renderer", area: "pdf", status: FeatureStatus.CONTRACTED },
  { id: "pdf-reading-mode", area: "pdf", status: FeatureStatus.CONTRACTED },
  { id: "pdf-reflow", area: "pdf", status: FeatureStatus.CONTRACTED },
  { id: "pdf-layout-navigation", area: "pdf", status: FeatureStatus.CONTRACTED },
  { id: "pdf-semantic-search", area: "pdf", status: FeatureStatus.CONTRACTED },
  { id: "pdf-annotation-engine", area: "pdf", status: FeatureStatus.CONTRACTED },
  { id: "pdf-forms", area: "pdf", status: FeatureStatus.CONTRACTED },
  { id: "pdf-redaction", area: "pdf", status: FeatureStatus.CONTRACTED },
  { id: "pdf-signatures", area: "pdf", status: FeatureStatus.CONTRACTED },
  { id: "pdf-accessibility", area: "pdf", status: FeatureStatus.CONTRACTED },
  { id: "pdf-large-document-performance", area: "pdf", status: FeatureStatus.CONTRACTED },
  { id: "pdf-print-export-fidelity", area: "pdf", status: FeatureStatus.CONTRACTED },
  { id: "pdf-evidence-extraction", area: "pdf", status: FeatureStatus.CONTRACTED },
  { id: "pdf-multidocument-reading", area: "pdf", status: FeatureStatus.CONTRACTED },

  { id: "knowledge-authoring", area: "knowledge", status: FeatureStatus.IMPLEMENTED },
  { id: "block-references", area: "knowledge", status: FeatureStatus.IMPLEMENTED },
  { id: "transclusion", area: "knowledge", status: FeatureStatus.IMPLEMENTED },
  { id: "json-canvas", area: "knowledge", status: FeatureStatus.IMPLEMENTED },
  { id: "auditable-automation", area: "automation", status: FeatureStatus.IMPLEMENTED },
  { id: "accessibility-profile", area: "accessibility", status: FeatureStatus.IMPLEMENTED },
  { id: "interoperability-matrix", area: "interoperability", status: FeatureStatus.IMPLEMENTED },

  { id: "markdown-vault", area: "knowledge", status: FeatureStatus.CONTRACTED },
  { id: "scholarly-metadata", area: "citations", status: FeatureStatus.CONTRACTED },
  { id: "citation-word-integration", area: "citations", status: FeatureStatus.CONTRACTED },
  { id: "pdf-editing", area: "pdf", status: FeatureStatus.CONTRACTED },
  { id: "pdf-production", area: "pdf", status: FeatureStatus.CONTRACTED },
  { id: "pdf-digital-signing", area: "pdf", status: FeatureStatus.CONTRACTED },
  { id: "pdf-form-engine", area: "pdf", status: FeatureStatus.CONTRACTED },
  { id: "large-document-engine", area: "documents", status: FeatureStatus.CONTRACTED },
  { id: "local-model-runtime", area: "ai", status: FeatureStatus.CONTRACTED },
  { id: "provider-ai-abstraction", area: "ai", status: FeatureStatus.CONTRACTED },
  { id: "evidence-agent", area: "ai", status: FeatureStatus.CONTRACTED },
  { id: "evidence-action-graph", area: "semantic", status: FeatureStatus.IMPLEMENTED },
  { id: "pdf-production-contract", area: "pdf", status: FeatureStatus.IMPLEMENTED },
  { id: "research-interaction-model", area: "research", status: FeatureStatus.IMPLEMENTED },
  { id: "scholarly-citation-model", area: "citations", status: FeatureStatus.IMPLEMENTED },
  { id: "markdown-vault-model", area: "knowledge", status: FeatureStatus.IMPLEMENTED },
  { id: "local-ai-boundary", area: "ai", status: FeatureStatus.IMPLEMENTED },
  { id: "semantic-collaboration-events", area: "collaboration", status: FeatureStatus.IMPLEMENTED },
  { id: "mobile-capture-model", area: "mobile", status: FeatureStatus.IMPLEMENTED },
  { id: "production-runtime-boundary", area: "runtime", status: FeatureStatus.IMPLEMENTED },
  { id: "tier1-runtime-plan", area: "runtime", status: FeatureStatus.IMPLEMENTED },
  { id: "tier2-runtime-plan", area: "runtime", status: FeatureStatus.IMPLEMENTED },
  { id: "tier3-evidence-lifecycle", area: "semantic", status: FeatureStatus.IMPLEMENTED },
  { id: "semantic-collaboration", area: "collaboration", status: FeatureStatus.CONTRACTED },
  { id: "mobile-pdf-reader", area: "mobile", status: FeatureStatus.CONTRACTED },
  { id: "mobile-evidence-workspace", area: "mobile", status: FeatureStatus.CONTRACTED },
  { id: "camera-scanning", area: "mobile", status: FeatureStatus.CONTRACTED },
  { id: "voice-capture", area: "mobile", status: FeatureStatus.CONTRACTED },
  { id: "best-in-class-program", area: "quality", status: FeatureStatus.IMPLEMENTED },
  { id: "task-work-management-2", area: "projects", status: FeatureStatus.IMPLEMENTED },
  { id: "task-assignment", area: "projects", status: FeatureStatus.IMPLEMENTED },
  { id: "task-capacity", area: "projects", status: FeatureStatus.IMPLEMENTED },
  { id: "task-monitoring", area: "projects", status: FeatureStatus.IMPLEMENTED },
  { id: "task-escalation-sla", area: "projects", status: FeatureStatus.IMPLEMENTED },
  { id: "task-work-operating-system", area: "projects", status: FeatureStatus.IMPLEMENTED },
  { id: "task-phase-a-execution", area: "projects", status: FeatureStatus.IMPLEMENTED },
  { id: "task-phase-b-workforce", area: "projects", status: FeatureStatus.IMPLEMENTED },
  { id: "task-phase-c-management", area: "projects", status: FeatureStatus.IMPLEMENTED },
  { id: "task-phase-d-evidence", area: "semantic", status: FeatureStatus.IMPLEMENTED },
  { id: "task-phase-e-intelligence", area: "ai", status: FeatureStatus.IMPLEMENTED },
]);

export function listFeatureCapabilities() {
  return CAPABILITIES.map(feature => ({ ...feature }));
}

export function getFeatureCapability(id) {
  const feature = CAPABILITIES.find(item => item.id === id);
  return feature ? { ...feature } : null;
}

export function featureStatus(id) {
  return getFeatureCapability(id)?.status || null;
}

export function hasFeatureStatus(id, minimumStatus) {
  const order = [
    FeatureStatus.PLANNED,
    FeatureStatus.CONTRACTED,
    FeatureStatus.IMPLEMENTED,
    FeatureStatus.INTEGRATED,
    FeatureStatus.VALIDATED,
  ];
  const actual = featureStatus(id);
  return actual != null && order.indexOf(actual) >= order.indexOf(minimumStatus);
}
