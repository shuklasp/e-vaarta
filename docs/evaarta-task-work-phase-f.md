# e-Vaarta Phase F — Production Work Graph & UX

Phase F turns the Phase A–E task model into a production-oriented Work Operating System boundary.

## Implemented semantic engines
- Work graph and dependency projections
- My Work, Kanban, List, Calendar and Gantt models
- Critical-path calculation
- Explainable assignment recommendations
- Assignment negotiation boundary
- Capacity/workload matrix
- Dependency-aware schedule proposals and what-if simulation
- Project command center and portfolio health
- Risk model
- Evidence-backed completion and verification
- Workflow triggers/actions with authorization boundaries
- Notification planning and digest/immediate policy
- Offline idempotent work events and deterministic reconciliation/conflict detection
- Grounded project-control answers with source/evidence references
- Weekly project review generation

## Product rule
All views are projections of the same semantic work graph. No view owns an independent task database.

## Safety rule
Consequential actions such as assignment, schedule changes, notifications with external effects, and workflow actions remain authorization-gated. AI may recommend; policy and an authorized actor execute.

## Offline rule
Offline changes are represented as durable semantic events with device identity, entity identity, base version and idempotency keys. Reconciliation must not silently use last-writer-wins for conflicting semantic edits.

## Validation status
Source-level contracts and unit tests were added. Native desktop, Android, iOS, physical-device, synchronization, accessibility-hardware and production-scale performance validation still require execution in their respective build environments.
