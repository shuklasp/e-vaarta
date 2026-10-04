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


## Phase 38: Evidence selection and group operations

The desktop Canvas now supports multi-selection of evidence items using Shift-click. The selection toolbar reports the active evidence set, allows the selection to be cleared, and can create an evidence group directly from two or more selected excerpts or annotations. When all selected evidence belongs to the same source, that source is retained on the new group; mixed-source selections remain source-neutral. Group creation preserves the original evidence items and only adds group membership.


## Phase 39: Coordinated evidence navigation

Evidence groups now have a dedicated navigator. Opening Navigate for a group presents all member evidence in order, tracks the active member, and provides Previous/Next controls. Selecting a member uses the existing synchronized evidence navigation path, so anchored annotations/excerpts jump to their source passage while the group context remains active.


## Phase 40: Evidence-group member management

Existing evidence groups can now be edited from the group manager. Multi-selected evidence can be added to or removed from a group without recreating it. Group source metadata is recalculated after membership changes: a group retains a single source only when all of its members resolve to that source; mixed-source groups become source-neutral.


## Phase 41: Evidence-group intelligence

Evidence-group cards now expose a live intelligence summary derived from their members and graph relationships. The summary reports evidence count, distinct source count, relationship count, and the distribution of evidence item kinds. This gives a group immediate structural context without changing the underlying evidence or graph model.


## Phase 42: Evidence-group relationships

Evidence groups can now participate directly in the semantic knowledge graph as relationship sources. Selecting Link on a group exposes all other evidence groups and evidence items as targets and supports the existing relationship vocabulary: relates-to, supports, contradicts, derived-from, and references. Relationships remain persisted through the same workspace link model used by individual evidence.


## Phase 43: Offline-first local storage

e-Vaarta workspace persistence is now file-backed in the Thunderbird profile rather than relying on a large preference string. Workspace state is stored locally under the e-Vaarta profile data directory, with the content index stored separately. Existing preference data is migrated automatically when no local file exists. Writes are serialized to avoid concurrent state loss, and the UI exposes explicit offline/local-storage status. If file storage fails, the application retains a local preference fallback and continues in recovery mode.

This phase is deliberately local-only: no network service is required to create, edit, navigate, search, annotate, group, or relate workspace evidence.


## Phase 44: Offline document vault

Documents opened/imported through the desktop workspace are now copied into an e-Vaarta-managed local vault under the Thunderbird profile. Each vault-backed document records a stable vault ID, relative vault path, original filename, size, MIME type, and import timestamp. The document source reference is switched to the local vault copy, allowing the workspace reader to reopen the document without depending on the original file location or network availability.

Existing documents without vault metadata remain compatible and continue using their existing source references.


## Phase 45: Vault integrity and deduplication

Vault-backed documents now carry SHA-256 content fingerprints and health metadata. When importing a file, e-Vaarta checks for an existing vault document with the same fingerprint and reuses that document instead of creating a duplicate local copy. Vault health can distinguish healthy, modified, missing, and unknown states by checking the local file and, when available, its fingerprint. The Document Library exposes the local vault state alongside the source.


## Phase 46: Vault recovery and lifecycle management

The offline vault now supports lifecycle operations from the source context menu. A missing or damaged local copy can be recovered from a user-selected file only when its SHA-256 fingerprint matches the stored fingerprint. Removing a vault reference safely deletes the local blob only when no other document references the same path; otherwise it detaches only the current document. This prevents accidental deletion of shared offline content.


## Phase 47: Offline Storage manager

e-Vaarta now includes an Offline Storage panel in the Document Library. It performs an integrity scan of vault-backed documents, reports healthy/missing/modified files, and shows the total locally stored size. This provides a single place to inspect the health of the offline document store before recovery or cleanup actions.


## Phase 48: Content-addressed vault

New vault imports are now stored under SHA-256 content-addressed blob paths and tracked by a local vault manifest. Manifest entries record blob metadata and reference counts, allowing identical content to share one physical local copy. Removing a document decrements the reference count and removes the blob only when its last reference is released. The Offline Storage manager also reports shared and orphaned manifest entries.


## Phase 49: Vault migration and manifest hardening

The vault now maintains a backup manifest and uses transactional replacement for manifest writes. Startup can recover from a damaged primary manifest using the backup, migrate legacy Phase 44–47 vault paths into content-addressed SHA-256 blob paths, and reconcile manifest reference counts from the workspace's actual document records. This makes the manifest a recoverable index rather than the sole source of truth.


## Phase 50: Vault repair and garbage collection

The Offline Storage manager now supports explicit vault maintenance. A repair operation rebuilds the manifest and reference counts from workspace records. Garbage collection removes only manifest blobs with no workspace references, and it updates the manifest after successful deletion. Missing physical blobs remain visible for recovery rather than being silently removed.


## Phase 51: Offline ingestion normalization

Pending email sources now carry explicit ingestion metadata. Email messages remain message-backed sources, while attachments are marked as deferred offline materialization rather than being falsely treated as local files. Existing local-file imports continue through the content-addressed vault pipeline, ensuring hashing, deduplication, and integrity metadata are applied consistently wherever a real filesystem source is available.


