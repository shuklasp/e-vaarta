# e-Vaarta Universal Artifact & Evidence Lifecycle

e-Vaarta treats attachments as reusable semantic artifacts rather than task-local copies.

## Model

`Artifact` is a stable, content-addressed object. Tasks, messages, documents, evidence, decisions and projects reference it through typed links.

```
Artifact
 ├── Task A
 ├── Task B
 ├── Evidence
 ├── Document
 └── Communication
```

A single photograph, email, PDF, message, note, or other file can therefore participate in multiple workflows without uncontrolled duplication.

## Capabilities

- Stable artifact identity and content hashes.
- Artifact revisions with explicit provenance.
- Typed links: attachment, reference, evidence, derived-from and generated-from.
- Reuse across multiple tasks and projects.
- Forward selected artifacts from one task to another.
- Share selected artifacts into communications.
- Create evidence references without copying content.
- Security classification and external-sharing policy evaluation.
- Quarantine/block states inherited from attachment intelligence.
- Provenance and usage summaries.
- Offline-first semantic state; transport delivery remains provider-specific.
- Explicitly no implicit duplication.

## Example lifecycle

```
Incoming email
   ↓
Artifact(s)
   ↓
Task: Inspect
   ↓
Evidence
   ↓
Task: Procure
   ↓
Email / Teams / Matrix message
   ↓
Report
```

## Revision semantics

References point to a specific revision when a revision is selected. A later revision does not silently rewrite an existing evidence trail.

## Security

Restricted/quarantined/blocked artifacts cannot be silently shared. Confidential external sharing produces a warning; policy can require approval.

## Production boundary

This module defines the canonical semantic lifecycle. Native filesystem/vault persistence, provider upload APIs, OS share sheets, encryption, malware scanning, and physical-device behavior remain integration/runtime validation gates.
