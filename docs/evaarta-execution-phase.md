# e‑Vaarta Execution Phase

The product now separates semantic contracts from runtime execution.

## Runtime layers
1. Workspace controller — projects semantic state into application surfaces.
2. Provider execution adapters — execute provider operations when configured.
3. Provider runtime catalog — records adapter readiness separately from live validation.
4. Message-to-action pipeline — preserves traceability from communication through evidence, decision, task and project.
5. Export runtime — turns semantic objects into durable export jobs.
6. Release execution gates — separates source, build, unit, integration, provider, device, security, accessibility and performance evidence.

## Provider status
All providers currently represented by the communication catalog are marked adapter-ready but live-unvalidated. This is intentional: no provider credential, API session, native transport, or production interoperability test was available in this source-only pass.

## Release rule
A capability must not be advertised as production-validated merely because its semantic contract or adapter exists. Runtime evidence must be recorded against the relevant execution gate.
