# e-Vaarta Task & Work Operating System — Phases A–E

This implementation turns task management into a semantic work operating system over the existing e‑Vaarta Evidence‑Action Graph.

## Phase A — Execution
My Work, task workspace state, list/Kanban/calendar/timeline/Gantt projections, dependency impact, WIP policy, recurring instances, checklist promotion and time tracking.

## Phase B — Workforce intelligence
Explainable assignment scoring, assignment negotiation, capacity/workload calculations, schedule generation, dependency-aware impact and predictive completion.

## Phase C — Management
Team/project command-center primitives, portfolio health, risks, escalation policies, SLAs and management reviews.

## Phase D — Evidence and governance
Decision→Task and Evidence→Task creation, evidence-backed completion, Submitted→Review→Verified lifecycle, evidence traceability and impact analysis.

## Phase E — Intelligence
Grounded project answers, explainable assignment recommendations, schedule optimization proposals, task health/stall reasoning, project forecasting and weekly review data.

### Safety and authorization
AI may recommend assignments, schedule changes, escalations and actions, but consequential actions are represented as proposals requiring explicit authorization. Evidence-backed claims require source/evidence identifiers.

### Offline-first
The semantic objects remain plain serializable data. They can be created, updated, completed and linked locally; existing semantic collaboration/event infrastructure remains responsible for durable reconciliation.

### Validation boundary
Unit/contract tests are included. Native desktop builds, Android/iOS device execution, renderer fidelity, performance at production corpus scale, accessibility hardware testing and real synchronization remain validation gates rather than claims of completion.
