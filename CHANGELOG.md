# Changelog

All notable changes to PlotLens are recorded here. Format loosely follows Keep a Changelog; dates are `YYYY-MM-DD`.

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
