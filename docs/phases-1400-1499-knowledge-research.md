# Phases 1400–1499 — Knowledge, research and citation suite

## 1400–1410 — Hybrid search
- SQLite FTS5 lexical index where available.
- Token normalization and language-aware matching.
- Metadata filters.
- Provenance-aware result ranking.
- Optional local vector index.
- Reciprocal-rank or weighted lexical/vector fusion.
- Search snippets with source anchors.

## 1411–1420 — Knowledge graph
- Backlinks.
- Block references.
- Aliases.
- Transclusion.
- Typed claims and findings.
- Evidence lineage.
- Contradiction and qualification edges.
- Graph neighborhood search.

## 1421–1430 — Scholarly workflow
- DOI/ISBN metadata lookup adapters.
- BibTeX, RIS and CSL-JSON import/export.
- Citation keys and stable source IDs.
- Bibliography generation.
- Citation insertion into reports.
- Literature matrix.
- Duplicate bibliographic record detection.

External metadata is optional. A project remains usable without network access.

## 1431–1440 — Smart filing
- Rules over metadata, content and provenance.
- Smart collections.
- Automatic classification suggestions.
- Duplicate and near-duplicate detection.
- Aliases without binary duplication.
- Metadata templates.
- Rule simulation before applying changes.

## 1441–1450 — AI foundation
- Provider-neutral model interface.
- Local-only provider.
- Remote provider with explicit user consent.
- Retrieval interface returning source IDs and anchors.
- Grounded answer object containing claims and supporting evidence.
- Confidence and unsupported-claim reporting.

## 1451–1460 — Research AI
- Summarize selected evidence.
- Compare sources.
- Extract claims.
- Detect contradictions.
- Identify missing evidence.
- Generate research questions.
- Build literature matrices.
- Never silently convert generated text into authoritative evidence.

## 1461–1470 — Document and email AI
- Thread summarization.
- Action-item extraction.
- Deadline extraction.
- Attachment classification.
- Document summary.
- Revision summary.
- Structured finding/decision/task extraction.
- Every generated item records provenance to the source operation.

## 1471–1480 — Controlled agents
Agents operate through explicit tools:
- search;
- read;
- capture;
- annotate;
- create claim/finding/decision/task;
- create report;
- schedule;
- send only when the user explicitly authorizes sending.

Permissions are capability-based and auditable. No UI scraping, reverse engineering or hidden provider automation.

## 1481–1490 — Media and meetings
- Audio/video metadata.
- Local transcription adapter.
- Speaker/segment provenance.
- Meeting summary.
- Decisions and action items linked to transcript ranges.
- Media-to-evidence anchors.

## 1491–1499 — Research acceptance
A complete research project must be able to move from source → evidence → claim → finding → decision → task → cited report, entirely offline when all required content and local AI/indexing providers are available.
