# e‑Vaarta Best-in-Class Product Contract

## Objective
e‑Vaarta is not complete when it is merely broader than competing products. Every major product class must independently meet or exceed the strongest practical competitor before e‑Vaarta 1.0 is considered complete.

> **Best in every class, then uniquely better across the complete evidence-to-action workflow.**

## Product classes and benchmark leaders
| Class | Benchmark set | e‑Vaarta target |
|---|---|---|
| PDF reader | Acrobat, PDF Expert, Foxit, Zotero, LiquidText | Best reader + best research semantics |
| Research reading | LiquidText, MarginNote, Zotero | Best extraction, spatial reasoning and provenance |
| Document management | DEVONthink | Best local document intelligence |
| Knowledge management | Obsidian, DEVONthink | Best open semantic knowledge layer |
| Citation management | Zotero | Best scholarly metadata/citation interoperability |
| Email | Thunderbird + best modern clients | Best offline communication + knowledge integration |
| Search | DEVONthink, Obsidian, enterprise search | Best local hybrid/provenance search |
| AI | local-AI products + grounded assistants | Best evidence-grounded private AI |
| Projects | Notion/Jira/Linear/Asana class | Best evidence-linked execution |
| Collaboration | modern CRDT/local-first systems | Best offline semantic collaboration |
| Mobile | best iOS/Android document apps | Feature parity without semantic downgrade |
| PDF production | Acrobat/Foxit/PDF Expert | Best fidelity, forms, signatures, redaction and export |
| Accessibility | Acrobat and platform accessibility | First-class accessible reading and authoring |
| Automation | DEVONthink/Obsidian/plugin ecosystems | Best auditable local automation |
| Interoperability | open document/research ecosystems | No vendor lock-in |
| Security/privacy | enterprise document systems + local-first | Local-first, auditable, cryptographically sound |

## PDF reader: zero-gap contract
The PDF reader is a first-class product, not merely a document surface.

### Rendering
- native high-fidelity PDF rendering;
- vector, raster, transparency, clipping and font fidelity;
- embedded font handling;
- CJK and complex-script shaping;
- annotations rendered correctly;
- malformed-PDF resilience;
- incremental rendering;
- tile caching;
- GPU acceleration where available;
- huge-page handling;
- 10,000+ page document navigation;
- low-memory mode;
- background prefetch;
- instant resume.

### Navigation
- page thumbnails;
- table of contents;
- named destinations;
- bookmarks;
- internal links;
- external links;
- back/forward navigation;
- last-position restoration;
- page labels;
- page number vs printed page number;
- section-aware navigation;
- search result navigation;
- annotation navigation;
- evidence navigation;
- synchronized multi-pane navigation.

### Reading modes
- page;
- continuous;
- single-page;
- two-page;
- two-page continuous;
- fit width;
- fit page;
- presentation;
- distraction-free;
- reflow/reading mode;
- article/section reading;
- column-aware reading;
- user font and text scale;
- line spacing;
- margins;
- themes;
- sepia;
- dark;
- high contrast;
- accessibility-focused options.

Zotero's 2026 Reading Mode establishes an important benchmark: reflowed PDF text must remain annotatable and maintain reading position with the original PDF view. e‑Vaarta should exceed that by preserving all annotation/evidence types and source geometry across both representations.

### Search
- instant full-text search;
- incremental search;
- case/word/regex modes;
- page/result previews;
- phrase search;
- metadata search;
- annotation search;
- evidence search;
- semantic search;
- hybrid lexical + semantic ranking;
- OCR search;
- search within selection;
- search within section;
- search across documents;
- search across workspace;
- search across projects;
- result highlighting;
- search history;
- saved searches.

### Selection and evidence
Every selection must be capable of becoming a highlight, quote, evidence card, claim, note, citation, task or graph/workspace object.

The selection must retain document identity, revision identity, page, page label, geometry, text, text offsets, structural path, nearby context, extraction confidence and provenance.

### Annotation
At minimum: highlight, underline, strikeout, freehand ink, text box, sticky note, shape, arrow, measurement, stamp, image, link, redaction, signature and custom annotation types.

Annotations must support author, timestamp, color, tags, comments, replies, evidence conversion, source navigation, revision anchoring, export/import, synchronization and conflict resolution.

Zotero demonstrates the value of database-backed annotations for efficient synchronization and conflict avoidance; e‑Vaarta should preserve that model while maintaining standards-compliant PDF export.

### Spatial reading
The reader must support a true LiquidText-class workspace: document beside workspace; drag-to-extract; multi-area selection; connected excerpts; free positioning; grouping; semantic edges; bidirectional source navigation; multi-document canvas; zoom-independent semantic objects; pen/ink; touch gestures.

### Accessibility
- keyboard-only operation;
- screen readers;
- logical reading order;
- reflow;
- adjustable text;
- high contrast;
- focus management;
- reduced motion;
- magnification;
- accessible forms;
- tagged-PDF awareness;
- accessible export.

### Forms
- AcroForm;
- XFA where technically/licensing appropriate;
- text fields;
- checkboxes;
- radio buttons;
- combo boxes;
- list boxes;
- signatures;
- calculations;
- validation;
- import/export form data;
- flattening;
- accessible tab order.

### Security
- password-protected PDFs;
- encrypted PDFs;
- certificate/signature validation;
- secure redaction;
- metadata removal;
- embedded-file inspection;
- JavaScript policy;
- malicious/malformed PDF isolation;
- safe external-link handling.

### Production
- print fidelity;
- rasterization control;
- PDF/A awareness;
- PDF/X awareness where appropriate;
- embedded fonts;
- metadata preservation;
- bookmarks;
- links;
- annotations;
- accessibility tags;
- incremental save;
- deterministic export.

## Evidence-to-action superlayer
This is where e‑Vaarta must go beyond every benchmark:

**PDF selection → evidence → claim → supporting/contradicting evidence → finding → decision → task → project → report → citation → communication**

Every object is provenance-aware and revision-aware.

## Acceptance rule
A class is not marked validated because a source module exists.

It becomes validated only after:
1. unit tests;
2. integration tests;
3. representative real documents;
4. malformed/adversarial documents;
5. performance tests;
6. accessibility tests;
7. cross-platform tests;
8. offline/restart tests;
9. import/export round-trip tests;
10. human acceptance against the strongest competitor.

## No artificial scope limitation
e‑Vaarta should not deliberately remain weak in PDF, email, notes, citations, document management, search, AI, projects, collaboration, mobile, accessibility or interoperability.

## Strategic principle
The end state is not a bundle of competing-product clones.

> **The best PDF reader + the best research workspace + the best document manager + the best knowledge graph + the best communication client + the best grounded AI + the best evidence-linked project system, sharing one offline-first semantic substrate.**