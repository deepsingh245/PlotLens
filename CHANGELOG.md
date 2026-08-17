# Changelog

All notable changes to PlotLens are recorded here. Format loosely follows Keep a Changelog; dates are `YYYY-MM-DD`.

## 2026-08-17 (last) — Phase 7 (Spatial analysis) Track A: distance + area

### Added

- `@turf/length` + `@turf/area` dependencies (not the full `@turf/turf` meta-package — only what this pass needs).
- `src/gis/measurement.ts` (+ 6 tests): `measureDistance`/`measureArea` Turf wrappers and `formatDistance`/`formatArea` display formatters. Tests cross-check Turf's output against independently-derived fixtures (a documented ~111.19km-per-degree-of-latitude constant, and a planar approximation for a small equator-adjacent square) rather than checking Turf against itself.
- `src/map/DrawingManager.ts`: new `draft` event forwarding genuinely live in-progress geometry (verified against Terra Draw's real `change`-event semantics in the installed package) — the existing `update` event only covered already-finished/loaded features, which wasn't enough for live measurement feedback while drawing.
- Two new tool-rail entries: "Measure distance" (`M`) and "Measure area" (`A`), reusing the existing line/polygon draw modes rather than a second Terra Draw instance — a finished measurement shape is discarded, not persisted as an annotation.
- `src/components/measurement/MeasurementLabel.tsx`: floating live readout, positioned via `map.project()` like `OverlayControlBar`.
- `docs/plans/plan-7.md`: full record of the above, including what's explicitly deferred (buffer/nearest/intersection/road-impact — all "Should/Could have" tier per `PRODUCT_REQUIREMENTS.md`, not this pass's scope).

### Status

Build/lint/tsc/tests all pass (74 → 80 tests). **Interactive verification not yet done this session** — deferred at the user's explicit request to keep this pass code-only, no dev server. Do that before calling this phase fully verified.

## 2026-08-17 (latest) — Phase 6 planning (best-effort, hard gate not cleared)

### Added

