# e-Vaarta

**e-Vaarta** is a privacy-focused, open-source communication, document, evidence, knowledge and execution workspace built around an offline-first semantic architecture.

The project builds on the mature Mozilla mail application architecture while developing an independent e-Vaarta identity, user experience, document/research stack, offline workspace, integrations, and release process.

> **e-Vaarta — communication to evidence, knowledge, decisions and action.**

## Product target

e-Vaarta is explicitly designed to be **best-in-class in every major product class it enters**, not merely broader than its competitors.

That means independently benchmarking and ultimately exceeding the strongest practical products in:

- PDF reading, rendering and production
- LiquidText-class research reading and spatial extraction
- DEVONthink-class document management and automation
- Obsidian-class knowledge authoring and graph workflows
- Zotero-class scholarly metadata and citation workflows
- Thunderbird-class communication
- hybrid and semantic search
- private grounded AI
- project and task execution
- offline collaboration
- desktop and mobile document workflows
- accessibility
- security and privacy
- interoperability

The strategic differentiator is the unified semantic chain:

**Communication → Document → Evidence → Claim → Finding → Decision → Task → Project → Report → Citation → Communication**

## Project identity

e-Vaarta is the product name used in the application, documentation, builds, installers, and release materials.

The product-facing documentation and branding in this repository are maintained for e-Vaarta. References to Mozilla or Thunderbird are retained only where they describe upstream technology, inherited architecture, licensing, compatibility, or historical design decisions.

## Development

The desktop client targets Windows, macOS, and Linux.

Start with the e-Vaarta source documentation and build guide in the docs directory.

### Upstream technology

e-Vaarta uses the Mozilla platform and inherits substantial mail-client architecture from the Thunderbird project. Upstream Mozilla/Thunderbird documentation can therefore be useful when working on inherited subsystems, but e-Vaarta documentation is authoritative for e-Vaarta-specific behavior and product decisions.

### Licensing

This repository contains substantial code originating from the Mozilla/Thunderbird project as well as e-Vaarta-specific work. Consult the repository license files and source-file notices for the applicable terms.

## Capability and production contracts

The implementation status and acceptance contracts are maintained in:

- [Feature Contract](docs/evaarta-feature-contract-v1.md)
- [Best-in-Class Product Contract](docs/evaarta-best-in-class-contract.md)
- [LiquidText-class research workspace](docs/phases-1311-1399-liquidtext-parity.md)
- [Knowledge, research and citation suite](docs/phases-1400-1499-knowledge-research.md)
- [Execution, collaboration and security](docs/phases-1500-1599-execution-collaboration-security.md)
- [Production readiness gate](docs/production-readiness.md)

The capability registry deliberately distinguishes **contracted → implemented → integrated → validated**. A semantic primitive is not presented as a production feature until its native integration and acceptance testing are complete.
