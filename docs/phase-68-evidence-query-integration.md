# Phase 68 — Canonical evidence query integration

Phase 68 integrates the canonical source-evidence query layer introduced in
Phase 67 into the desktop source navigator and establishes matching
UI-independent query helpers for Android and iOS.

## Desktop

The workspace now imports `EvaartaEvidenceNavigator.sys.mjs` and delegates
source evidence and source-group lookup to it. The desktop navigator therefore
uses the same deterministic ordering and filtering semantics as the portable
query contract.

## Android and iOS

Both clients now contain UI-independent `EvaartaEvidenceQueries` helpers.
They derive anchored excerpts and annotations directly from the workspace and
sort them by source page, source offset, and stable ID.

The mobile helpers intentionally do not persist a reverse source-to-evidence
index. This preserves the offline-first architecture and avoids synchronization
drift.

## Model compatibility

The existing mobile workspace model currently has a simpler evidence-group
representation than the desktop model. The query helpers therefore accept
optional group member IDs, allowing native UI code to constrain results without
requiring a duplicate index.

A later model-version migration can promote the full desktop evidence-group
object to the mobile persistence format without changing the query semantics.

## Result

All three clients now have a clear semantic boundary for source evidence:
workspace data remains canonical, query logic is deterministic, and
presentation remains client-specific.
