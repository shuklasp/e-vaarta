# Phase 70 — Portable workspace validation

Phase 70 turns the Phase 69 workspace contract into a regression-tested migration path.

## Desktop migration test

`mail/test/unit/test_evaartaPortableWorkspace.mjs` loads a version-2 portable workspace, passes it through the desktop migration layer, and verifies:

1. version 2 migrates to the current desktop model version (5);
2. evidence-group membership and document association survive migration;
3. missing evidence-group timestamps are normalized;
4. legacy source-anchor fields (`selector` and `rects`) are normalized;
5. canonical evidence queries return the expected evidence and group counts;
6. serialize → deserialize preserves evidence-group identity and membership.

Run it from the desktop source tree with the repository's Node test environment:

```text
node mail/test/unit/test_evaartaPortableWorkspace.mjs
```

## Cross-platform validation vector

The authoritative fixture remains `docs/fixtures/evaarta-workspace-v2.json`.

Expected semantic result for `doc-1`: 2 anchored evidence items, 1 excerpt, 1 annotation, 1 evidence group, page 2, with group members `excerpt-1` and `annotation-1`.

Android and iOS model consumers should preserve those fields when their storage/serialization layers are wired in.

## Compatibility rule

A workspace that predates evidence groups may omit `evidenceGroups`. Consumers must interpret that as an empty collection rather than failing to open the workspace.

The desktop migration additionally upgrades the model version and normalizes fields introduced by later desktop model revisions.

## Scope

This phase validates the semantic contract. It does not introduce a platform-specific serialization dependency on Android or iOS.