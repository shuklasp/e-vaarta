# e-Vaarta phases 403–452 — End-to-End Runtime

This release train completes the runtime orchestration layer between native transports and the distributed project protocol.

## Phase groups
- 403–406: versioned runtime message envelope and validation
- 407–410: manifest exchange and signed-event acceptance
- 411–414: transport selection and capability policy
- 415–418: offline retry, exponential backoff, and dead-letter handling
- 419–422: attachment resume/checkpoint/missing-chunk calculation
- 423–426: peer revocation propagation and runtime rejection
- 427–430: runtime conflict reconciliation boundary
- 431–434: email envelope integration boundary
- 435–438: native runtime pipeline integration
- 439–442: delivery/receipt integration
- 443–446: replay and duplicate-event handling
- 447–450: cross-platform runtime tests and documentation
- 451–452: release-readiness contract

## Runtime flow
discover -> pair -> authenticate -> trust check -> capability check -> select transport -> create signed/encrypted envelope -> transmit -> receipt -> journal -> manifest reconciliation -> retry/attachment resume when needed

Discovery only identifies candidates. Cryptographic identity, authorization, replay protection, and revocation remain mandatory.

## Offline behavior
Failed transmissions remain queued. Retry attempts use bounded exponential backoff and eventually enter a dead-letter state rather than retrying indefinitely.

Attachment transfers are resumable by chunk index, so interruption does not require restarting the complete object.

## Email
Email is represented as a transport carrying application/evaarta+json envelopes. The project protocol remains independent of Thunderbird's mail implementation.

## Messaging providers
WhatsApp and Arattai remain optional transport adapters. No undocumented endpoint, scraping mechanism, UI automation, or fabricated credential is introduced.

## Security
- Cryptographic identity remains separate from email identity.
- Signed events are required at the runtime acceptance boundary.
- Trusted-peer status is checked before synchronization.
- Revoked peers are rejected.
- Duplicate event IDs are suppressed by the replay guard.
- Transport frames are bounded.
- Attachments are transferred separately from protocol metadata.
- Project data remains inside the encrypted/signed e-Vaarta envelope.

## Verification
Unit-level runtime and attachment-resume coverage has been added across platforms. Native Windows, Android, and iOS builds plus physical-device interoperability testing remain release-validation work and are not represented as passed by this branch.