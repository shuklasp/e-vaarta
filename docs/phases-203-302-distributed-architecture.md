# e-Vaarta Distributed Architecture — Phases 203–302

This implementation establishes the distributed collaboration foundation as a server-optional, offline-first protocol.

## Protocol layers

1. Local identity and device identity
2. Capability-based authorization
3. Signed/encrypted e-Vaarta envelopes
4. Append-only project events
5. Event manifests and deterministic merge
6. Store-and-forward delivery queue
7. Transport registry and routing
8. Local peer transports (Wi-Fi/Bluetooth)
9. Internet transports (email and capability-gated messenger adapters)
10. File/project-bundle transport

## Transport policy

Wi-Fi and Bluetooth are local peer transports. Email, WhatsApp and Arattai are Internet/provider transports. WhatsApp and Arattai adapters are deliberately capability-gated and fail closed unless an official supported integration is supplied. No UI automation, scraping, reverse engineering, or bypass of provider controls is part of the protocol.

## Security policy

Transport is untrusted. Project events are bound to cryptographic identities and capabilities. The crypto layer is an explicit platform provider: if a platform has no configured signing/encryption provider, secure publication/verification fails rather than silently falling back to plaintext.

## Store-and-forward

When no permitted transport is available, the encrypted envelope remains in the local delivery queue. A later transport can forward it. Hop limits and message IDs provide basic forwarding/replay boundaries; recipient verification remains mandatory.

## Synchronization

Peers exchange event manifests instead of whole projects. Missing events are transferred incrementally. The event journal is append-only and deterministic. Divergent task events are surfaced as conflicts rather than resolved with unsafe last-writer-wins semantics.

## Phases

203–212 identity/trust; 213–222 secure protocol; 223–232 local peer discovery; 233–242 peer synchronization; 243–252 email transport; 253–262 file/offline transport; 263–272 Matrix/open-protocol boundary; 273–282 XMPP/open-protocol boundary; 283–292 generic provider adapters including WhatsApp/Arattai; 293–302 routing/store-and-forward.

## Current implementation boundary

The protocol, models, routing, queues, capability checks and adapter contracts are implemented. OS-specific Bluetooth/Wi-Fi APIs, provider credentials, and platform key stores remain injected implementations rather than fake implementations. Full production cryptography and provider certification must be supplied through the platform crypto/provider adapters before secure network deployment.
