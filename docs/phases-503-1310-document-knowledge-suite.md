# e-Vaarta Document & Knowledge Suite — Phases 503–1310

This release establishes the semantic foundation for LiquidText-class evidence workflows while extending e-Vaarta into a provenance-aware knowledge and project system.

## Implemented in this release
- Typed document/evidence/claim/finding/decision/task graph.
- Evidence anchors and document revisions with re-anchoring support.
- Evidence canvas model with nodes, typed edges and deterministic layout.
- Research search helpers and literature-matrix generation.
- Project/task semantic objects and status aggregation.
- Portable JSON project-bundle contract and evidence report export.
- Document intelligence extraction primitives and quality scoring.
- Desktop model version 6 with expanded document kinds and relationship vocabulary.
- Android and iOS cross-platform semantic model equivalents.
- Golden unit tests for graph lineage, canvas, revisions and project state.

## Product contract
The source document remains immutable evidence material. User knowledge is represented in a separate semantic layer. Canvas coordinates are presentation state; the graph is authoritative. Distributed synchronization operates on semantic events rather than binary document mutation.

## Remaining production integration
Native PDF rendering, OCR engines, application-specific database adapters, background execution, platform entitlements, full Thunderbird mail-database integration and physical-device interoperability still require platform build/test validation. This branch does not claim those runtime integrations are complete.