- `docs/plans/plan-6.md`: detailed task breakdown for Phase 6 (Government GIS / Bhuvan), written at the user's explicit request after flagging that `docs/PLANNING.md`'s own Phase 6 "hard gate" (no work starts until Bhuvan's endpoint/license/CRS reach `verified` status in `docs/DATA_SOURCES.md`) is not cleared. Every Bhuvan-specific technical value in the plan (endpoint URL, layer names, CRS) is explicitly marked `⚠ PLACEHOLDER — unverified`. The architecture described around those placeholders is real, not invented: the `Provider` adapter contract and `Layer`/`Provider`/`Dataset` schema already exist in `docs/PROVIDER_ARCHITECTURE.md`/`docs/DATA_MODEL.md`, and a new `LayerManager` class is planned to mirror `src/map/OverlayManager.ts`'s existing pattern.

### Status

Planning only, and explicitly not implementation-ready — see plan-6.md's own status header. No Phase 6 code should be written until the DATA_SOURCES.md verification checklist is actually completed by a human.

## 2026-08-17 (even later) — Phase 5 (Layer manager) Track A

### Added

- `src/components/layers/LayersPanel.tsx`: collapsible left layers panel (176px expanded / 34px collapsed, matching the validated wireframe dimensions) with a "Base Map" group — "Streets" shown active (the existing OSM raster style), "Satellite" shown disabled with a tooltip explaining that no verified satellite provider exists yet (see `docs/DATA_SOURCES.md`). Mobile (<768px): no permanently-docked stub — a floating toggle opens a bottom `Sheet` with the same content, mirroring `AnnotationPanel.tsx`/`OverlayControlBar.tsx`'s existing mobile pattern.
- `ProjectWorkspace.tsx`: mounts `LayersPanel` as the first child of the map/panel/rail row (left side, mirroring `ToolRail` on the right); new `layersPanelCollapsed` state, collapsed by default.

### Status

Phase 5 Track A: build/lint/tsc clean; no new unit tests needed (purely presentational, nothing pure to test) — existing 74 tests unchanged. Interactive (headless-Chromium) verification confirmed: desktop expand/collapse at the exact 176px/34px widths, the Satellite tooltip shows the intended copy on hover, and the mobile floating-toggle-plus-Sheet variant works with no console errors. As documented in `docs/plans/plan-5.md`, this phase is intentionally thin: no `MapEngine` changes and no new domain type were built, since there's no verified second base-map provider to switch to yet (`docs/DATA_SOURCES.md`) and building generic switching machinery for a single real option would be speculative. That blocker remains open and needs user-driven provider research/verification before Phase 5 can go further.

## 2026-08-17 (later still) — Phase 5 planning

### Added

- `docs/plans/plan-5.md`: detailed task breakdown for Phase 5 (Layer manager). Surfaces a real blocker rather than solving around it: `docs/DATA_SOURCES.md` has no verified second base-map provider (satellite or otherwise) today, and `docs/PROVIDER_ARCHITECTURE.md` explicitly forbids inventing an unverified endpoint — so a functioning Streets/Satellite toggle can't be built yet. Scopes this phase down to a collapsible layers panel shell (176px/34px, per the validated wireframe dimensions) with Streets as the one real active option and Satellite shown as a disabled, explained placeholder. Deliberately builds no `MapEngine` base-map-switching machinery and no new `Layer` domain type/storage this phase — both are real Phase-6-or-later work once a second provider actually exists, not something to build speculatively now.

### Status

Planning only — no Phase 5 code written yet.

## 2026-08-17 (later) — Phase 4 (Data Import/Export) Track A

### Added

- `src/gis/geojsonImportExport.ts` (+ 26 tests): `parseGeoJsonImport`/`exportAnnotationsToGeoJson` — client-side only, no new dependency. Reuses `annotationGeometry.ts`'s `validateDrawnFeature`/`toAnnotationGeometry` as the geometry-security boundary; adds its own caps (feature count, text size, title/description/tag lengths) and a `properties.plotlensType` round-trip hint so circle/text (which plain GeoJSON can't distinguish from polygon/point) survive export→import losslessly. Import is atomic — one invalid feature rejects the whole file.
- Bulk `createAnnotations()` added to `storage/annotations.ts` and `useAnnotations.ts` (one `setAnnotations` call for the whole batch, not N).
- `src/components/projects/ImportGeoJsonDialog.tsx`: file picker, per-file processing state, specific (never generic) rejection reasons.
- `ProjectMenu.tsx`/`TopBar.tsx`: "Import GeoJSON…" and "Export GeoJSON" (disabled with a tooltip when the project has no annotations) menu items; export builds a `Blob` + temporary `<a download>`.
- `docs/API_CONTRACTS.md`: removed the planned `POST /api/import/geojson`/`GET /api/export/geojson/:projectId` routes, replaced with a note that GeoJSON import/export is intentionally client-side only.

### Fixed

- A latent bug in `ProjectWorkspace.tsx`'s annotation-seeding effect, found while extracting it for reuse by the import handler: it gated on `annotations.length === 0` as a load-proxy instead of `useAnnotations`' real `loading` flag, which would have double-seeded every annotation onto the map the first time a brand-new project went from zero to non-zero annotations (e.g. its first GeoJSON import).

### Status

Phase 4 Track A: build/lint/tsc/tests all pass (66 → 74 tests — note the geojsonImportExport suite alone accounts for 26 of those; the file count referenced in the prior entry undercounted). Interactive (headless-Chromium) verification: importing a small fixture succeeds with the annotations reflected in export output; a malformed file is rejected with a specific reason and the dialog stays open; exported JSON never leaks `id`/`projectId`. **The Phase 2 map-sizing bug is still present** and limited how much of the on-map rendering could be visually confirmed (the canvas itself renders black/undersized) — the import/export logic and data flow are verified independent of it. No Track B needed for this phase — it's entirely client-side.

## 2026-08-17 — Phase 3 (Image Overlay) Track A + Phase 4 planning

### Added