## Phase 52: Native email-attachment materialization

The Add to e-Vaarta email workflow now materializes message attachments through Thunderbird's attachment URL into a temporary local file, routes that file through the same SHA-256/content-addressed vault importer used by ordinary documents, and removes the temporary staging file afterward. Attachments that cannot be materialized remain explicitly deferred rather than being represented as falsely offline-ready sources. Email messages themselves remain backed by Thunderbird's local message store.


## Phase 53: Unified ingestion state

Document ingestion now records a persistent state machine: queued, materializing, vaulted, indexed, failed, or deferred. Attachment failures retain an error message for diagnosis, while successful materialization progresses through vault storage to indexing. The Document Library exposes the current ingestion state, making offline import progress and failures explicit rather than implicit.


## Phase 54: Durable ingestion queue and retry

Ingestion jobs are persisted in `evaarta/ingestion-queue.json`. Pending email attachments are queued before materialization, allowing the queue to survive application restart. Failed or deferred Library sources expose a Retry action; retry processing re-enters the materialization → vault → index state flow and removes a job from the queue only after successful completion.


## Phase 55: Background ingestion worker

The ingestion queue is processed asynchronously after workspace initialization rather than synchronously during startup. Queue jobs persist `state`, `attempts`, `lastError`, and timestamps. The workspace exposes an aggregate ingestion status (pending, failed, deferred), while successful jobs are removed from the durable queue. This keeps workspace rendering responsive and makes ingestion progress recoverable across restarts.


## Phase 56: Ingestion progress and cancellation

Background ingestion jobs now persist `processedBytes`, `totalBytes`, and running state. The Library displays aggregate progress for the active job and exposes a Cancel action. Cancellation returns the job to `queued` so it remains recoverable rather than being discarded; completed jobs continue through vault and index finalization.


## Phase 57: Stage-aware ingestion progress

Ingestion progress is now stage-based rather than a simple byte jump. Jobs persist a `stage` and `progress` value across starting, materializing, vaulting, extracting, indexing, and complete. Office sources invoke the existing Office extractor during the extraction stage. The Library status presents both percentage and current stage.


## Phase 58: Unified extraction pipeline

Sources now pass through a common `extractAndIndexSource()` path. The pipeline selects the existing specialized extractor by source kind: Office XML extraction for Word/PowerPoint, email-body text extraction for email sources, and OCR for images when an OCR backend is available. Extraction and indexing are reported as separate ingestion stages, while PDF text remains tied to the PDF.js reader because its page text layer provides the current page-aware extraction and anchor model.


## Phase 59: Unified PDF extraction

PDFs now participate in the unified extraction pipeline through a page-aware PDF.js extraction adapter. Native text is indexed both as a document-level entry and as page-level entries, preserving page metadata needed by evidence navigation. Existing OCR fallback remains limited to pages without native text, so scanned/mixed PDFs do not duplicate native text extraction.


## Phase 60: Extraction provenance

Indexed content now carries provenance metadata: extraction method, source kind, extraction timestamp, and method-specific details such as PDF page, OCR language, and OCR confidence. The content index was upgraded to version 4 with migration support for older entries, which are marked as legacy provenance rather than losing existing searchable content.


## Phase 61: Provenance-aware search

Search results now expose extraction provenance. Results identify whether content came from native PDF text, OCR, Office extraction, email body, or legacy indexing, with page information and extraction timestamp where available. OCR results also expose confidence when supplied by the configured backend.


## Phase 62: Actionable evidence navigation

Search results are now source-aware navigation targets. PDF results with page metadata open the corresponding page and attempt to restore a text selection using the matching query term. Email-body results open the originating message, while other indexed source results open the associated source document.


## Phase 63: Evidence preview interaction

Search results now provide an explicit **Preview** action that opens an inline evidence preview without leaving the current workspace. The preview keeps the existing excerpt and provenance information together and adds the resolved source, collections, evidence-group membership, and graph relationships when those entities are available.

The preview's **Open evidence** action reuses the existing source-aware navigation path, including page-aware PDF navigation and email-source opening. Preview is therefore a non-destructive inspection step: users can evaluate evidence context before committing to navigation away from the current canvas state.


## Phase 64: Persistent evidence context

Evidence context is now available directly from annotation rows and workspace canvas evidence cards. An **Inspect context** action reveals the evidence's source, source page, evidence-group membership, and graph relationships without replacing the current workspace state. The same source-aware **Jump to evidence** / **Jump to source** behavior remains available from the context panel.

This extends Phase 63 beyond search: evidence can now be inspected wherever it is already being worked with, while navigation remains an explicit user action.


## Phase 65: Bidirectional evidence references

Sources now expose reverse evidence usage in Search and on first-class workspace source cards. When a source has anchored excerpts or annotations, the UI reports how many evidence items and evidence groups reference that source. This makes the relationship bidirectional: users can move from evidence to its source and also see, from the source, how much evidence has been built from it.

The reference counts are derived from the canonical workspace evidence model rather than stored as duplicated counters, so they remain consistent as evidence and group membership change.
