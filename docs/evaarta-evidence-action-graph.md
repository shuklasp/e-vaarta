# e‑Vaarta Evidence-to-Action Semantic Graph

The semantic graph is the canonical cross-platform contract for the product's differentiating workflow:

**Communication → Document → Evidence → Claim → Finding → Decision → Task → Project → Report → Citation → Communication**

## Invariants

- Every semantic object has a stable identifier and explicit type.
- Evidence-bearing objects retain source and revision provenance.
- Edges are typed; arbitrary untyped links are not part of the canonical model.
- An edge may carry evidence IDs so decisions and actions can remain auditable.
- Graph validation rejects duplicate nodes, unknown endpoints, unsupported types and self-links.
- Desktop, Android and iOS may use platform-native storage/UI, but must preserve these semantics.

## Why this matters

This layer turns e‑Vaarta from a collection of strong applications into one evidence system. A highlighted sentence can remain traceable when it becomes a claim, finding, decision, task, project item, report statement or outgoing communication.

The graph is intentionally renderer- and storage-neutral. It is a semantic contract, not a UI implementation.
