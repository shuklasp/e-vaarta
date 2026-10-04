# e-Vaarta Knowledge Workspace\n\nPhase 3 turns the document workspace into a visual knowledge layer.\n\n## What is now implemented\n\n- Workspace cards for excerpts and notes.\n- Semantic relationships between cards:\n  - relates-to\n  - supports\n  - contradicts\n  - derived-from\n  - references\n- Relationship selection without free-form relationship strings.\n- Visual SVG connectors between related cards.\n- Relationship labels on graph edges.\n- Relationship chips on each connected card.\n- Relationship inspector with removal.\n- Card selection and connected-card highlighting.\n- Source badges showing the document that produced an excerpt.\n- Jump-to-source remains available from source-bound cards.\n- Workspace persistence continues to use the existing e-Vaarta workspace model.\n\n## Interaction model\n\n1. Create or capture two workspace items.\n2. Click **Link** on the first card.\n3. Choose the relationship type.\n4. Click **Link** on the second card.\n5. e-Vaarta persists the semantic link and draws the relationship.\n6. Click an edge or relationship chip to inspect it.\n7. Use **Remove relationship** to delete the selected relationship.\n\nRelationships are semantic data, not visual-only lines. The graph can therefore be rendered differently by desktop, Android and iOS clients while preserving the same workspace meaning.\n\n## Source integrity\n\nAn excerpt still retains its source anchor:\n\n- source document ID\n- optional page\n- optional character offsets\n- quoted source text\n\nThe knowledge graph therefore connects ideas without losing the ability to return to the original evidence.\n\n## Next work\n\nThe next layer should replace the temporary prompt-based note editor with a native workspace editor and then add stronger source selection/annotation support for the native PDF viewer. After that, the same knowledge interactions can be surfaced in Android and iOS.

## Phase 3.5: workspace editor and annotations

The desktop workspace now has an in-page editor instead of browser-style prompts. Notes and source excerpts can be created or edited through the workspace editor, with titles, content and optional source page captured together.

The workspace also exposes **Highlight selection**. A selected source passage becomes an annotation item with:

- annotation type
- source document ID
- optional page
- quoted source text
- annotation text

The annotation remains part of the same graph as notes and excerpts, so it can participate in semantic relationships.

The current selection bridge intentionally remains defensive. Native PDF viewers may keep text selection inside an internal viewer document, so the next PDF-specific step is to integrate with Thunderbird's native PDF/content-tab selection machinery rather than assuming iframe-level selection is always available.


## Phase 4: PDF selection bridge

The desktop workspace now listens for source selection changes through the embedded document hierarchy. When PDF.js exposes a selectable text layer, e-Vaarta records the selected quote, the PDF.js page number when available, and the selection range offsets.

This bridge deliberately lives on the e-Vaarta workspace side rather than patching PDF.js. It recursively attaches to accessible child frames and ignores contexts that enforce a different origin. This keeps the integration compatible with Thunderbird PDF.js updates while allowing e-Vaarta to consume native PDF text selection.

The **Capture selection** action creates a source-bound excerpt, while **Highlight selection** creates a source-bound annotation. Both retain the same source document and selection metadata, making them usable by the knowledge graph.

The next refinement should add persistent text-layer selectors or PDF.js-specific page coordinates where available, followed by an actual Thunderbird build/runtime test of selection capture across representative PDFs.


## Phase 5: Persistent source anchors

Source anchors now support optional selector and rects metadata in addition to document ID, page, offsets, and quoted text. The model is version 2 and migrates version-1 workspaces by adding the new optional fields without changing existing evidence.

The desktop workspace also reopens source-bound items using their stored page and quote. After the PDF viewer loads, e-Vaarta searches the PDF.js text layer for the saved quote, selects the matching range, and scrolls it into view. This provides an exact-passage fallback even when PDF.js does not expose a stable external selector.

The next hardening step is to capture PDF.js text-layer coordinates/selectors when available and use those as the primary locator, with quote matching retained as a recovery mechanism.
