# e-Vaarta Integrated Product Architecture

e-Vaarta is organized as one offline-first workspace over a shared semantic graph.

## Workspace flow
Communication → Document → Evidence → Claim → Finding → Decision → Task → Project → Report → Citation → Communication.

## Product shell
The workspace shell provides stable routes for Inbox, Conversation, Person, Document, Evidence, Meeting, Decision, Task, Project, Report and Citation. Views are projections over semantic state; they do not own a second data model.

## Production boundaries
Provider transport, calendar transport, credentials, capability authorization, security policy, synchronization, local AI, interoperability, governance and release engineering are explicit boundaries. Provider secrets are referenced rather than embedded in semantic objects.

## Offline-first behavior
Every consequential operation has a durable local representation. Synchronization uses event identity and deterministic conflict detection rather than unsafe last-writer-wins behavior.

## Evidence and AI
AI requests carry source identifiers and explicit permissions. Grounded responses must retain citation relationships. Actions require an authorization capability distinct from read access.

## Interoperability
Import/export plans preserve provenance and report conversion loss. Supported interchange families include EML/mbox/maildir, PDF/PDF-A, Office documents, Markdown/HTML, ICS/vCard, BibTeX/RIS/CSL-JSON and e-Vaarta JSON.

## Governance
Retention, legal hold, classification, role restrictions and audit events are represented as executable policy decisions.

## Release boundary
Release manifests can record build, SBOM, provenance, signature, migration and rollback artifacts. Readiness is evidence-driven.

## Validation status
These modules establish source-level architecture and contracts. Native builds, provider credentials, real transport behavior, device lifecycle, accessibility assistive-technology testing, performance, security testing and production interoperability still require execution in their target environments.