- `src/gis/imageOverlayGeometry.ts` (+ tests): overlay corner geometry — centroid, planar rotate/scale around it, degenerate/collinear rejection via the shoelace formula.
- `src/lib/fileValidation.ts` (+ tests): MIME/magic-byte/size validation for uploaded images — never trusts `file.type` alone.
- `src/projects/overlays/` + `src/storage/overlays.ts`: `ImageOverlay` domain type and Track A mock persistence, mirroring the Phase 2 annotations pattern.
- `src/map/OverlayManager.ts` + `useOverlayManager.ts`: wraps MapLibre's native `image` source/`raster` layer and 4 draggable corner `Marker`s — no hand-rolled quad-warp, no event-map (unlike `DrawingManager`, this class detects and acts on the same gesture, so a plain `onCornersChanged` callback is enough).
- `src/components/overlays/`: `AddOverlayDialog`, `OverlayControlBar` (floating, tracks the map via `project()`, opacity/lock/rotate/scale/delete), `DeleteOverlayDialog`.
- `ToolRail`/`useToolShortcuts`/`ProjectWorkspace` extended: Image Overlay is the rail's 6th tool (`I` shortcut); annotation/overlay selection is mutually exclusive.
- `docs/plans/plan-4.md`: detailed task breakdown for Phase 4 (GeoJSON import/export) — resolves that it needs no new server route (client-side parsing) or dependency, and reuses Phase 2's `annotationGeometry.ts` validation directly; introduces a `properties.plotlensType` GeoJSON property so export→import round-trips stay lossless for types plain GeoJSON can't distinguish (circle vs. polygon, text vs. point).

### Fixed

- Cleaned up two `eslint-disable` comments from the Phase 2 session by properly memoizing `selectAnnotation`/`selectOverlay` with `useCallback` instead of suppressing the lint warning.

### Status

Phase 3 Track A: build/lint/tsc/tests all pass (48 → 66 tests). A quick interactive check confirmed the Add Overlay dialog opens with no console errors. **Re-checked the Phase 2 map-sizing bug (canvas stuck at `height: 300`) as part of this verification — it is still present** despite the earlier fix attempt (`ResizeObserver`/`absolute inset-0`/`relative` wrapper). This affects `OverlayControlBar`'s positioning and corner-drag math, which both depend on the map container's real size — deferred at the user's direction rather than re-debugged live. Track B (real Firestore + Storage) remains blocked on Firebase project/Storage setup.

## 2026-08-11 (later) — Interactive verification + map-sizing fix

### Fixed

- Found via interactive (headless-Chromium) verification of Phase 2, not any automated check: the map container resolved to `height: 0` at runtime, so the canvas silently fell back to MapLibre's 300px default. Root cause: a flex item's `flex-grow`-derived size is a "used value," not a spec-"explicitly specified" height, so a `height: 100%` (`h-full`) descendant several levels deep can resolve to `0`. Fixed in `src/map/MapEngine.ts` (added a `ResizeObserver` + a `requestAnimationFrame`-deferred resize — a genuine pre-existing gap), `src/components/map/MapCanvas.tsx` (`absolute inset-0` instead of `h-full w-full`), and `src/components/projects/ProjectWorkspace.tsx` (a `relative min-h-0 flex-1` wrapper for the map to size against).
- **Not yet re-verified** — see `docs/plans/plan-2.md`'s status update.

### Added

