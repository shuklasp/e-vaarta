# e-Vaarta

**e-Vaarta** is a privacy-focused, open-source email and personal information client for desktop, with a strong local/offline-first product direction.

The project builds on the mature Mozilla mail application architecture while developing an independent e-Vaarta identity, user experience, offline workspace, integrations, and release process.

> **e-Vaarta — modern, secure and dependable communication.**

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

## e-Vaarta capability and production roadmap

The implementation status and acceptance contract are maintained in:

- [Feature Contract](docs/evaarta-feature-contract-v1.md)
- [LiquidText-class research workspace](docs/phases-1311-1399-liquidtext-parity.md)
- [Knowledge, research and citation suite](docs/phases-1400-1499-knowledge-research.md)
- [Execution, collaboration and security](docs/phases-1500-1599-execution-collaboration-security.md)
- [Production readiness gate](docs/production-readiness.md)

These documents deliberately distinguish semantic implementation from platform integration and runtime validation.
