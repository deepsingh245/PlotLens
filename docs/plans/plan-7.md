# Plan 7 — Phase 7: Spatial analysis (measurements)

**Status:** Distance + area built 2026-08-17. Nearest-feature + polygon overlap added 2026-09-13 (see "Nearest-feature + overlap (2026-09-13)" below). Buffer/radius remains out of scope — [../design/MAP_INTERACTIONS.md](../design/MAP_INTERACTIONS.md) gates it under "Future — do not build before the MVP workflow is stable," which hasn't cleared yet. Road-impact analysis against external layers stays blocked on Phase 6. Verified via `tsc`/`lint`/`vitest`/`build` only, not yet interactively re-checked in a running browser (deferred at the user's request — real Firebase project + browser QA are a later, separate pass).

This is the detailed record for [../PLANNING.md](../PLANNING.md) Phase 7 / [../PRODUCT_REQUIREMENTS.md](../PRODUCT_REQUIREMENTS.md) roadmap item 7 ("distance/area/buffer/nearest/intersection/road-impact"). Depends on Phases 2–3 (drawing + the `DrawingManager`/Terra Draw wrapper this phase extends), both already built.

## Objective

The user can measure distance along a drawn line and area of a drawn polygon, with live feedback while drawing (a floating label, not a modal) and a result that's independently verifiable — not just "a number appears."

## Scope

**In scope:** distance (line) and area (polygon) measurement tools, live floating-label feedback while drawing, Turf.js as the calculation library (already named in [../GIS_ARCHITECTURE.md](../GIS_ARCHITECTURE.md) §Measurement — not a new decision this phase, just its first real use).

