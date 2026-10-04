# Phase 72 — Crash-Safe Local Workspace Persistence

Phase 72 binds the Phase 71 persistence envelope to durable local storage on all
three e-Vaarta clients.

## Storage contract

Each workspace has:

- a primary snapshot: \`<workspace>.json\`
- a last-known-good backup: \`<workspace>.json.bak\`
- a transient write file: \`<workspace>.json.tmp\`

The persisted payload is the Phase 71 \`EvaartaWorkspaceRecord\`, including
revision and checksum.

## Write protocol

1. Ensure the local workspace directory exists.
2. Read the current valid primary snapshot, falling back to the backup.
3. Create the next revision and classify the write.
4. Reject stale revisions and revision gaps.
5. Write the new snapshot to a temporary file.
6. Flush/sync the temporary data where the platform permits.
7. Preserve the previous primary as \`.bak\`.
8. Commit the temporary snapshot as the new primary.

A failure during steps 7–8 leaves a previous valid snapshot available for
recovery. A partial temporary file is never treated as a committed workspace.

## Recovery

Load always validates the persistence envelope and checksum before accepting a
snapshot.

- valid primary -> use primary
- corrupt/missing primary + valid backup -> use backup
- corrupt/missing primary + corrupt/missing backup -> fail explicitly

The explicit failure is intentional: e-Vaarta must not silently construct a
new empty workspace and hide local data loss.

## Platform implementations

### Desktop

\`mail/modules/EvaartaWorkspaceStore.sys.mjs\` uses Thunderbird's local
\`IOUtils\`/ \`PathUtils\` APIs. The implementation is dependency-injectable
for unit tests and uses atomic writes with backup preservation.

### Android

\`EvaartaWorkspaceFileStore.kt\` uses the application's private files
directory, synchronous file writes, a temporary snapshot, and a backup
snapshot. Serialization is supplied through a small codec interface so the
store does not introduce a new JSON dependency.

### iOS

\`EvaartaWorkspaceFileStore.swift\` uses Application Support, Codable,
atomic temporary writes, and a retained backup snapshot. No network or cloud
store is required.

## Offline-first consequence

Workspace persistence is now local and durable before synchronization is
introduced. Network availability is not part of the save/load path.

Phase 73 can build higher-level workspace repositories and UI flows on this
contract without changing the underlying crash-recovery semantics.
