# Phase 69 — Evidence-group model parity

Phase 69 aligns the portable e-Vaarta workspace models with the desktop evidence-group semantics.

## Cross-platform contract

An evidence group contains `id`, `name`, `description`, optional `documentId`, and `itemIds` referencing workspace excerpts and annotations.

Group membership is authoritative through `itemIds`. A source-specific evidence query includes a group when at least one member resolves to the requested document. The optional `documentId` is metadata and is not used as a cached reverse index.

## Desktop

Desktop remains the reference model at document model version 5. Its existing migration logic accepts older workspaces and normalizes missing evidence-group fields.

## Android

`DocumentWorkspace` is now model version 2 and includes `evidenceGroups`. `EvaartaEvidenceQueries.summary()` derives `groupCount` from actual anchored evidence membership.

## iOS

`EvaartaDocumentWorkspace` is now model version 2 and includes `evidenceGroups`. Its Codable implementation accepts older JSON that has no `modelVersion` or `evidenceGroups`, defaulting to version 1 and an empty group list. Encoding includes the current model version and group collection.

## Portable fixture

The accompanying fixture in `docs/fixtures/evaarta-workspace-v2.json` demonstrates the shared semantic shape. Desktop can migrate the version-2 fixture to its current model; mobile clients can consume the same evidence-group fields.

## Deliberate scope

This phase establishes **model parity and a stable portable JSON contract**. Android does not introduce a second persistence/serialization framework merely for this model; its data classes remain UI- and storage-layer neutral.
