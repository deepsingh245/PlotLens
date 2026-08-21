# Plan 1 — Phase 1: Core Map

**Status:** Track A complete (2026-08-10). **Track B built (2026-08-22)** — Firebase client bootstrap, single-owner email/password Auth (`AuthProvider`/`AuthGate`/`/login`), real `Project` CRUD (`src/storage/projects.ts`), `useProjects`/`useProject`, and debounced map-state persistence (`useMapStatePersistence`, driving `SaveStatusIndicator`) are all built — `tsc`/`lint`/`vitest` (80/80) clean, build succeeds once `.env.local` is populated. **Interactive verification (against the Emulator, then the real project) is the user's remaining step** — see "Open questions / blockers" below; this file's own bar for "done" isn't met until that happens. See [../PLANNING.md](../PLANNING.md) Phase 0.

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
- [x] Create the Firebase project (console) — done by the user (2026-08-22).
- [ ] Enable Firestore and Firebase Auth (email/password), register a Web App, and populate `.env.local` from [../../.env.example](../../.env.example) with real Firebase config values (five `NEXT_PUBLIC_FIREBASE_*` keys — the doc previously said six, corrected; `messagingSenderId` isn't needed since this app doesn't use FCM). **User action, in progress** — never commit this file, see [../SECURITY.md](../SECURITY.md) §Secrets.
- [x] Install and configure the Firebase Emulator Suite for local Firestore/Auth testing — see [../SECURITY.md](../SECURITY.md) §Firebase security rules. Done via `firebase-tools` + `@firebase/rules-unit-testing`, runs against the fake `demo-plotlens` project ID (no real Firebase project needed for this part). `src/lib/firebaseClient.ts` now also connects to it automatically when `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true` is set.

### 2. Firestore data layer
- [x] `Project` schema types (`src/projects/types.ts`, `src/projects/maps/types.ts`) match [../DATA_MODEL.md](../DATA_MODEL.md).
- [x] `firestore.rules` written: deny-by-default, owner-only read/write, `ownerId` immutable on update, zoom clamped 0–22, create rejects non-empty `layers`/`overlays`/`annotations`/`savedViews` — see [../SECURITY.md](../SECURITY.md) §Firebase security rules.
- [x] Emulator-based rule tests written and passing (`tests/integration/firestore-rules.test.ts`, run via `npm run test:rules`): unauthenticated denied, owner CRUD succeeds, full cross-user IDOR matrix denied (read/update/delete) — see [../SECURITY_TEST_PLAN.md](../SECURITY_TEST_PLAN.md).
- [x] Real CRUD functions (`src/storage/projects.ts`) — create, update `map` state, hard delete, list-by-owner/get-by-id (both as one-shot reads and live `onSnapshot` subscriptions) — against a live Firestore instance. No `renameProject`: no UI anywhere calls for renaming an existing project (only naming at creation), so it wasn't built — add it if a rename affordance is ever designed. The `layers`/`overlays`/`annotations`/`savedViews` arrays are written empty at create (required by `firestore.rules`) and are **not** kept in sync afterward — see [../DATA_MODEL.md](../DATA_MODEL.md)'s note.

### 3. Map rendering
- [x] Vanilla MapLibre GL JS installed and wrapped in `src/map/MapEngine.ts` (vanilla chosen over `react-map-gl` — see [../PLANNING.md](../PLANNING.md) rationale, confirmed correct: v6 has no default export, only named exports).
- [x] OSM raster tile source wired (`src/map/osmStyle.ts`) — **development-scale usage only**, per [../DATA_SOURCES.md](../DATA_SOURCES.md) OSM entry.
- [x] `MapCanvas` renders with the project's real `map.center`/`map.zoom`. `src/gis/mapState.ts`'s `toProjectMapState` (Track A) plus the new debounced move-end writer (`src/projects/maps/useMapStatePersistence.ts`, Track B — greenfield, not just "wiring up" anything that pre-existed) now write real `Project.map` updates on every pan/zoom, mounted in `ProjectWorkspace.tsx`.
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
- [x] Projects screen (`src/app/page.tsx` → `ProjectsView`): card grid via `ProjectList`/`ProjectCard`, "+ New Map" (`NewProjectDialog`), empty state. Now backed by `useProjects()` (live `onSnapshot`, scoped to the signed-in owner) — `src/projects/mockProjects.ts` deleted.
- [x] New Project flow: name + location (via `LocationSearch`) + description, all wired to a real `createProject()` call, then `router.push` to the new project.
- [x] `SaveStatusIndicator` wired to `useMapStatePersistence`'s real status (`saving` → `saved`, auto-resets to `idle`; `error` on failure).
- [x] Auth: single-owner email/password sign-in (`/login`, `AuthProvider`/`AuthGate` gating the whole app) — not originally itemized as its own task, but required to satisfy "email/password, single owner" without putting a password in browser-exposed env (see [../SECURITY.md](../SECURITY.md) §Secrets). No signup UI — the one account is created via the Firebase console or the Emulator UI, not through this app. "Delete Project" (`ProjectMenu`) now wired to a real `deleteProject()` (hard delete) behind a confirmation dialog, matching the annotation/overlay delete-dialog pattern.

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
- [ ] Firebase config values only in `.env.local`, never committed — code is ready (`.env.local` is gitignored, `firebaseClient.ts` reads only `NEXT_PUBLIC_*`/env vars); pending the user actually populating it.
- [x] No `firebase-admin`/server-side Firestore access introduced — client SDK only, per [../ARCHITECTURE.md](../ARCHITECTURE.md)/[../ADR/0002-storage.md](../ADR/0002-storage.md).

## Exit criteria

[../ACCEPTANCE_CRITERIA.md](../ACCEPTANCE_CRITERIA.md) §Project system, in full: create/name/save/reopen/delete works and persists across reload; map center/zoom restores correctly on reopen. **Code complete, not yet interactively verified** — see "Open questions / blockers" below.

## Open questions / blockers

- **Interactive verification still needed.** Sign in → create a project → confirm it appears on `/` and opens at `/projects/[id]` → pan/zoom, confirm `SaveStatusIndicator` shows `Saving…` → `Saved` → reload and confirm the view restored → rename/delete flows → sign out redirects to `/login`. Do this against the Emulator first (`NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true`, `npm run emulators`, create a test user via the Emulator UI), then once against the real project.
- **User still needs to:** enable Email/Password Auth in the console and create the one owner account (no signup UI exists by design), register a Web App, fill in `.env.local`'s five `NEXT_PUBLIC_FIREBASE_*` values, and deploy `firestore.rules` to the real project if not already deployed.

## Next

[plan-2.md](plan-2.md) (Phase 2 — Drawing) — not yet written; write it once this phase is underway, not speculatively now.
