# Plans

This folder holds one detailed, execution-ready plan per implementation phase — the step-by-step task breakdown a coding session actually works from. It is separate from [../PLANNING.md](../PLANNING.md), which stays a short cross-phase overview (tech stack summary, font/theme tokens, the mobile-vs-web table, the component-library strategy) — that file is the map, this folder is the turn-by-turn directions.

**Naming:** `plan-N.md`, where `N` matches the phase number in [../PLANNING.md](../PLANNING.md) (Phase 0 = Foundations, Phase 1 = Core Map, Phase 2 = Drawing, …). Add a new `plan-N.md` here when a phase is about to start — not all phases need to be pre-written before Phase 1 begins.

## Index

| Plan | Phase | Status |
|---|---|---|
| [plan-1.md](plan-1.md) | Phase 1 — Core Map | Track A complete; Track B blocked on Firebase project creation (user action) |
| [plan-2.md](plan-2.md) | Phase 2 — Drawing | Track A built. Map-sizing layout bug (canvas stuck at 300px height) confirmed still present on re-check; deferred. Track B blocked on Firebase. |
| [plan-3.md](plan-3.md) | Phase 3 — Image Overlay | Track A built (upload, corner drag, opacity, lock). Track B blocked on Firebase Storage. |
| [plan-4.md](plan-4.md) | Phase 4 — Data Import/Export | Track A built (GeoJSON import/export, atomic + capped, lossless round-trip via `plotlensType`). No Track B needed — client-side only. |
| [plan-5.md](plan-5.md) | Phase 5 — Layer manager | Track A built (panel shell, Streets active, Satellite disabled+explained). Blocked on a verified second base-map provider for anything beyond the shell — see that file. |
| [plan-6.md](plan-6.md) | Phase 6 — Government GIS (Bhuvan) | Drafted best-effort at user's request. **Hard gate not cleared** — every Bhuvan endpoint/layer/CRS detail is an unverified placeholder; implementation cannot start until DATA_SOURCES.md's verification checklist is actually completed. |
| [plan-7.md](plan-7.md) | Phase 7 — Spatial analysis (measurements) | Track A built (distance + area via Turf.js, live floating label). Buffer/nearest/intersection/road-impact deferred. Interactive verification pending. |

## Rule

A `plan-N.md` file is task-level detail for **one** phase from [../PLANNING.md](../PLANNING.md) — it should not restate product/architecture/security truth that already lives in [../PROJECT_SPEC.md](../PROJECT_SPEC.md), [../ARCHITECTURE.md](../ARCHITECTURE.md), [../SECURITY.md](../SECURITY.md), etc. Link to those; don't duplicate them. If a plan file and `../PLANNING.md`'s summary of the same phase ever disagree, update both in the same change — they describe the same phase at two levels of detail and must stay consistent.
