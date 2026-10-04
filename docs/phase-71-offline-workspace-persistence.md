# Phase 71 — Offline workspace persistence contract

Phase 71 defines the storage-neutral envelope used to persist e-Vaarta workspaces safely while offline.

## Record envelope

Each local snapshot contains:

- `persistenceVersion` — persistence-envelope schema version;
- `workspaceId` — stable workspace identity;
- `revision` — monotonically increasing local revision;
- `writerId` — client/device writer identity;
- `writtenAt` — snapshot timestamp;
- `checksum` — deterministic payload fingerprint;
- `workspace` — the semantic e-Vaarta workspace.

## Atomic-write rule

A new record may replace the current record only when its revision is exactly `current.revision + 1`. A lower or equal revision is a conflict. A revision gap is rejected because it indicates a missing local state transition.

Storage engines should write the new record to a temporary location, verify it, then atomically replace the previous record. Recovery should retain the previous valid snapshot until replacement succeeds.

## Conflict rule

Phase 71 deliberately does not silently merge concurrent workspaces. A stale writer produces `CONFLICT`; a later synchronization layer can then perform semantic three-way merging using workspace entities and stable IDs.

## Platform contracts

Desktop implements the complete validation/classification helper in `EvaartaWorkspacePersistence.sys.mjs`. Android and iOS expose storage-neutral `EvaartaWorkspaceRecord` types so their local stores can adopt the same envelope without coupling the semantic model to a specific database.

## Offline-first consequence

The semantic workspace remains fully usable without network access. Network synchronization is an optional transport applied to persisted revisions, not a prerequisite for reading or editing local work.

## Scope

This phase establishes the durable snapshot protocol and conflict boundary. The next phase can bind the protocol to actual local files/databases and implement crash-safe recovery.