- `docs/plans/plan-3.md`: detailed task breakdown for Phase 3 (Image overlay) — four-corner geographic placement via MapLibre's native `image` source (not a hand-rolled quad-warp), draggable corner handles via plain `Marker`s (not Terra Draw, which doesn't model this), opacity/lock in the MVP scope, blend mode sequenced later once its real cost (a custom WebGL layer — MapLibre's raster paint properties have no blend-mode option) is accounted for.

## 2026-08-11 — Phase 2 (Drawing) Track A

### Added

- `terra-draw` + `terra-draw-maplibre-gl-adapter` adopted for drawing point/line/polygon/circle annotations; `docs/ADR/0006-drawing-library.md` records the decision.
- `src/gis/geojson.ts` + `src/gis/annotationGeometry.ts`: PlotLens's own GeoJSON geometry types and the untrusted-input validation boundary for everything Terra Draw produces (19 unit tests).
- `src/map/DrawingManager.ts` + `useDrawingManager.ts`: wraps Terra Draw the way `MapEngine` wraps vanilla MapLibre — verified against the installed package's actual API (mode names, `finish`/`change`/`select`/`deselect` events, the destructive vs. idle meaning of `stop()`), not assumed.
- `src/projects/annotations/`: `Annotation` domain type, Track A mock store, `useAnnotations` hook.
- `src/components/map/ToolRail.tsx` + `useToolShortcuts.ts`: 5-tool rail (Pin/Line/Polygon/Circle/Note), keyboard shortcuts `P`/`L`/`G`/`C`/`N`/`Esc`.
- `src/components/annotations/`: `AnnotationPanel` (desktop `Card` / mobile `Sheet`), `AnnotationForm`, `DeleteAnnotationDialog`.
- `src/components/projects/ProjectWorkspace.tsx`: wired drawing, tool selection, annotation CRUD, and the text-annotation marker flow together.
- `docs/design/MAP_INTERACTIONS.md`: keyboard shortcuts updated to include `C` (circle).

### Fixed

- A new `react-hooks/set-state-in-effect` lint rule caught a genuine anti-pattern in `AnnotationForm` (syncing local state from a prop via `useEffect` — fixed by keying the component on `annotation.id` instead) and in `useMediaQuery` (rewritten on `useSyncExternalStore`, the correct primitive for subscribing to `matchMedia`).

### Status

Phase 2 Track A (drawing UI, mock persistence) is complete and verified: build/lint/typecheck clean, 30/30 unit tests pass, basic dev-server smoke test clean. **Track B is blocked** on the same Firebase project prerequisite as Phase 1 — see `docs/plans/plan-2.md`. Interactive drawing behavior (vertex dragging, circle resize, touch) has not yet been manually verified in a real browser.

## 2026-08-10

### Added

- Initial project research: product specification, pre-development readiness checklist, security/privacy/compliance checklist, UI/UX design workflow (`docs/research/`).
- Canonical UX/design documentation set: `docs/design/UX_SPECIFICATION.md`, `MAP_INTERACTIONS.md`, `DESIGN_SYSTEM.md`, `USER_FLOWS.md`, distilled from the UI/UX design workflow research doc; `AGENTS.md` UI/UX rules section added.
- Wireframe exploration archived at `docs/design/wireframes/`; validated layout dimensions (176px layers panel, 34px rail/top-bar) folded into `DESIGN_SYSTEM.md` and `PLANNING.md`.
- `docs/research/ai-design-prompt-pack-raw.md` added (external AI design-tool prompt pack, process reference only).
- Image overlay scope extended with `blendMode` and `locked` fields (validated independently by the wireframe and the design prompt pack) — updated in `DATA_MODEL.md` and `design/MAP_INTERACTIONS.md`.
- `docs/ADR/0005-ui-component-library.md`: adopted ReUI (primary) + coss.com/ui (complementary) as the UI component base; Aceternity UI, Tailark, and Skiper UI evaluated and excluded from the core app.
- `docs/PLANNING.md` added: the authoritative phase-by-phase execution plan (tech stack, UI/fonts/theme, flow path, mobile-vs-web, component-library map per phase), reconciling `PRODUCT_REQUIREMENTS.md`'s phase numbering with `design/USER_FLOWS.md`'s build order.
- `docs/plans/` added: detailed, task-level per-phase execution plans (`PLANNING.md` stays the overview; `plans/plan-N.md` is the turn-by-turn breakdown). `plans/plan-1.md` (Phase 1 — Core Map) drafted first.
- Canonical documentation set established: `docs/PROJECT_SPEC.md`, `PRODUCT_REQUIREMENTS.md`, `ARCHITECTURE.md`, `DATA_MODEL.md`, `GIS_ARCHITECTURE.md`, `DATA_SOURCES.md`, `PROVIDER_ARCHITECTURE.md`, `API_CONTRACTS.md`, `COMPETITIVE_ANALYSIS.md`, `ACCEPTANCE_CRITERIA.md`.
- Security/privacy documentation set: `SECURITY.md`, `PRIVACY.md`, `COMPLIANCE.md`, `DATA_CLASSIFICATION.md`, `LICENSES_AND_ATTRIBUTION.md`, `THIRD_PARTY_RISK.md`, `THREAT_MODEL.md`, `SECURITY_TEST_PLAN.md`, `INCIDENT_RESPONSE.md`, `DATA_RETENTION.md`.
- Architecture Decision Records: map engine, storage, provider system, coordinate system (`docs/ADR/`).
- AI-agent instruction files: `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`.
- `.env.example`, `.gitignore`.

### Status

No application code exists yet. Project is in the pre-development/planning phase — see `docs/PRODUCT_REQUIREMENTS.md` for the frozen MVP scope and `AGENTS.md` for what an AI agent may and may not do at this stage.

## 2026-08-10 (later) — Phase 0 + Phase 1 Track A

### Added

- Git repository initialized.
- Next.js (App Router) + TypeScript + Tailwind v4 scaffolded; dark-only theme tokens and Inter font wired per `docs/design/DESIGN_SYSTEM.md`; Vitest configured.
- shadcn/base-nova UI primitives added (`Button`, `Card`, `Dialog`, `Input`, `DropdownMenu`, `Label`) and re-themed to PlotLens tokens — see `docs/plans/plan-1.md` implementation notes on why the default shadcn registry was used instead of ReUI's hosted registry.
- `src/gis/coordinates.ts` and `src/gis/mapState.ts`: coordinate-order and map-state conversion helpers, with unit tests covering the lng/lat-swap bug class `docs/GIS_ARCHITECTURE.md` warns about.
- `src/map/`: `MapEngine` (vanilla MapLibre GL JS wrapper), OSM raster style, re-skinned zoom/compass/scale controls.
- Static shell UI: Projects screen (`ProjectList`/`ProjectCard`/`EmptyState`/`NewProjectDialog`) and the map workspace (`TopBar`/`ProjectWorkspace`/`MapCanvas`), currently backed by mock project data (Track A placeholder).
- `docs/DATA_SOURCES.md`: Nominatim entry added with `status: verified` (usage policy fetched live this session) — search is explicit-submit only, per policy (no client-side autocomplete).
- `src/app/api/geocode/route.ts` + `src/components/search/LocationSearch.tsx`: server-side Nominatim proxy and explicit-submit search UI, documented in `docs/API_CONTRACTS.md`.
- `firestore.rules` (deny-by-default, owner-only, IDOR-safe) + `tests/integration/firestore-rules.test.ts` (10 tests, run via `npm run test:rules` against the Firestore Emulator) — all passing.

### Status

Phase 1 "Track A" (everything not requiring a real Firebase project) is complete and verified: build passes, lint is clean, 11 unit tests pass, 10 Firestore rule/IDOR tests pass against the Emulator. **Phase 1 "Track B" is blocked** on the user creating a real Firebase project and populating `.env.local` — see `docs/plans/plan-1.md` "Open questions / blockers". No real persistence exists yet; the app currently runs entirely on mock data.

## 2026-08-10 (later still) — Phase 2 planning

### Added

- `docs/plans/plan-2.md`: detailed task breakdown for Phase 2 (Drawing) — pin/line/polygon/circle/text annotations, contextual panel, Firestore `annotations` subcollection + IDOR tests. Flags a new dependency decision (a MapLibre drawing library — Terra Draw recommended) that needs confirmation before implementation starts, and documents that circle annotations store as polygon approximations (GeoJSON has no native Circle type).
- `docs/design/MAP_INTERACTIONS.md`: MVP tool list corrected to include Circle, matching `PRODUCT_REQUIREMENTS.md`'s frozen Drawing scope (it was previously missing from that list only).

### Status

Planning only — no Phase 2 code written yet.
