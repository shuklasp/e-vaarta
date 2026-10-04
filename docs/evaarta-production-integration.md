# e-Vaarta Production Integration

The production integration layer converts the semantic architecture into executable product boundaries.

## Product rule
The semantic store is canonical. UI surfaces are projections. External providers are adapters. Credentials and cryptographic material never belong in semantic message/document objects.

## Communication
Provider adapters cover email, SMS/RCS, Matrix, Telegram, WhatsApp, Slack and Teams. The adapter boundary normalizes inbound messages and creates outbound requests while preserving provider provenance and idempotency. Actual credentials, OAuth flows, API calls, retries and rate-limit handling remain deployment/runtime work.

## Calendar and meetings
CalDAV, Exchange, Google and local calendar providers use a common adapter contract. Free/busy results are normalized and merged locally. Meeting objects remain linked to conversations, attendees, evidence, decisions and tasks.

## Security
Security decisions fail closed. Credential references contain only identifiers, never secret material. External content is untrusted by default. Actions are capability-authorized and auditable. Legal hold prevents secure deletion even when retention has expired.

## UI integration
Required projections are Unified Inbox, Conversation, Person, Meeting, Evidence, Task, Project and Report. Each projection carries stable semantic IDs and source IDs so navigation does not depend on UI-local identity.

## Offline behavior
Outbound communication is queued as semantic events. Reconciliation is idempotent and conflict-aware. Reconnect must not create duplicate sends or silently overwrite semantic state.

## Validation
The repository contains an explicit end-to-end validation plan covering offline send/reconnect, provider round-trip, calendar RSVP, credential isolation, power-loss recovery, accessibility and large-mailbox performance.

## Release truth
Source-level integration contracts are implemented. A capability becomes validated only after native builds, real provider sandbox tests, physical-device testing where applicable, security testing, performance measurements and human accessibility evidence are attached to release gates.