**Explicitly out of scope:** buffer/radius, nearest-feature, intersection, and road-impact analysis ("properties within 250m") — [../PRODUCT_REQUIREMENTS.md](../PRODUCT_REQUIREMENTS.md) tiers these "Should have"/"Could have" below plain distance/area; they need their own geometry-selection UX (buffer needs a radius input, road-impact needs a target dataset to intersect against — there's no such dataset until Phase 6 unblocks) and aren't a natural extension of this pass's line/polygon-drawing reuse. Measurements are also not persisted as a new domain type — [../DATA_MODEL.md](../DATA_MODEL.md) has no `Measurement` schema, only a generic `InvestigationEvent` (`type: "measurement_taken"`) that Phase 8 could log to later; that wiring is Phase 8's concern, not this one's.

## Technical decisions this plan resolves

**Reuses `DrawingManager`'s existing line/polygon Terra Draw modes rather than a second Terra Draw instance.** A measurement is drawn exactly like a line/polygon annotation, but the result is never persisted as an `Annotation` — `ProjectWorkspace.tsx`'s existing `create` handler branches on `activeTool` and, when measuring, discards the drawn shape instead of calling `createAnnotation`.

**A new `draft` event on `DrawingManager`, exposing genuinely live in-progress geometry — not polling or a second copy of Terra Draw's state.** Verified against the installed package (`node_modules/terra-draw/dist/terra-draw.d.ts`): Terra Draw's `change` event fires with `type: "update"` on every vertex added while a feature is still being drawn, before `finish`. The existing `handleChange` only forwarded these for *already-known* (finished/loaded) feature ids, since that's all annotation-editing needed; measurement needs the *unknown*-id case — the feature currently being drawn — so `DrawingManager` now tracks `activeDraftTool` (set by `start()`, cleared by `stop()`) and forwards those as a new `draft` event. No behavior changed for existing `create`/`update` consumers.

**No new persisted type, no server route, no new UI primitive beyond a small custom floating label** — matches [../PLANNING.md](../PLANNING.md) Phase 7's own component-library note ("no dialog/modal primitive needed").

**Turf.js added as two small, focused packages (`@turf/length`, `@turf/area`), not the full `@turf/turf` meta-package.** Only length/area are needed this phase; buffer/nearest/intersection (needed by the explicitly-deferred features above) can be added the same way when those features actually get built, rather than pulling in everything now.

**Keyboard shortcut for area (`A`) isn't in [../design/MAP_INTERACTIONS.md](../design/MAP_INTERACTIONS.md)'s indicative list** (that doc names one shortcut, `M`, for a single "measure" concept, but this app ships distance and area as two separate tools). `M` = measure distance (matches the doc), `A` = measure area (previously unused) — the doc itself says its shortcut list is "indicative, finalize during implementation."

## What was built

- `src/gis/measurement.ts` (+ tests): `measureDistance`/`measureArea` (thin Turf wrappers, raw base units only — meters/kilometers, square meters/hectares) and `formatDistance`/`formatArea` (unit selection at the display layer, per [../GIS_ARCHITECTURE.md](../GIS_ARCHITECTURE.md)'s explicit rule against storing multiple unit variants).
- `tests/unit/gis/measurement.test.ts`: cross-checks Turf's output against independently-derived fixtures — 1° of latitude ≈ 111.19km (a documented geographic constant, not something computed via Turf) for distance, and a planar approximation for a small equator-adjacent square for area — satisfying [../ACCEPTANCE_CRITERIA.md](../ACCEPTANCE_CRITERIA.md) §Measurements' explicit "cross-checked against a known test fixture" requirement, not merely asserting Turf agrees with itself.
- `src/map/DrawingManager.ts`: new `draft` event + `activeDraftTool` tracking (see "Technical decisions" above).
- `src/components/map/ToolRail.tsx` / `useToolShortcuts.ts`: two new tools, `measure-distance` (`Ruler` icon, `M`) and `measure-area` (`LandPlot` icon, `A`); new exported `MeasureTool` type.
- `src/components/measurement/MeasurementLabel.tsx`: floating readout tracked against the map via `engine.getMap().project()`, mirroring `OverlayControlBar.tsx`'s positioning pattern; monospace, per [../design/MAP_INTERACTIONS.md](../design/MAP_INTERACTIONS.md)'s numeric-readout convention.
- `src/components/projects/ProjectWorkspace.tsx`: `measurementResult` state; `draft`-event subscription computing a live value while drawing; `create`-handler branch that discards (rather than persists) a finished measurement shape; `handleSelectTool`/`handleCancelTool` updated for the two new tools.

## Tech stack for this phase

New dependencies: `@turf/length`, `@turf/area` (see "Technical decisions" above for why not the full meta-package).

## UI / fonts / theme

Floating label, monospace font, `bg-surface-elevated`/`border-border` tokens — same visual language as `OverlayControlBar`'s opacity readout, per [../PLANNING.md](../PLANNING.md) Phase 7's "live floating measurement label while drawing (not a modal)."

## Flow path delivered

*measure distance/area* (golden journey step).

## Mobile vs. web

Same floating-label approach works at touch scale without a separate mobile branch — per [../PLANNING.md](../PLANNING.md) Phase 7's own note. Not yet manually verified on a touch viewport (see Verification).

## Component library map

| UI element | Source |
|---|---|
| Floating measurement label | Small custom component, no dialog/modal (per [../PLANNING.md](../PLANNING.md)) |
| Tool rail entries | Existing `ToolRail.tsx` pattern, two more rows |

## Exit criteria

[../ACCEPTANCE_CRITERIA.md](../ACCEPTANCE_CRITERIA.md) §Measurements: *"the calculated value matches an independently-verified reference calculation... not just 'a number appears.'"* Met for distance/area — see the test fixtures above. Buffer/nearest/intersection/road-impact criteria don't exist yet (out of scope this pass, see Scope).

## Verification

1. `npx tsc --noEmit` / `npm run lint` / `npm run build` — clean.
2. `npm run test` — new `measurement.test.ts` (6 tests) passes alongside all existing suites (74 → 80 tests).
3. **Not yet done this session:** interactive/headless-browser verification of the live-drawing label and its positioning — deferred at the user's explicit request ("close server for this project and just code for now"). Do this before considering the phase fully done: draw a line/polygon with each measure tool active, confirm the label tracks the last vertex and updates on every click, confirm `Esc` clears both the tool and the label, confirm the shape itself disappears after finishing (by design — see "What was built").

## Open questions / blockers

- None novel to this phase — it needed no Firebase/provider prerequisite, unlike most other phases.
- Buffer/road-impact remain designed-but-not-built (see Scope, and the 2026-09-13 update below) — buffer is explicitly gated by `../design/MAP_INTERACTIONS.md` until the MVP workflow is confirmed stable; road-impact needs Phase 6.

## Nearest-feature + overlap (2026-09-13)

**What changed:** nearest-feature and polygon-overlap analysis, scoped to the project's own annotations (no external dataset needed, so no Phase 6 dependency) — see [CHANGELOG.md](../../CHANGELOG.md) for the file-level detail. Buffer was considered in the same pass and deliberately not built — `../design/MAP_INTERACTIONS.md`'s "Future — do not build before the MVP workflow is stable" gate applies to it and hasn't cleared (interactive verification against a real Firebase project, `../ROADMAP.md`'s P0, is still open).

**Scope decisions:**
- Nearest-feature only runs from a **Point** annotation — a Line/Polygon origin would need a real geometry-to-geometry closest-point search (not built), and `../GIS_ARCHITECTURE.md` §Measurement's "never approximate" rule rules out quietly substituting a centroid.
- Overlap only runs between **Polygon** annotations (Circle included — it stores as Polygon, see `../DATA_MODEL.md`) and reports the real intersection area (`@turf/intersect` + `@turf/area`), not a boolean-only yes/no.
- No new persisted type — results render inline in `AnnotationPanel`/`AnnotationForm` and aren't saved, matching this plan's original "no new persisted type" decision for distance/area.

**Verification:** `tsc`/`lint`/`vitest` (89/89, +9 for `spatialAnalysis.ts`)/`build` clean. Interactive verification not done this pass (explicitly deferred to the later Firebase-project + browser QA pass).

## Next

Phase 8 (Saved views + investigation timeline) — see [plan-8.md](plan-8.md).
