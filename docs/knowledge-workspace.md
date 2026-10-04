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


## Phase 6: Persistent PDF highlights

PDF selections now capture optional PDF.js text-layer selectors and selection rectangles in addition to the source quote and page. When a source-bound annotation is reopened, e-Vaarta attempts to restore the highlight directly on the corresponding PDF.js text-layer spans and scrolls the first matched span into view. Quote-based range restoration remains active as the fallback. The source PDF itself is not modified; annotation state remains part of the e-Vaarta workspace model.


## Phase 7: Annotation management

The workspace now includes an annotation panel with a source-bound list, jump-to-source, edit, and delete actions. Annotations retain their source anchor and graph relationships when edited. The annotation model supports highlight, underline, strikethrough, and comment types plus a persisted color. PDF.js text-layer restoration applies the appropriate visual class and color when the annotation is reopened.


## Phase 8: Document Library and unified search

The shared document model is now version 3 and supports document descriptions and tags. The model also provides a workspace search function covering source documents, notes, excerpts, and annotations, with source document context attached to item results. The desktop workspace exposes this through a unified Search panel; selecting a result opens the source or jumps to the corresponding source-bound item.

This is the first library/search foundation rather than a full-text extraction service. PDF/Office content indexing should be added as a separate ingestion layer so large documents are not embedded wholesale in workspace JSON.


## Phase 9: Content indexing foundation

A separate `EvaartaContentIndex` module now stores searchable content outside workspace JSON. It supports versioned entries, upsert/remove operations, simple term-based scoring, and serialized persistence. The desktop workspace maintains an index preference and feeds it document metadata plus excerpts, notes, and annotations. Search prefers indexed results and falls back to the semantic workspace search when the index has no matches.

The index intentionally exposes an adapter boundary: future ingestion services can add extracted PDF text, email bodies, Office text, attachment metadata, and OCR without changing the workspace/annotation model. The current phase indexes metadata and workspace-derived text; it does not yet attempt heavyweight PDF or Office extraction.


## Phase 10: Incremental content ingestion

The content index now supports extracted-content entries, fingerprints, and `needsReindex()` checks so ingestion can be incremental instead of rebuilding all text on every workspace load. The desktop workspace adds an email-body ingestion hook and document-content metadata ingestion. Heavy extraction remains adapter-driven; the next integration can feed real Thunderbird message bodies and PDF text into these APIs without changing search or workspace semantics.


## Phase 11: Live email-body ingestion

The message header view now indexes the body text of the currently displayed Thunderbird message after MIME rendering completes. It reads the rendered message DOM, normalizes the visible text, fingerprints it, and writes an `email-body` entry only when the content has changed. Search results for indexed email bodies reopen the original message window using its message URI.

This deliberately indexes the rendered body rather than attempting to duplicate Thunderbird's MIME parsing stack. It therefore respects the message representation Thunderbird has already resolved, while the existing attachment pipeline remains responsible for document attachments.


PDF text is now also ingested from the native PDF.js text layer when a PDF source loads. The extracted page text is fingerprinted and stored as a `pdf-text` index entry with page count metadata; unchanged PDFs are skipped on subsequent loads. This is a text-layer path, so scanned/image-only PDFs will require the future OCR adapter.


## Phase 12: Office document ingestion

DOCX and PPTX files can now be text-indexed directly from their OOXML ZIP payloads. DOCX extraction reads `word/document.xml`; PPTX extraction reads and orders `ppt/slides/slide*.xml`. The extracted text is normalized, fingerprinted, and stored as an `office-text` content-index entry, so repeated opens do not duplicate unchanged content.

Legacy binary `.doc` and `.ppt` formats are intentionally not parsed by this lightweight extractor. They remain available as document sources and can be handled later through a dedicated conversion/extraction adapter.

The next ingestion extension is OCR for scanned/image-only PDFs and images, using the same `upsertExtractedContent` contract.


## Phase 13: OCR adapter

