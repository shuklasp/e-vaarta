# e-Vaarta Benchmark Corpus Specification

This specification defines the corpus that must be assembled before a production 1.0 validation claim.

## Corpus identifiers

- PDF-TEXT-V1 — ordinary born-digital PDFs
- PDF-SCAN-V1 — scanned/OCR PDFs
- PDF-ADVERSARIAL-V1 — malformed, encrypted and hostile PDFs
- PDF-SCRIPT-V1 — Hindi, Sanskrit, CJK, Arabic/RTL and mixed scripts
- PDF-LARGE-V1 — 1,000 to 10,000+ page documents
- PDF-FORM-V1 — AcroForm and accessible forms
- PDF-SIGNED-V1 — signed documents and tampered variants
- RESEARCH-V1 — scholarly papers, books and reports
- OFFICE-V1 — DOCX/PPTX/XLSX representative files
- MAIL-V1 — EML/MBOX/Maildir and HTML conversations
- KNOWLEDGE-V1 — Markdown vaults with links, properties, Canvas and block references
- COLLAB-V1 — offline/concurrent/conflicting semantic edits
- MOBILE-V1 — camera, scan, voice and lifecycle fixtures
- ACCESSIBILITY-V1 — keyboard, screen-reader, reflow and scaling workflows

## Required metadata

Every fixture must record:

- corpus identifier;
- fixture identifier;
- source format;
- source checksum;
- licensing/usage status;
- expected properties;
- known edge cases;
- expected interoperability loss, if any;
- sensitivity classification.

## Result metadata

Every benchmark result must record:

- e-Vaarta build/version;
- competitor name and version, where applicable;
- operating system;
- hardware;
- memory;
- corpus/fixture identifier;
- test date;
- elapsed time;
- memory consumption;
- battery impact for mobile tests;
- pass/fail;
- failure details;
- screenshot/video reference for human UX tests.

## Benchmark discipline

Fixtures must remain immutable after a benchmark version is published. Changes create a new corpus version.

Human benchmark tasks must be scripted before execution and must not be changed to favor e-Vaarta after results are observed.

Security fixtures must never be distributed outside the controlled test environment.

## Minimum end-to-end corpus

At least one fixture must support this complete trace:

Communication -> Document -> Evidence -> Claim -> Finding -> Decision -> Task -> Project -> Report -> Citation -> Communication output

The trace must survive save, restart, offline operation, export/import and re-open without loss of provenance.
