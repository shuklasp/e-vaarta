# e-Vaarta Desktop

This repository is the desktop client foundation for **e-Vaarta**, based on Thunderbird Desktop.

## Companion clients

- Android: https://github.com/shuklasp/e-vaarta-android
- iOS / iPadOS: https://github.com/shuklasp/e-vaarta-ios

## Architecture

See [e-Vaarta Architecture](docs/e-vaarta-architecture.md).

The platform strategy is **native clients with shared contracts**: email and operating-system functionality remains native to each client, while common e-Vaarta concepts such as conversations, people, projects, tasks, documents, search and AI operations converge through explicit service contracts.

## Development principle

Keep the relationship with Thunderbird upstream healthy. Prefer modular e-Vaarta additions and adapters over unnecessary changes to Thunderbird foundations. This makes security fixes, protocol improvements and other upstream work easier to incorporate.

This file is an e-Vaarta project note; the upstream Thunderbird developer documentation remains applicable for the underlying desktop build system.
