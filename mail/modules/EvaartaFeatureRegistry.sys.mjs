/* MPL-2.0 */

/**
 * Product capability registry.
 *
 * This is deliberately small and dependency-free so every product surface can
 * ask the same question: is a capability implemented, contracted, integrated,
 * validated, or planned? It prevents documentation and UI from overstating
 * semantic prototypes as production integrations.
 */

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
  { id: "spatial-canvas", area: "research", status: FeatureStatus.CONTRACTED },
  { id: "fluid-extraction", area: "research", status: FeatureStatus.CONTRACTED },
  { id: "multi-document-reader", area: "research", status: FeatureStatus.CONTRACTED },
  { id: "pen-and-touch", area: "research", status: FeatureStatus.CONTRACTED },
  { id: "document-comparison", area: "documents", status: FeatureStatus.CONTRACTED },
  { id: "hybrid-search", area: "search", status: FeatureStatus.CONTRACTED },
  { id: "citation-engine", area: "research", status: FeatureStatus.CONTRACTED },
  { id: "smart-filing", area: "knowledge", status: FeatureStatus.CONTRACTED },
  { id: "grounded-ai", area: "ai", status: FeatureStatus.CONTRACTED },
  { id: "controlled-agents", area: "ai", status: FeatureStatus.CONTRACTED },
  { id: "offline-collaboration", area: "collaboration", status: FeatureStatus.CONTRACTED },
  { id: "secure-sync", area: "security", status: FeatureStatus.CONTRACTED },
  { id: "browser-capture", area: "integrations", status: FeatureStatus.CONTRACTED },
  { id: "calendar", area: "integrations", status: FeatureStatus.CONTRACTED },
  { id: "contacts-graph", area: "integrations", status: FeatureStatus.CONTRACTED },
  { id: "media-intelligence", area: "media", status: FeatureStatus.CONTRACTED },
  { id: "institutional-governance", area: "enterprise", status: FeatureStatus.CONTRACTED },
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
  return actual != null &&
    order.indexOf(actual) >= order.indexOf(minimumStatus);
}
