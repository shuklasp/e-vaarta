# e-Vaarta Next-Phase Architecture

## Purpose

This phase closes the architectural gaps identified in the Acrobat, LiquidText, Zotero, Obsidian, DEVONthink, local-first collaboration, mobile and private-AI comparison.

The implementation rule is deliberate: shared semantic contracts are implemented first; native engines and device integrations consume those contracts.

## Implemented in this phase

| Capability | Desktop contract | Android/iOS parity | Runtime status |
|---|---|---|---|
| PDF production | EvaartaPdfProduction | shared advanced contract | Contract implemented; native engine remains integration work |
| Research interaction | EvaartaResearchInteraction | shared advanced contract | Semantic interaction model implemented |
| Scholarly citations | EvaartaScholarlyCitations | shared record contract | Metadata/citation model implemented; full CSL engine remains integration work |
| Markdown vault | EvaartaMarkdownVault | shared document contract | Local model implemented; filesystem/vault UI remains integration work |
| Private/local AI | EvaartaLocalAI | shared provider/request contract | Provider boundary implemented; model runtime remains integration work |
| Semantic collaboration | EvaartaSemanticCollaboration | shared event/conflict contract | Event/conflict model implemented; transport/CRDT runtime remains integration work |
| Mobile capture | EvaartaMobileCapture | shared capture contract | Intake model implemented; camera/voice/OCR integration remains device work |

## Canonical flow

Communication -> Document -> Evidence -> Claim -> Finding -> Decision -> Task -> Project -> Report -> Citation -> Communication

New phase components must preserve stable IDs, source provenance and revision identity when moving through this chain.

## Acceptance

A capability is not considered best-in-class merely because its contract exists. Acceptance requires unit tests, integration tests, representative real documents, adversarial inputs, performance tests, accessibility tests, offline/restart tests, round-trip interoperability tests and human comparison with the strongest competing product.

This repository currently contains the contract and unit-test layer for this phase. Native/runtime/device validation must be performed in the respective build environments.
