# e-Vaarta Feature Contract v1

This document is the authoritative product-level acceptance contract for the e-Vaarta communication → documents → evidence → knowledge → decisions → tasks → projects workflow.

## Status vocabulary

- **implemented** — source code exists in the repository and has focused regression coverage.
- **contracted** — the cross-platform semantic/API contract exists, but one or more platform runtime integrations are still required.
- **integrated** — wired into the product surface and verified on the target platform.
- **validated** — integrated and exercised in the end-to-end acceptance suite on physical or production-like environments.
- **planned** — intentionally specified but not yet implemented.

A feature must never be described as validated merely because a data model or fixture exists.

## Core product invariant

Source documents are immutable evidence. User knowledge is a separate semantic layer. Graph relationships are authoritative; canvas coordinates are presentation state. Synchronization operates on semantic events and never requires mutating the original evidence binary.

## Capability matrix

| Capability | Current contract | Production gate |
|---|---|---|
| Document workspace | implemented | integrated |
| Source anchors | implemented | PDF/Office runtime validation |
| Highlights/annotations | implemented | native renderer validation |
| Evidence groups | implemented | cross-platform UI validation |
| Evidence navigation | implemented | physical-device validation |
| Offline workspace persistence | implemented | crash/power-loss testing |
| Crash-safe recovery | implemented | filesystem fault testing |
| Local vault/content addressing | contracted | large-vault performance testing |
| Incremental indexing | contracted | real mail/PDF/Office corpus |
| OCR | contracted | native OCR backend validation |
| Infinite spatial canvas | contracted | touch/pen performance suite |
| Fluid extraction | contracted | multi-document interaction suite |
| Multi-document reader | contracted | 100+ page / 10+ document suite |
| Document comparison | contracted | revision/large-PDF suite |
| Semantic search | contracted | hybrid FTS/vector benchmark |
| Claims/findings/decisions/tasks | implemented | end-to-end workflow validation |
| Research matrix | implemented/contracted | scholarly corpus validation |
| Citation management | contracted | CSL/BibTeX/RIS interoperability |
| Smart filing/rules | contracted | automation regression suite |
| Markdown/block knowledge | contracted | vault interoperability suite |
| Grounded AI | contracted | source-attribution and hallucination suite |
| Controlled agents | contracted | permission/sandbox/audit suite |
| Offline collaboration | contracted | multi-device partition/rejoin suite |
| Secure synchronization | contracted | crypto/provider/security review |
| Browser capture | contracted | browser integration validation |
| Calendar | contracted | ICS/provider validation |
| Contacts/people graph | contracted | privacy and identity validation |
| Audio/video/meeting intelligence | contracted | transcription/media corpus |
| Accessibility | contracted | keyboard/screen-reader/mobile suite |
| i18n | contracted | English/Hindi/Sanskrit/regional QA |
| Plugin API | contracted | compatibility/security suite |
| Enterprise governance | contracted | retention/audit/deployment validation |

## Non-negotiable acceptance workflow

A production release must support:

`100-page contract + 20 emails + 5 attachments + 3 revisions`

Import → read → annotate → capture evidence → compare revisions → group evidence → connect evidence → detect contradictions → create finding → make decision → create tasks → track project → generate cited report → work offline → close/reopen → synchronize without losing semantic history.

## Regression rule

Adding a feature must not remove or weaken:
1. offline operation;
2. source provenance;
3. deterministic semantic serialization;
4. cross-platform model compatibility;
5. accessibility;
6. secure transport boundaries;
7. e-Vaarta branding/product identity.
