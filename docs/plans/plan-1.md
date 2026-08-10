# Plan 1 — Phase 1: Core Map

**Status:** drafted, not started. **Depends on:** Phase 0 (Foundations) complete — Next.js/TypeScript/Tailwind scaffolded, theme tokens and Inter font wired, git initialized. See [../PLANNING.md](../PLANNING.md) Phase 0.

This is the detailed task breakdown for [../PLANNING.md](../PLANNING.md) Phase 1 / [../PRODUCT_REQUIREMENTS.md](../PRODUCT_REQUIREMENTS.md) Phase 1 ("a stable personal map workspace"). It assumes the reader has skimmed [../PROJECT_SPEC.md](../PROJECT_SPEC.md) and [../AGENTS.md](../../AGENTS.md) — this file does not re-explain product vision or coding rules, only what to build.

## Objective

By the end of this phase: the app boots to a map, the user can create/name/save/reopen/delete a project, the map persists its center/zoom per project, and the user can search for a location and see zoom/compass/scale controls. No drawing, no overlays, no layers beyond the base map — those are later phases.

## Scope

**In scope:** project CRUD, MapLibre rendering with an OSM base layer, location search, zoom/compass/scale controls, project-scoped map-state persistence, Firebase Auth (single owner) wiring, Firestore security rules for `Project`.

**Explicitly out of scope (do not build ahead of schedule):** drawing tools (Phase 2), image overlay (Phase 3), any layer other than the base map (Phase 5), any government data source (Phase 6). If implementation reveals a reason to pull one of these forward, stop and flag it rather than quietly expanding scope.

## Task breakdown

### 1. Firebase project setup
- [ ] Create the Firebase project (console) — see [../../README.md](../../README.md) §Contributing; this was previously deferred, do it now if not already done.
- [ ] Enable Firestore and Firebase Auth (email/password or Google sign-in — either is fine for a single-owner app; pick whichever is less setup friction).
- [ ] Populate `.env.local` from [../../.env.example](../../.env.example) with real Firebase config values. Never commit this file — see [../SECURITY.md](../SECURITY.md) §Secrets.
- [ ] Install and configure the Firebase Emulator Suite for local Firestore/Auth testing — see [../SECURITY.md](../SECURITY.md) §Firebase security rules.

### 2. Firestore data layer
- [ ] Implement the `Project` schema from [../DATA_MODEL.md](../DATA_MODEL.md) (id, ownerId, name, description, map.{center,zoom,bearing,pitch}, timestamps, `archivedAt`).
- [ ] Write `firestore.rules`: deny-by-default, owner-only read/write on `Project`, no open rules — see [../SECURITY.md](../SECURITY.md) §Firebase security rules.
- [ ] Write the corresponding Emulator-based rule tests before considering this task done — not after: unauthenticated read denied, User A cannot read/write User B's project (see [../SECURITY_TEST_PLAN.md](../SECURITY_TEST_PLAN.md) IDOR rows).
- [ ] CRUD functions: create, rename, update `map` state, archive/delete, list-by-owner.

