# e-Vaarta Validation Matrix

| Area | Contract | Unit | Integration | Real data | Adversarial | Performance | Accessibility | Device/offline | Human benchmark |
|---|---|---|---|---|---|---|---|---|---|
| PDF | Implemented | Added | Pending | Pending | Pending | Pending | Pending | Pending | Pending |
| Research | Implemented | Added | Pending | Pending | Pending | Pending | Pending | Pending | Pending |
| Citations | Implemented | Added | Pending | Pending | Pending | Pending | Pending | Pending | Pending |
| Markdown/knowledge | Implemented | Added | Pending | Pending | Pending | Pending | Pending | Pending | Pending |
| Local AI | Implemented | Added | Pending | Pending | Pending | Pending | Pending | Pending | Pending |
| Semantic collaboration | Implemented | Added | Pending | Pending | Pending | Pending | Pending | Pending | Pending |
| Mobile capture | Implemented | Added | Pending | Pending | Pending | Pending | Pending | Pending | Pending |

## Release gate

The status of a product class may be raised to validated only after every applicable column is satisfied. Source-level implementation alone never changes that status.

## Required benchmark corpus

The eventual validation suite should include:
- ordinary text PDFs;
- scanned/OCR PDFs;
- malformed and encrypted PDFs;
- CJK and right-to-left documents;
- complex scholarly papers;
- large multi-document research sets;
- DOCX/PPTX/XLSX imports;
- BibTeX/RIS/CSL records;
- Markdown vaults with backlinks and properties;
- offline edits from multiple devices;
- conflicting semantic edits;
- audio and camera captures;
- accessibility test documents.

Results should record exact versions, hardware, corpus identifiers, timings, memory use, failures and screenshots/video for human UX comparisons.
