# Phases 1311–1399 — LiquidText-class research workspace

These phases close the remaining interaction gap between e-Vaarta's semantic evidence model and a polished spatial research workflow.

## 1311–1320 — Spatial workspace engine
- Infinite/large-bounds canvas with camera transform.
- Semantic zoom levels: source, excerpt, evidence, claim, finding.
- Snap-to-grid and optional magnetic alignment.
- Multi-select, lasso, marquee, group move, duplicate, align and distribute.
- Undo/redo as semantic mutations, not pixel snapshots.
- Persistent viewport state separate from graph state.

## 1321–1330 — Fluid extraction
- Drag a text selection directly into the canvas.
- Preserve document, revision, page, offsets, quote and geometry.
- Create an excerpt card without copying provenance into presentation-only state.
- Keyboard/touch/pen capture parity.
- Capture-to-note, capture-to-evidence and capture-to-claim actions.

## 1331–1340 — Multi-document reading
- Split reader/canvas view.
- Multiple synchronized source panes.
- Tabbed document sessions.
- Cross-document selection.
- Source pinning and temporary source stacks.
- Jump back to exact source location after canvas navigation.

## 1341–1350 — Pen and touch
- Stylus ink layer independent from semantic annotations.
- Palm rejection and pressure/tilt where platform APIs expose them.
- Ink-to-text as an optional local operation.
- Gesture vocabulary for pan, zoom, lasso and capture.
- Accessibility alternative for every gesture.

## 1351–1360 — Comparison
- Side-by-side and synchronized-scroll comparison.
- Text-level and page-level difference detection.
- Added/removed/changed evidence.
- Revision-aware re-anchoring.
- Compare selected evidence groups across revisions.

## 1361–1370 — Spatial intelligence
- Automatic evidence clustering.
- Relationship labels.
- Local graph minimap.
- Focus mode around a selected claim/finding.
- Semantic zoom that never changes graph meaning.

## 1371–1380 — Research ergonomics
- Keyboard-first commands.
- Command palette.
- Quick capture.
- Recent sources.
- Evidence inbox.
- Temporary scratch space.
- Recoverable unsaved capture.

## 1381–1390 — Performance
- Virtualized canvas nodes.
- Progressive document rendering.
- Background OCR/indexing.
- Bounded memory for large workspaces.
- Interaction latency budget instrumentation.

## 1391–1399 — Acceptance
The LiquidText parity suite must prove:
- selection → canvas capture preserves provenance;
- canvas → source returns to the exact anchor;
- multi-document reading does not lose selection context;
- pen/touch and keyboard paths produce equivalent semantic objects;
- revision comparison preserves evidence identity;
- offline reopen preserves graph and spatial state;
- 1,000 evidence nodes remain usable without corrupting the graph.

The semantic graph remains authoritative throughout. A canvas implementation that stores only pixels is non-conforming.
