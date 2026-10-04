# e-Vaarta phases 353–402: Native Runtime Transports

This phase turns the distributed architecture into platform-native runtime primitives while preserving the transport-independent e-Vaarta protocol.

## Implemented

### Desktop
- Length-prefixed e-Vaarta transport framing.
- Native peer transport boundary using an injected platform channel factory.
- Discovery beacon model for local peer discovery.
- Authenticated session handshake using the existing e-Vaarta crypto boundary.
- Chunked attachment transfer and deterministic reassembly.
- Email transport bridge using Thunderbird's eventual mail integration point; no provider API is fabricated.

### Android
- Android Keystore EC key-pair creation/persistence.
- Android NSD (_evaarta._tcp.) discovery.
- TCP socket transport with bounded frame sizes.
- Authenticated session state.
- Chunked attachment transfer.

### iOS
- Keychain-backed persistent identity key boundary.
- Network.framework TCP listener/connection transport.
- Bonjour service publication (_evaarta._tcp).
- CoreBluetooth central discovery boundary.
- CryptoKit authenticated session primitives.
- Chunked attachment transfer.

## Security model

Local discovery is not trust. A discovered peer must still match the trusted e-Vaarta identity/fingerprint and complete the authenticated session before project events are exchanged.

Transport framing is bounded. Attachments are transferred in chunks and are not treated as trusted merely because they arrived over a local connection.

The protocol continues to require signed/encrypted envelopes and capability checks. Platform transports carry opaque protocol envelopes; they do not interpret project plaintext.

## Provider transports

WhatsApp and Arattai remain capability-gated adapters. This phase does not claim undocumented APIs, scraping, UI automation, or credentials. When an official API is configured, it can be connected through the existing transport registry; otherwise e-Vaarta can use explicit share/export or another available transport.

## Verification

Unit-level framing and attachment round-trip tests were added on all three platforms.

Full desktop/Android/iOS builds and device tests must still be run in their native toolchains. This change set deliberately does not claim those builds passed.