### 3. Map rendering
- [ ] Install MapLibre GL JS + `react-map-gl` or the vanilla MapLibre API (decide based on how much control the corner-handle work in Phase 3 will need — vanilla API gives more direct control over custom layers/sources, which Phase 3's image source will need; lean vanilla unless a wrapper proves clearly easier here).
- [ ] Wire an OSM raster tile source for the base map — **development-scale usage only**, per [../DATA_SOURCES.md](../DATA_SOURCES.md) OSM entry; do not treat this as production-ready.
- [ ] Render the map inside the shell, map center/zoom bound to the current `Project.map` state (read on open, write on move-end, debounced — don't write to Firestore on every frame of a pan/zoom).
- [ ] Confirm attribution (`© OpenStreetMap contributors`) is visible and not hidden — see [../LICENSES_AND_ATTRIBUTION.md](../LICENSES_AND_ATTRIBUTION.md).

### 4. Map controls
- [ ] Zoom in/out control.
- [ ] Compass/north indicator.
- [ ] Scale bar.
- [ ] All three visually quiet per [../design/MAP_INTERACTIONS.md](../design/MAP_INTERACTIONS.md) — small, subtle, never competing with the map itself.

### 5. Location search
- [ ] **Blocked on a decision:** no geocoding/search provider is recorded in [../DATA_SOURCES.md](../DATA_SOURCES.md) yet. Before wiring this: pick a provider (Nominatim/OSM-based for a personal-scale dev setup is the lowest-friction default, consistent with the OSM base map already in use), add its entry to `DATA_SOURCES.md` with license/rate-limit/attribution fields filled in, then implement. Do not call an undocumented geocoding endpoint directly from a component.
- [ ] Search input in the top bar; on select, fly the map to the result and (optionally) set a temporary marker — full pin/marker persistence is Phase 2, so treat this as ephemeral for now.

### 6. Shell UI
- [ ] Top bar at **34px** height ([../design/DESIGN_SYSTEM.md](../design/DESIGN_SYSTEM.md) §Validated layout dimensions): logo/wordmark, project name, search (center), save status indicator, project menu (right).
- [ ] Projects screen: list/grid of project cards (name, location, last-modified — see [../design/UX_SPECIFICATION.md](../design/UX_SPECIFICATION.md) §Screen: Projects), "+ New Map" primary action, empty state ("Create your first investigation").
- [ ] New Project flow: name + location + optional description → on submit, create the Firestore record and immediately open the map workspace (no intermediate confirmation screen — see [../design/UX_SPECIFICATION.md](../design/UX_SPECIFICATION.md) §Screen: New Project).
- [ ] Save status indicator reflects actual Firestore write state (saving/saved/error) — do not show a static "Saved" that isn't tied to a real write result.

## Tech stack for this phase

Next.js (App Router) + TypeScript + React · MapLibre GL JS ([ADR/0001](../ADR/0001-map-engine.md)) · Firebase Auth + Firestore ([ADR/0002](../ADR/0002-storage.md)) · a location-search provider (TBD, see Task 5) · Tailwind + ReUI/coss.com/ui per [ADR/0005](../ADR/0005-ui-component-library.md).

## UI / fonts / theme

Inter for all UI text, monospace stack for coordinate readouts (e.g. a hover coordinate display, if built) — see [../PLANNING.md](../PLANNING.md) §Fonts & theme. Dark palette tokens from the same table. No new theme decisions needed in this phase — reuse Phase 0's setup.

## Flow path delivered

`Projects list → New Project → map opens → search a location → navigate` — golden journey steps 1–3 in [../design/USER_FLOWS.md](../design/USER_FLOWS.md). Stops before layers/drawing/overlay.

## Mobile vs. web

Map is full-screen by default on mobile (`<768px`); search becomes a full-width overlay rather than a fixed top-bar field. Projects screen: single-column card list on mobile, grid on desktop/tablet. See [../PLANNING.md](../PLANNING.md) §Mobile-vs-web summary.

## Component library map

| UI element | Source |
|---|---|
| Search input / command palette | ReUI `Input` / `Command` |
| Project cards, New Project dialog | ReUI `Card`, `Dialog`, `Button` |
| Save status indicator | custom (small, state-driven; no library primitive needed) |
| Zoom / Compass / Scale bar | custom, MapLibre-driven (no equivalent in ReUI or coss.com/ui) |

## Security checklist for this phase (see ../SECURITY_TEST_PLAN.md)

- [ ] Unauthenticated Firestore read on `Project` → denied.
- [ ] User A reads/edits/deletes User B's project → denied.
- [ ] No `allow read, write: if true` anywhere in `firestore.rules`.
- [ ] Firebase config values only in `.env.local`, never committed.

## Exit criteria

[../ACCEPTANCE_CRITERIA.md](../ACCEPTANCE_CRITERIA.md) §Project system, in full: create/name/save/reopen/delete works and persists across reload; map center/zoom restores correctly on reopen.

## Open questions / blockers

- Geocoding/search provider not yet chosen or verified in `DATA_SOURCES.md` (Task 5) — resolve before starting that task, not during.
- Firebase project not yet created (Task 1) — first concrete action of this phase.

## Next

[plan-2.md](plan-2.md) (Phase 2 — Drawing) — not yet written; write it once this phase is underway, not speculatively now.
