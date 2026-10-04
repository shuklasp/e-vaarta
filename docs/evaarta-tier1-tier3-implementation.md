# e-Vaarta Tier 1–3 Implementation Pass

## Scope

This pass implements the shared production-runtime boundary for the previously defined Tier 1, Tier 2 and Tier 3 roadmap. It does not falsely convert platform contracts into runtime validation: platform-native adapters remain explicit dependencies.

## Tier 1 — production foundations

The runtime now exposes explicit adapters for:

- high-fidelity PDF reading and production;
- forms, redaction, signing and export through the PDF production boundary;
- local/hybrid AI through the AI boundary;
- offline collaboration and deterministic synchronization through the collaboration boundary;
- Android/iOS capture and document workflows through the mobile boundary;
- security and secure transport/storage boundaries.

An operation cannot be invoked through the runtime without an adapter explicitly binding that operation. This prevents accidental fallback to an unimplemented or unsafe capability.

## Tier 2 — specialist parity

The same runtime plan covers:

- LiquidText-class research interaction;
- hybrid/semantic/OCR/evidence search;
- DEVONthink-class document management;
- Obsidian-class knowledge authoring;
- Zotero-class scholarly citation workflows;
- Linear/Jira-class project execution;
- accessibility;
- interoperability;
- auditable automation.

The underlying product modules already define the data contracts; the production runtime is the common execution boundary.

## Tier 3 — e-Vaarta differentiation

The canonical semantic chain remains:

**Communication → Document → Evidence → Claim → Finding → Decision → Task → Project → Report → Citation → Communication output**

The runtime provides a trace builder for this chain. Each downstream object is required to carry a provenance relationship to the preceding object or its source evidence.

The semantic graph remains the authoritative representation for cross-feature links. No feature-specific UI is allowed to invent a parallel semantic identity system.

## Cross-platform rule

Desktop, Android and iOS expose the same Tier 1/2/3 capability taxonomy. Platform-specific implementations may differ, but the semantic model and capability names remain stable.

## Runtime maturity rule

A capability is:

1. **contracted** when its data/API boundary exists;
2. **implemented** when its portable implementation exists;
3. **integrated** only after the native platform adapter is connected;
4. **validated** only after the applicable release-gate evidence passes.

This pass adds implementation and enforcement boundaries. It does **not** claim native PDF-engine, physical-device, local-model, encrypted-transport, accessibility-device, or adversarial validation has been executed.

## Remaining execution work

The next work is therefore integration, not another architecture-expansion cycle:

- bind the desktop native PDF engine and production engine;
- bind real local model runtimes and embedding stores;
- connect durable encrypted sync transports;
- connect Android/iOS lifecycle, camera, share-sheet, stylus and PDF implementations;
- run representative and adversarial corpora;
- collect performance, accessibility, interoperability and recovery evidence;
- run reproducible human benchmarks against the declared leaders;
- execute the complete evidence-to-action benchmark.

No 1.0 claim should be made until those release gates pass.
