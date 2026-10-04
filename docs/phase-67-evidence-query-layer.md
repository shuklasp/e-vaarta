# Phase 67 — Canonical source-evidence query layer

Phase 67 extracts source-evidence navigation semantics into the UI-free
`EvaartaEvidenceNavigator.sys.mjs` module.

## Why this phase exists

Phase 66 introduced source-centric evidence browsing in the desktop workspace.
The navigator correctly derives its members from the canonical workspace, but
the query semantics were still embedded in the desktop presentation layer.

Phase 67 makes those semantics reusable across e-Vaarta clients without
introducing a second evidence index.

## API

- `getEvidenceForDocument(workspace, documentId, options)`
  - returns anchored excerpts and annotations for a source;
  - supports filtering by evidence kind, page, or evidence group;
  - returns deterministic source order: page, source offset, creation time, ID.
- `getEvidenceGroupsForDocument(workspace, documentId)`
  - derives source-relevant groups from their canonical `itemIds`;
  - reports the number of members from the requested source.
- `getEvidenceSummary(workspace, documentId)`
  - returns counts and the distinct source pages used by the evidence.

## Consistency rule

No reverse source-to-evidence index is persisted. Every result is derived from
`workspace.items` and `workspace.evidenceGroups`. Adding, editing, moving,
or removing evidence therefore changes query results immediately after the
workspace state changes.

## Client strategy

Desktop can use these functions directly from the workspace navigator.
Android and iOS can mirror the same data contract in their native presentation
layers. The module deliberately contains no DOM, Thunderbird window, or UI
dependencies.