The ingestion pipeline now has a provider-neutral OCR contract. PDF sources with no usable native text and image sources can request OCR through `EvaartaOcr.sys.mjs`; OCR output is normalized into an `ocr-text` index entry with optional language, confidence, and page metadata. The workspace exposes whether an OCR backend is currently registered.

No OCR engine or external service is bundled by this phase. This is intentional: the adapter boundary allows a future local OCR engine or a user-configured remote provider to be added without coupling the workspace, annotations, or search engine to that implementation.


## Phase 14: Local Tesseract OCR backend

A local Tesseract backend is now automatically registered when a Tesseract executable is detected. Supported default locations include common Linux, macOS Homebrew, and Windows installation paths; a custom executable can be supplied through the `mail.evaarta.ocr.tesseractPath` preference. The OCR language defaults to `eng` and can be changed with `mail.evaarta.ocr.language`.

The backend currently OCRs local image documents. It runs Tesseract through Thunderbird's `Subprocess.sys.mjs` API and captures stdout directly, avoiding shell command construction. The workspace reports when the backend becomes ready. PDF OCR still requires a PDF-page rendering adapter before Tesseract can process scanned PDF pages.


## Phase 15: Scanned PDF OCR

Scanned and mixed-content PDFs now use page-aware OCR. e-Vaarta obtains the PDF.js document, renders each page to an off-screen canvas at OCR resolution, writes a temporary PNG, and sends that image through the local OCR adapter. Each OCR result is indexed independently as `ocr-text-page` with its PDF page number. Pages that already contain native PDF text are skipped, allowing mixed PDFs to combine native extraction and OCR without duplicating content.

Temporary rendered images are deleted after OCR. OCR indexing therefore stores searchable text and page metadata, not page image copies. Search results can use the recorded page number to reopen the PDF at the relevant page.


## Phase 16: Source-aware search navigation

Search results now include a contextual excerpt generated around the first matched term and optional source location metadata. OCR page entries expose their PDF page number. Selecting a page-aware result opens the corresponding source directly at that page; email-body results continue to open the original Thunderbird message. Index version 3 migrates existing v1/v2 indexes automatically.


## Phase 18: Library-to-canvas workflow

Document Library entries are draggable using the `application/x-evaarta-document` payload. Dropping a source onto the workspace canvas creates a source-backed excerpt card containing the document title and metadata. The operation is persistent, selects the new card, and is idempotent for the same source/card. The canvas provides visual drop feedback during a drag operation.


## Phase 20: Visual Document Library

The Document Library now supports list and grid views. Grid cards show a type-specific visual marker, title, type/tags metadata, description when available, and the existing metadata editor. The view is client-side and preserves the existing source selection, drag/drop, filtering, and search behavior.


## Phase 21: Visual source previews

Grid cards now render actual image thumbnails when the source is an image and a first-page PDF preview surface for PDF sources. Office, email, and other source kinds retain lightweight type markers so the Library avoids eagerly loading large document payloads. Preview failures fall back to the source type marker.


## Phase 22: Library collections and smart filters

The Document Library now provides built-in collections: All, Recent (last seven days), PDF, Office, Email, and Images. Collections combine with the existing free-text filter, so users can narrow a collection by title, description, type, or tags. The active collection is reflected in the Library UI while list/grid and drag/drop behavior remain unchanged.


## Phase 24: Smart collections

Collections can now optionally contain a smart rule. Rules can match document type, an exact tag, text in title/description/tags, and a recency window in days. Multiple filled conditions are combined with AND semantics. Smart collections calculate membership dynamically from canonical documents and do not duplicate document records. Clearing the rule returns the collection to manual membership mode. Workspace model version 4 migrates older collections automatically.


## Phase 25: Search and collections integration

Unified Search now shows the collections containing each matched document. A search can also be saved as a smart collection from the Search pane. The saved collection uses a text rule over document title, description, and tags, so its membership remains dynamic as document metadata changes.


## Phase 26: Collection-aware workspace cards

Source-backed workspace cards now expose the collections containing their source. Collection chips are interactive: selecting one switches the Document Library to that collection. Smart collections use their dynamically calculated membership, so the context stays current as document metadata changes. The collection manager also reports dynamic counts for smart collections.


