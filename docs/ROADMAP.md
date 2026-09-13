# PlotLens — Forward Roadmap & Priorities

A single **forward-looking, prioritized** view of what to build next and in what order. It is deliberately *not* a status archive — for the per-phase "what's built vs. blocked" record, [plans/README.md](plans/README.md) is the source of truth; for per-phase overviews, [PLANNING.md](PLANNING.md). This file only answers "given all that, what should happen next, and why in this order."

_Last reviewed: 2026-09-07._

## Where the project actually is

Phases 0–8 all have **Track A (client/UI) built** and passing `tsc`; Phases 1–2 also have **Track B (real Firestore) wired** but uncommitted/unverified (see git working tree). The defining gap is not missing features — it is that **almost nothing has been verified running against a real backend.** Two standing blockers cause most of it:

1. **No real Firebase project + no interactive verification.** Everything is "built but never clicked through." An emulator path now exists for local viewing (`.env.local`, `npm run emulators`), but a real project is still needed to confirm persistence end-to-end.
2. **No verified second data provider.** No satellite/base-map provider and no government (Bhuvan) endpoint have cleared [DATA_SOURCES.md](DATA_SOURCES.md) verification — this hard-gates Phases 5 (beyond the shell) and 6 entirely.

## Critical path (do in this order)

### P0 — Verify what already exists
Nothing new should be built on top of unverified foundations.

1. **Interactive UI QA pass** across the 8 built screens — fix visual/layout issues. _(In progress.)_
2. **Stand up a real Firebase project**, populate `.env.local`, enable Email/Password Auth, register the Web App. See [../README.md](../README.md) §Contributing.
3. **Verify Track B end-to-end**: project CRUD, annotations, overlays (needs Storage), saved views, and the investigation timeline all save and reload correctly against the real project — not just the emulator.
4. **Commit the pending Track B work** currently in the working tree (annotations/overlays/savedViews/investigationEvents storage + rules) once verified.

### P1 — Finish the centerpiece
5. **Phase 3 — Image overlay Storage.** Firebase Storage upload with the security controls in [SECURITY.md](SECURITY.md) §File upload, then confirm the four-corner georeference + opacity + lock workflow round-trips. Blend-mode (Multiply/Screen) is a **separate, later** task — it needs a custom WebGL layer (MapLibre raster paint has no blend mode); see [plans/plan-3.md](plans/plan-3.md).

### P2 — Complete measurement + close small gaps
6. **Phase 7 remainder** — buffer/radius, nearest-feature, intersection (distance + area already built). See [plans/plan-7.md](plans/plan-7.md).

### P3 — Blocked on research (do NOT guess — verify or ask, per [../AGENTS.md](../AGENTS.md))
7. **Verify a satellite/second base-map provider** in [DATA_SOURCES.md](DATA_SOURCES.md) → unblocks the real Phase 5 Streets/Satellite toggle (today only a disabled placeholder).
8. **Verify Bhuvan** endpoint + license + CRS + attribution → unblocks Phase 6 government layers. Until this clears, [plans/plan-6.md](plans/plan-6.md) stays a best-effort placeholder, not implementable.

### Deferred
9. **Phase 9 — AI.** Explicitly gated on Phases 1–8 working reliably first; not scheduled. Review [PRIVACY.md](PRIVACY.md) §AI and [COMPLIANCE.md](COMPLIANCE.md) before any AI code.

## UI / "good-looking" workstream (parallel, low-risk)

Independent of the backend blockers. A first polish pass (2026-09-07) refined the pre-map screens (Projects landing, cards, empty state, login) within the existing [design/DESIGN_SYSTEM.md](design/DESIGN_SYSTEM.md) tokens. Remaining candidates, to confirm during the live QA pass rather than change blind:

- Verify the map genuinely reaches ~97% of viewport with both panels collapsed (the stated design target).
- Confirm touch targets and bottom-sheet behavior at `<768px` for tool rail, layers, annotation, and overlay controls.
- Run the WCAG AA contrast check the design system flags as still-pending against real rendered screens.
- Keep the accent (`#B8FF52`) reserved for marks/active/hover — never a background fill.

## The two things a human must decide/do
- Create the real Firebase project (P0-2) — cannot be worked around; do not hardcode credentials or weaken rules ([AGENTS.md](../AGENTS.md)).
- Complete provider verification (P3) — endpoints/licenses/CRS must be confirmed against primary sources before any adapter is written.
