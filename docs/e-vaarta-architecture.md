# e-Vaarta Architecture

## 1. Platform strategy

e-Vaarta uses three native client foundations:

- **Desktop:** Thunderbird Desktop
- **Android:** Thunderbird for Android
- **iOS/iPadOS:** Thunderbird for iOS

This is intentional. Platform-specific email engines, storage, notification systems and UI should not be abstracted away merely to make code look similar.

## 2. Shared conceptual model

The clients should converge on common concepts:

- Account
- Person / identity
- Conversation
- Message
- Attachment
- Project
- Task
- Event / meeting
- Document
- Notification
- Connector
- AI artifact
- Permission / role

A shared schema and service contract should define semantics. Each client can implement the contract using native platform patterns.

## 3. Unified communication

A connector translates an external channel into the e-Vaarta communication model.

```
Email / SMS / RCS / Telegram / Slack / Teams / Matrix / ...
                         |
                    Connector
                         |
                  Unified Message
                         |
        +----------------+----------------+
        |                |                |
    Conversation       Person          Project/Task
```

Connectors must respect the capabilities, terms and security model of their underlying platforms.

## 4. AI boundary

AI functionality should be exposed through platform-neutral operations such as:

- summarize conversation
- extract actions
- draft response
- classify message
- search semantic knowledge
- prepare meeting brief
- create task
- link conversation to project

The execution engine can be local, cloud-based or hybrid according to user policy.

## 5. Privacy

The architecture should make data locality visible and controllable.

Potential execution labels:

- **LOCAL** — processing stays on the device.
- **CLOUD** — data is sent to an explicitly configured service.
- **HYBRID** — only required data leaves the device.

Sensitive school and enterprise workspaces require tenant isolation, role-based access control, audit logging and explicit retention/deletion policies.

## 6. Incremental implementation

Do not attempt to implement the complete platform inside the Thunderbird clients immediately.

The preferred sequence is:

1. Establish product identity and contracts.
2. Build a minimal shared e-Vaarta core.
3. Integrate one vertical at a time into each client.
4. Add synchronization.
5. Add AI services.
6. Add communication connectors.
7. Add project/workspace capabilities.

## 7. Upstream synchronization

Each client must retain a clear relationship with its Thunderbird upstream:

```
Thunderbird upstream
        |
        +---- security / protocol / bug fixes
        |
   e-Vaarta client
        |
        +---- e-Vaarta features
```

Large invasive changes should be avoided unless they provide substantial platform value. Prefer modular additions, adapters and service boundaries.