## Phase 27: First-class source cards

Library-backed cards on the workspace canvas are now treated as first-class source cards. They identify themselves as SOURCE, show document type and tags, expose collection context, and provide Open, Metadata, and Remove actions. Remove only removes the canvas card; the underlying document and its collection membership remain intact. Normal excerpts retain source-jump behavior.


## Phase 28: Visual source previews

First-class source cards now include lightweight visual previews. Image documents render their image thumbnail, PDFs render page one through the existing PDF viewer, and Office, email, and other document types use a compact type marker. Preview failures fall back to the document type without affecting source actions or workspace data.


## Phase 29: Interactive source previews

Source previews on workspace cards are now explicit source-opening controls. Clicking or keyboard-activating a preview selects and opens the source without triggering the surrounding card's graph-selection behavior. Hover and focus states provide visual feedback, while previews remain non-editable.


## Phase 30: Source context actions

Sources in the Document Library and first-class source cards on the workspace canvas now expose a native context menu. It provides Open source, Add excerpt, Edit metadata, Add/remove collection, and Remove from workspace actions. Removing a canvas source card does not remove the underlying Library document.


## Phase 31: Source-centric navigation

The Document Library and workspace canvas now provide bidirectional source navigation. Selecting a Library source focuses its corresponding source-backed canvas card when present; selecting a source card focuses the corresponding Library entry. Focus transitions use a brief visual pulse and do not alter document or collection data.


## Phase 32: Source-aware excerpts

Excerpts created from a source card through its context actions are marked source-aware and automatically linked to the corresponding source card with a `derived-from` relationship when that card exists. Selecting any source-backed excerpt also focuses its originating document in the Library and Reader.


## Phase 33: Evidence hierarchy visualization

Source-aware excerpts are now visually identified as evidence nodes. Their automatic `derived-from` relationships use a distinct dashed graph edge and become emphasized when the related node is selected. Direct evidence relationships also receive a subtle card highlight, making source-to-excerpt structure easier to read without changing graph semantics.


## Phase 34: Evidence navigation

Evidence excerpts are now first-class navigation targets. Selecting an anchored excerpt synchronizes the Canvas selection with its originating document in the Document Library and opens the Reader at the stored page. When a quote is available, the Reader also restores the stored evidence selection using the PDF.js span selector first and the quoted text as a fallback. The Canvas keeps the evidence card visibly active while the navigation occurs. The explicit action on anchored evidence is labelled **Jump to evidence**, while other anchored items retain **Jump to source**.


## Phase 35: Annotation synchronization

Annotations now participate in bidirectional source synchronization. PDF selections preserve their page, quote, PDF.js span selector, and selection rectangles when creating annotations. Selecting an annotation jumps to its anchored source and focuses its Canvas card; selecting the matching source passage automatically selects the corresponding annotation card when one exists. Anchor restoration is guarded so programmatic PDF selection does not recursively trigger annotation synchronization. The annotation panel's Jump to annotation action uses the same synchronized navigation path.


## Phase 36: Evidence groups

Evidence groups provide a semantic container for related excerpts and annotations. A group has a stable ID, name, description, optional source document, and item IDs, so it can be shared across clients without depending on canvas layout. The desktop workspace provides an Evidence groups manager, group chips on evidence cards, creation from the selected item, adding the selected item to an existing group, opening a group's evidence, and deleting a group without deleting its underlying evidence.


## Phase 37: Evidence-group graph semantics

Evidence groups are now first-class knowledge-graph nodes. Relationships may connect an evidence group to an excerpt, annotation, note, source-backed card, or another evidence group using the existing semantic relationship vocabulary. Group nodes render as distinct cluster cards on the Canvas and expose their member evidence directly.

Selecting a group highlights its member evidence and synchronizes to the group's source document when one is recorded. Group relationships use the same persistent link model as item relationships, allowing later clients and the AI layer to reason over an entire evidence set rather than requiring every member relationship to be duplicated.
