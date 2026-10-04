# e-Vaarta Core Contract

**Version: 1**

This directory defines the platform-neutral domain contract shared by the desktop, Android and iOS clients.

## Design rule

The core contract is deliberately independent of:

- UI frameworks
- database engines
- mail protocol implementations
- operating systems
- AI providers
- individual communication services

A client may use a different internal representation, but its adapter must preserve the semantics defined here.

## Initial relationship model

`Person → Conversation → Message`

A conversation may be associated with a project:

`Conversation → Project → Task`

This is the foundation for the later e-Vaarta workflow:

**communication → understanding → action → project execution**

## Versioning

Changes that alter the meaning of an existing field require a new contract version or an explicit migration. Additive fields should remain backward-compatible whenever practical.

See `schema/evaarta-model.schema.json` for the machine-readable representation.
