# e-Vaarta Validation Matrix

This matrix is the release truth for e-Vaarta. A capability is VALIDATED only when every applicable dimension has passing evidence. Source-level contracts never count as runtime validation.

## Validation dimensions

1. Unit — deterministic component tests.
2. Integration — real application workflow across subsystem boundaries.
3. Real data — representative production documents/messages/vaults.
4. Adversarial — malformed, hostile, corrupted, or conflicting inputs.
5. Performance — measured latency, memory, throughput, battery and scale.
6. Accessibility — keyboard, screen reader, reflow, contrast, focus and scaling.
7. Device/offline — restart, lifecycle, low-memory and disconnected operation.
8. Interoperability — import/export round trips and loss reports.
9. Human benchmark — controlled task comparison against the strongest relevant competitor.

## Current release matrix

| Area | Contract | Unit | Integration | Real data | Adversarial | Performance | Accessibility | Device/offline | Interoperability | Human benchmark |
|---|---|---|---|---|---|---|---|---|---|---|
| PDF | Implemented | Added | Pending | Pending | Pending | Pending | Pending | Pending | Pending | Pending |
| Research | Implemented | Added | Pending | Pending | Pending | Pending | Pending | Pending | Pending | Pending |
| Documents | Implemented | Existing/expanding | Pending | Pending | Pending | Pending | Pending | Pending | Pending | Pending |
| Search | Implemented | Added | Pending | Pending | Pending | Pending | Pending | Pending | Pending | Pending |
| Knowledge | Implemented | Existing/expanding | Pending | Pending | Pending | Pending | Pending | Pending | Pending | Pending |
| Citations | Implemented | Added | Pending | Pending | Pending | Pending | Pending | Pending | Pending | Pending |
| Communication | Implemented | Existing | Pending | Pending | Pending | Pending | Pending | Pending | Pending | Pending |
| AI | Implemented | Added | Pending | Pending | Pending | Pending | Pending | Pending | Pending | Pending |
| Projects | Implemented | Existing | Pending | Pending | Pending | Pending | Pending | Pending | Pending | Pending |
| Collaboration | Implemented | Added | Pending | Pending | Pending | Pending | Pending | Pending | Pending | Pending |
| Mobile | Implemented | Added | Pending | Pending | Pending | Pending | Pending | Pending | Pending | Pending |
| Accessibility | Implemented | Added | Pending | Pending | Pending | Pending | Pending | Pending | Pending | Pending |
| Automation | Implemented | Existing | Pending | Pending | Pending | Pending | Pending | Pending | Pending | Pending |
| Interoperability | Implemented | Added | Pending | Pending | Pending | Pending | Pending | Pending | Pending | Pending |
| Security | Implemented | Added | Pending | Pending | Pending | Pending | Pending | Pending | Pending | Pending |
| Semantic evidence/action | Implemented | Added | Pending | Pending | Pending | Pending | Pending | Pending | Pending | Pending |

## Machine-readable evidence contracts

Desktop now provides contracts for:
- release gates;
- benchmark cases/results;
- PDF fidelity;
- search quality;
- fault/recovery testing;
- security threat cases;
- interoperability round trips;
- accessibility workflows;
- the complete evidence-to-action benchmark.

Android and iOS now provide the shared release-gate and evidence-to-action models.

These contracts intentionally do not fabricate passing results. They provide the common structure required to collect reproducible evidence.

## Benchmark corpus

The production corpus must include ordinary, scanned, encrypted and malformed PDFs; CJK, Hindi/Sanskrit and Arabic/RTL documents; complex tables; vector graphics; forms; signed documents; huge documents; scholarly papers; books; reports; EML/MBOX/Maildir; Markdown vaults; concurrent/offline edits; camera scans; voice; OCR; low-memory lifecycle and process death.

## Human benchmark rule

For each product class, define a fixed task set and execute the same tasks in e-Vaarta and the strongest practical competitor. Record completion time, errors, recovery actions, discoverability and user-rated quality.

The benchmark must be versioned and reproducible. A benchmark result is evidence for a specific build, corpus and hardware configuration, not a permanent claim.

## Release rule

IMPLEMENTED means source-level implementation exists.

INTEGRATED means the capability works through the real application boundary.

VALIDATED means the applicable validation dimensions have passing evidence.

No release document may describe a capability as validated solely because a model, contract or test file exists.
