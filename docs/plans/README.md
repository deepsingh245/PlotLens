# Plans

This folder holds one detailed, execution-ready plan per implementation phase — the step-by-step task breakdown a coding session actually works from. It is separate from [../PLANNING.md](../PLANNING.md), which stays a short cross-phase overview (tech stack summary, font/theme tokens, the mobile-vs-web table, the component-library strategy) — that file is the map, this folder is the turn-by-turn directions.

**Naming:** `plan-N.md`, where `N` matches the phase number in [../PLANNING.md](../PLANNING.md) (Phase 0 = Foundations, Phase 1 = Core Map, Phase 2 = Drawing, …). Add a new `plan-N.md` here when a phase is about to start — not all phases need to be pre-written before Phase 1 begins.

## Index

| Plan | Phase | Status |
|---|---|---|
| [plan-1.md](plan-1.md) | Phase 1 — Core Map | Track A complete; Track B blocked on Firebase project creation (user action) |

## Rule

A `plan-N.md` file is task-level detail for **one** phase from [../PLANNING.md](../PLANNING.md) — it should not restate product/architecture/security truth that already lives in [../PROJECT_SPEC.md](../PROJECT_SPEC.md), [../ARCHITECTURE.md](../ARCHITECTURE.md), [../SECURITY.md](../SECURITY.md), etc. Link to those; don't duplicate them. If a plan file and `../PLANNING.md`'s summary of the same phase ever disagree, update both in the same change — they describe the same phase at two levels of detail and must stay consistent.
