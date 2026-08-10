# Plan 1 — Phase 1: Core Map

**Status:** Track A complete (2026-08-10) — Phase 0 scaffolding, GIS helpers, MapEngine/MapCanvas, static shell UI, Nominatim search, and Firestore rules + Emulator tests are all built and passing. **Track B is blocked** on the user creating a real Firebase project and filling in `.env.local` — see Task 1 and "Open questions / blockers" below. See [../PLANNING.md](../PLANNING.md) Phase 0.

**Implementation notes (read before continuing Track B):**
- ReUI's hosted registry paywalled a basic `card` component on first request (license-key required even for what appeared to be a free-tier primitive). Rather than guess which slugs are actually free, Task 6's components were pulled from the **default shadcn registry** instead (`npx shadcn@latest add card dialog input dropdown-menu label`), which already uses the `base-nova` style/preset ReUI itself builds on. This satisfies ADR-0005's intent (accessible, themeable, non-decorative primitives) without the paywall friction — re-evaluate pulling a specific ReUI-hosted component later if a genuinely ReUI-specific enhancement is needed.
- The current shadcn CLI's `base-nova` preset is itself Base UI-backed (`@base-ui/react`), not Radix as ADR-0005 assumed — so the "ReUI (Radix) primary / coss.com/ui (Base UI) secondary" split from that ADR has partially converged: both are Base UI in practice now. Not a problem (Base UI is the same class of headless/accessible primitive ADR-0005 wanted), just noted so the ADR's stack description isn't taken as literally still-accurate.
- MapLibre GL JS v6 has **no default export** — import `{ Map, NavigationControl, ScaleControl }` as named exports, not `import maplibregl from "maplibre-gl"`.
- `LocationSearch` uses a plain custom results list, not ReUI's `Command` — `Command`'s UX model is live local filtering, which doesn't fit Nominatim's explicit-submit-only policy requirement (see Task 5's update below).

This is the detailed task breakdown for [../PLANNING.md](../PLANNING.md) Phase 1 / [../PRODUCT_REQUIREMENTS.md](../PRODUCT_REQUIREMENTS.md) Phase 1 ("a stable personal map workspace"). It assumes the reader has skimmed [../PROJECT_SPEC.md](../PROJECT_SPEC.md) and [../AGENTS.md](../../AGENTS.md) — this file does not re-explain product vision or coding rules, only what to build.

## Objective

By the end of this phase: the app boots to a map, the user can create/name/save/reopen/delete a project, the map persists its center/zoom per project, and the user can search for a location and see zoom/compass/scale controls. No drawing, no overlays, no layers beyond the base map — those are later phases.

## Scope

**In scope:** project CRUD, MapLibre rendering with an OSM base layer, location search, zoom/compass/scale controls, project-scoped map-state persistence, Firebase Auth (single owner) wiring, Firestore security rules for `Project`.

**Explicitly out of scope (do not build ahead of schedule):** drawing tools (Phase 2), image overlay (Phase 3), any layer other than the base map (Phase 5), any government data source (Phase 6). If implementation reveals a reason to pull one of these forward, stop and flag it rather than quietly expanding scope.

## Task breakdown

### 1. Firebase project setup
- [ ] Create the Firebase project (console) — see [../../README.md](../../README.md) §Contributing; this was previously deferred, do it now if not already done. **Blocking Track B — user action required, cannot be done by the AI.**
- [ ] Enable Firestore and Firebase Auth (email/password — confirmed choice, simplest console setup for a single owner).
- [ ] Populate `.env.local` from [../../.env.example](../../.env.example) with real Firebase config values. Never commit this file — see [../SECURITY.md](../SECURITY.md) §Secrets.
- [x] Install and configure the Firebase Emulator Suite for local Firestore/Auth testing — see [../SECURITY.md](../SECURITY.md) §Firebase security rules. Done via `firebase-tools` + `@firebase/rules-unit-testing`, runs against the fake `demo-plotlens` project ID (no real Firebase project needed for this part).

### 2. Firestore data layer
- [x] `Project` schema types (`src/projects/types.ts`, `src/projects/maps/types.ts`) match [../DATA_MODEL.md](../DATA_MODEL.md).
- [x] `firestore.rules` written: deny-by-default, owner-only read/write, `ownerId` immutable on update, zoom clamped 0–22, create rejects non-empty `layers`/`overlays`/`annotations`/`savedViews` — see [../SECURITY.md](../SECURITY.md) §Firebase security rules.
- [x] Emulator-based rule tests written and passing (`tests/integration/firestore-rules.test.ts`, run via `npm run test:rules`): unauthenticated denied, owner CRUD succeeds, full cross-user IDOR matrix denied (read/update/delete) — see [../SECURITY_TEST_PLAN.md](../SECURITY_TEST_PLAN.md).
- [ ] **Blocked on Task 1 (Track B):** real CRUD functions (`src/storage/projects.ts`) — create, rename, update `map` state, archive/delete, list-by-owner — against a live Firestore instance.

### 3. Map rendering
- [x] Vanilla MapLibre GL JS installed and wrapped in `src/map/MapEngine.ts` (vanilla chosen over `react-map-gl` — see [../PLANNING.md](../PLANNING.md) rationale, confirmed correct: v6 has no default export, only named exports).
- [x] OSM raster tile source wired (`src/map/osmStyle.ts`) — **development-scale usage only**, per [../DATA_SOURCES.md](../DATA_SOURCES.md) OSM entry.
- [x] `MapCanvas` renders with a hardcoded/prop-passed default center/zoom (Track A — no Firestore-backed persistence yet; `src/gis/mapState.ts`'s `toProjectMapState` and the debounced move-end writer are built but not yet wired to a real write, since that needs Task 1).
- [x] `© OpenStreetMap contributors` attribution confirmed visible (MapLibre's built-in attribution control, re-skinned via `src/map/map-controls.css`).

### 4. Map controls
- [x] Zoom in/out — MapLibre's built-in `NavigationControl`.
- [x] Compass/north indicator — same `NavigationControl` (`visualizePitch: true`).
- [x] Scale bar — MapLibre's built-in `ScaleControl`.
- [x] All three re-skinned to the token palette via `src/map/map-controls.css` rather than rebuilt from scratch — see [../PLANNING.md](../PLANNING.md) "Map chrome" decision.

### 5. Location search
- [x] Nominatim added to [../DATA_SOURCES.md](../DATA_SOURCES.md) as `status: verified` (fetched the live usage policy directly rather than relying on general knowledge). **Important finding not in the original task description:** Nominatim's policy explicitly prohibits client-side autocomplete/typeahead — search is **explicit-submit only** (type → Enter/click → results list), never live-suggest-as-you-type. Confirmed with the user before implementing.
- [x] `src/app/api/geocode/route.ts` — server-side proxy (required for the User-Agent header and centralized ≤1 req/sec throttling), domain-allowlisted to `nominatim.openstreetmap.org`. Documented in [../API_CONTRACTS.md](../API_CONTRACTS.md).
- [x] `src/components/search/LocationSearch.tsx` — explicit-submit, wired into `TopBar` (flies the map + drops an ephemeral, unpersisted marker) and reused in `NewProjectDialog` for initial-location selection.

### 6. Shell UI
- [x] `TopBar` at **34px** height ([../design/DESIGN_SYSTEM.md](../design/DESIGN_SYSTEM.md) §Validated layout dimensions): wordmark, project name, search (center), save status indicator, project menu (right).
- [x] Projects screen (`src/app/page.tsx`): card grid via `ProjectList`/`ProjectCard`, "+ New Map" (`NewProjectDialog`), empty state. Currently backed by `src/projects/mockProjects.ts` (Track A placeholder — delete once Track B's `ProjectsProvider` lands).
- [x] New Project flow: name + location (via `LocationSearch`) + optional description; submit is stubbed (`TODO(Track B)` in the component) pending Task 1.
- [x] `SaveStatusIndicator` built as a pure prop-driven component (`idle`/`saving`/`saved`/`error`) — not yet wired to a real write result, since there's no real write yet (Track B).

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
| Search input | default shadcn `Input` (see implementation note above re: ReUI paywall) |
| Search results list | custom (Command's live-filter model doesn't fit explicit-submit search) |
| Project cards, New Project dialog | default shadcn `Card`, `Dialog`, `Button`, `Label` |
| Save status indicator | custom (small, state-driven; no library primitive needed) |
| Zoom / Compass / Scale bar | MapLibre's built-in `NavigationControl`/`ScaleControl`, re-skinned via CSS |

## Security checklist for this phase (see ../SECURITY_TEST_PLAN.md)

- [x] Unauthenticated Firestore read on `Project` → denied (Emulator-tested).
- [x] User A reads/edits/deletes User B's project → denied (Emulator-tested, full IDOR matrix).
- [x] No `allow read, write: if true` anywhere in `firestore.rules`.
- [ ] Firebase config values only in `.env.local`, never committed — not yet applicable, no real project/`.env.local` exists yet (Track B).

## Exit criteria

[../ACCEPTANCE_CRITERIA.md](../ACCEPTANCE_CRITERIA.md) §Project system, in full: create/name/save/reopen/delete works and persists across reload; map center/zoom restores correctly on reopen. **Not yet met** — this requires Track B (real Firestore persistence). Track A gets everything else (UI, map, search, security rules) ready for Track B to plug into.

## Open questions / blockers

- **Firebase project not yet created (Task 1) — blocks all of Track B.** User action required: create a Firebase project, enable Firestore + Email/Password Auth, register a Web App, fill in `.env.local`'s six `NEXT_PUBLIC_FIREBASE_*` values (see [../PLANNING.md](../PLANNING.md) Track B action items). Nothing else in this phase is blocked.

## Next

[plan-2.md](plan-2.md) (Phase 2 — Drawing) — not yet written; write it once this phase is underway, not speculatively now.
