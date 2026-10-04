# e-Vaarta production-readiness gate

The repository contains a substantial semantic implementation, but source-level implementation is not equivalent to a shippable application. This gate prevents premature release claims.

## Required before 1.0

### Desktop
- Build from clean Windows and Linux environments.
- Native PDF rendering and annotation validation.
- Real Thunderbird mail database integration.
- Large mailbox import/index.
- Offline reopen after forced termination.
- Crash/power-loss recovery.
- 100+ page PDFs and large attachments.
- Memory and latency profiling.

### Android
- Physical-device build.
- Offline vault persistence.
- PDF rendering/selection.
- Camera/OCR integration.
- Touch/pen interaction where supported.
- Background ingestion under OS lifecycle restrictions.
- Semantic model round-trip with desktop.

### iOS
- Physical-device build.
- Offline vault persistence.
- PDF rendering/selection.
- Share-sheet/document-provider integration.
- Background processing where permitted.
- Semantic model round-trip with desktop.

### Security
- Threat model reviewed.
- Cryptographic provider review.
- Key lifecycle and revocation tested.
- Malformed PDF/document fuzzing.
- IPC and deep-link validation.
- No plaintext fallback.
- Dependency and supply-chain review.

### End-to-end
Run the canonical workflow:

`100-page contract + 20 emails + 5 attachments + 3 revisions`

and verify:
1. import;
2. indexing;
3. read;
4. annotation;
5. evidence capture;
6. grouping;
7. graph relationships;
8. revision comparison;
9. contradiction detection;
10. finding;
11. decision;
12. tasks;
13. project status;
14. cited report;
15. offline close/reopen;
16. synchronization;
17. conflict handling;
18. restore from backup.

## Release-status rule

The release dashboard must expose separate columns for **source implemented**, **unit-tested**, **integrated**, and **runtime validated**. Passing a unit test cannot advance a capability directly to runtime-validated.

## Product identity

All user-facing documentation, help, branding, installer/update/error surfaces and deep-link labels must identify the product as e-Vaarta. Thunderbird ancestry remains an engineering/legal provenance concern, not the product UX.
