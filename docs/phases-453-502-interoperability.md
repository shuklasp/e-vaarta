# e-Vaarta phases 453–502 — Cross-Platform Interoperability

This release train moves from runtime contracts to interoperable wire behavior.

## 453–462: Wire protocol
A canonical JSON wire representation is introduced for runtime messages. Binary transport framing remains platform-specific, while the payload representation is portable.

## 463–472: Authenticated encrypted payloads
The desktop runtime now has an explicit encrypted-session payload boundary. Platform-native cryptographic implementations remain responsible for key material and primitive selection.

## 473–482: Receive path
Incoming runtime messages are validated, tied to an authenticated session, checked against trust/replay state, and routed by message type.

## 483–492: Project synchronization
A coordinator calculates remote event IDs missing locally and provides an application boundary for applying remote events.

## 493–498: Attachment resume
Attachment acknowledgements identify received chunk indices. Interrupted transfers can request only missing chunks.

## 499–502: Cross-platform fixtures
A canonical project/event/attachment fixture is included for desktop, Android, and iOS interoperability testing.

## Security invariants

1. Discovery is never authorization.
2. A peer must be trusted before project synchronization.
3. Runtime messages require a valid protocol version.
4. Duplicate message IDs are rejected/suppressed.
5. Signed events remain mandatory.
6. Encryption is performed before project data crosses an untrusted transport.
7. Revoked peers cannot continue synchronization.
8. Attachment chunks are independently validated and resumable.

## Provider transports

Email remains a portable envelope transport. WhatsApp and Arattai remain optional provider adapters and are only activated through supported official APIs/capabilities.

## Verification

Repository comparisons confirm the implementation branches contain the interoperability changes. Native application builds and physical device-to-device tests remain required for final release validation; they are not claimed as passed here.
