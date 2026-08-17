# Plan 2 — Phase 2: Drawing

**Status:** Track A built (2026-08-11) — drawing (point/line/polygon/circle via Terra Draw, text via a custom marker), the tool rail, the annotation contextual panel, and in-memory mock persistence are all built, type-checked, lint-clean, and unit-tested. **Track B (real Firestore persistence + rules) is still blocked** on the user creating a Firebase project — same blocker as [plan-1.md](plan-1.md); Tasks 3 and 5's real-Firestore halves are not started.

**Update (2026-08-11, interactive verification):** driving the app with a headless-Chromium script surfaced a real, previously-undetected bug: the map's container resolved to `height: 0` at runtime (MapLibre's canvas fell back to its 300px default), traced to a classic CSS issue — a flex item's `flex-grow`-derived size is a "used value," not a spec-"explicitly specified" height, so a `height: 100%` descendant several levels deep can silently resolve to `0`. Three fixes were applied: `MapEngine` now attaches a `ResizeObserver` (a genuine pre-existing gap, not just a workaround) plus a `requestAnimationFrame`-deferred resize call; `MapCanvas` renders `absolute inset-0` instead of `h-full w-full`; `ProjectWorkspace` wraps it in a `relative min-h-0 flex-1` container so the absolute positioning has a real box to size against.

**Re-verified during Phase 3 (2026-08-11/17): the bug is still present.** A fresh headless-Chromium check on `/projects/mock-1` still measures `.maplibregl-canvas`'s bounding box at `height: 300` after all three fixes above. The `ResizeObserver`/`requestAnimationFrame`/`absolute inset-0`/`relative` changes did not resolve it — either there's a further layout issue not yet diagnosed, or something about the fix isn't taking effect in practice. **Deferred at the user's direction** rather than continuing to debug live. This matters beyond Phase 2: Phase 3's `OverlayControlBar` positioning and corner-drag math both depend on the map container's real rendered size via `map.project()`/`getBoundingClientRect()`, so they inherit this same risk until it's actually fixed — Phase 3's own automated checks (build/lint/tsc/tests) all pass and are equally blind to it.

**Implementation notes (read before continuing Track B):**
- Terra Draw's real API differs from this doc's original sketch in a few verified ways: there's no `start(mode)`/`stop()` pair on the `TerraDraw` class itself — `start()` takes no arguments (activates the instance once), mode switching is `setMode(mode)`, and `TerraDraw.stop()` is the *destructive* full teardown (clears the store, deregisters the adapter) — it maps to `DrawingManager.destroy()`, not to "pause drawing." `DrawingManager.stop()` instead calls `setMode("select")` to return to an idle/editable state. The `finish` event (not `create`) fires on a completed drawing, with `(id, {mode})` — no need to inspect `rawFeature.properties.mode`. Generic geometry edits arrive via the `change` event with a `type` field, filtered to only forward `type === "update"` for ids already known to `DrawingManager`. Mode name strings are `point`/`linestring`/`polygon`/`circle`/`select` — note `"linestring"`, not `"line"` (our own `DrawTool` vocabulary keeps `"line"`; `DrawingManager` is the only place that translates between the two). All verified against the installed package's `.d.ts` and bundled source, not assumed.
- `ToolRail`/`AnnotationPanel` ended up sourcing every primitive from the **default shadcn registry** (`tooltip`, `sheet`) — same precedent as Phase 1, no ReUI-registry paywall hit this time. `popover` was skipped entirely; the desktop panel uses `Card` as a real flex sibling instead, so it never needed a floating-anchor primitive.
- A new ESLint rule (`react-hooks/set-state-in-effect`, part of an updated `eslint-plugin-react-hooks`) flagged four spots. Two were genuine anti-patterns and got real fixes: `AnnotationForm` no longer syncs local state from a prop via `useEffect` (it's keyed by `annotation.id` from `AnnotationPanel` and remounts instead), and `useMediaQuery` was rewritten on `useSyncExternalStore` (the correct primitive for subscribing to `matchMedia`, not a lint workaround). The other two (`useDrawingManager`, `useAnnotations`) are legitimate "initialize once a dependency becomes ready" effects — the same shape `useMapEngine.ts` already uses unflagged — and got a justified inline suppression instead of a forced rewrite.
- Mobile bottom-toolbar collapse (tool rail → `Pin · Draw · Measure · Layers · More`) from the "Mobile vs. web" section below was **not built** — only `AnnotationPanel`'s mobile bottom-sheet behavior was in this phase's actual scope. Tracked as a known follow-on, not a regression.
- Circle resize-after-creation (via `TerraDrawSelectMode`'s `scaleable` flag) is wired but **not yet manually verified** — the "known risk" flagged in this doc's original draft. If it doesn't work cleanly, drop `scaleable` and ship circle as create/delete-only.

This is the detailed task breakdown for [../PLANNING.md](../PLANNING.md) Phase 2 / [../PRODUCT_REQUIREMENTS.md](../PRODUCT_REQUIREMENTS.md) Phase 2 ("the user can investigate a location manually"). It assumes the reader has skimmed [../AGENTS.md](../../AGENTS.md), [plan-1.md](plan-1.md), and the current `src/` tree it produced.

## Objective

By the end of this phase: the user can select a drawing tool (pin, line, polygon, circle, or text note), draw directly on the map with live visual feedback, click any drawn annotation to open a contextual panel (title/description/tags), and edit or delete it. Everything persists per-project and survives reload. No measurement values shown yet (that's Phase 7), no image overlays (Phase 3), no layers beyond the base map (Phase 5).

## Scope

**In scope:** the five annotation types from [../DATA_MODEL.md](../DATA_MODEL.md) (`point`, `line`, `polygon`, `circle`, `text`) — create, select, edit (geometry + title/description), delete, persist. Tool rail UI. Contextual annotation panel (desktop side panel / mobile bottom sheet).

**Explicitly out of scope (do not build ahead of schedule):** live distance/area display while drawing (Phase 7 — Turf.js isn't installed yet, and shouldn't be for this phase), image overlay (Phase 3), any layer beyond the base map (Phase 5), photo/file attachments on annotations (schema has `attachments: [Attachment.id]` but `Attachment` itself and its upload/Storage plumbing are Phase 3 work — leave the field as an empty array for now). Undo/redo is a should-have, not a blocker — see Task 6.

## A new dependency decision to confirm before Task 1: a drawing library

MapLibre GL JS ships no drawing tools — only raw map/source/layer primitives. Hand-rolling vertex-by-vertex click handling, drag-to-edit, and delete for four distinct geometry modes (point/line/polygon/circle) is a meaningful amount of interaction-state code, and it's exactly the kind of "looks right, is geographically wrong" surface [../GIS_ARCHITECTURE.md](../GIS_ARCHITECTURE.md) warns about (e.g. an editable vertex silently corrupting winding order on a polygon).

**Recommendation: [Terra Draw](https://github.com/JamesLMilner/terra-draw)** — maintained, TypeScript-native, renderer-agnostic with a dedicated MapLibre GL JS adapter, and covers point/linestring/polygon/circle draw+edit+delete modes out of the box. This is the same "don't reinvent well-tested logic" reasoning [plan-1.md](plan-1.md) used for adopting MapLibre's built-in `NavigationControl`/`ScaleControl` instead of hand-building zoom/compass/scale — applied one level up, to drawing instead of map chrome.

This is a new dependency (see [../AGENTS.md](../../AGENTS.md) rule 9, "avoid unnecessary dependencies") and isn't yet blessed by an ADR. Confirm this choice (or an alternative) before starting Task 1 — if accepted, it's worth a short ADR (`0006-drawing-library.md`) for the same reason the map engine and storage choices got one, since swapping it later would mean rewriting all of Tasks 1–2.

**Text annotations are not a Terra Draw mode.** A "text" annotation is a point placed by a dedicated Note tool, rendered as a text label instead of a pin icon, with the contextual panel opening automatically on creation so the user can type the label immediately. This is custom code either way (Terra Draw has no "labeled text point" primitive) but is small (a MapLibre `Marker` with a DOM element, same pattern as the ephemeral search marker already built in Phase 1's `ProjectWorkspace.tsx`).

## A data-model note: circles are stored as polygons

[../DATA_MODEL.md](../DATA_MODEL.md)'s `Annotation.geometry` is documented as "GeoJSON geometry" for every type, but GeoJSON has no native `Circle` geometry. Terra Draw's circle mode outputs a many-vertex `Polygon` approximation, which is what gets stored — the `type: "circle"` tag on the `Annotation` is what tells the UI to treat it as a circle (e.g. for the "Uncertainty visualization" styling in [../design/MAP_INTERACTIONS.md](../design/MAP_INTERACTIONS.md)), not a different geometry shape. This keeps `geometry` uniformly valid GeoJSON for every annotation type, which matters for the GeoJSON import/export round-trip in Phase 4. If Phase 7's spatial analysis later needs an exact center+radius rather than a polygon approximation (e.g. for a precise buffer calculation), derive it then via Turf's polygon utilities rather than adding a parallel `radius` field now — don't solve that problem before it's real.

## Task breakdown

### 1. Drawing interaction layer (`src/map/`, `src/gis/`)
- [x] Terra Draw confirmed by the user; `terra-draw` + `terra-draw-maplibre-gl-adapter` installed.
- [x] `src/map/DrawingManager.ts` — wraps Terra Draw: `start(tool)`, `stop()` (returns to select mode — see implementation notes above for why this isn't Terra Draw's own `stop()`), `addExistingFeature`, `removeFeature`, `on(event, callback)` for `create`/`update`/`select`/`deselect`, `destroy()`.
- [x] `src/gis/annotationGeometry.ts` — `validateDrawnFeature`, `toAnnotationGeometry`, `annotationTypeForTool`, `locationSummary`. Circle→polygon mapping lives here.
- [x] Unit tests (`tests/unit/gis/annotationGeometry.test.ts`, 19 cases): valid/degenerate/unclosed-ring/holed/mismatched-type/out-of-bounds/oversized cases per tool, circle-as-polygon tagging, `locationSummary` centroid check. All passing.

### 2. Tool rail UI (`src/components/map/`, `src/components/shell/`)
- [x] `ToolRail.tsx` — right-side, 34px wide, 5 icon buttons (Pin/Line/Polygon/Circle/Note) with `Tooltip`, accent-colored active state via a `data-active` attribute.
- [x] Direct-manipulation flow via `DrawingManager` — see Task 7 wiring in `ProjectWorkspace.tsx`. `Esc` cancels via `useToolShortcuts`.
- [x] `useToolShortcuts.ts` — `P`/`L`/`G`/`C`/`N` + `Esc`, guarded against firing while an input/textarea is focused. `docs/design/MAP_INTERACTIONS.md`'s shortcut line updated to include `C` in the same change.

### 3. Annotation data layer (`src/projects/`, `src/storage/`)
- [x] `Annotation` modeled for a Firestore subcollection (`projects/{projectId}/annotations/{annotationId}`) — types written in `src/projects/annotations/types.ts`; the real Firestore calls themselves are Track B (below).
- [x] `src/storage/annotations.ts` — `createAnnotation`/`updateAnnotation`/`deleteAnnotation`/`listAnnotations(projectId)`, Track A body (in-memory `Map`, seeded from `mockAnnotations.ts`). Re-validates geometry via `annotationGeometry` before accepting — this is the actual security enforcement point.
- [x] `src/projects/annotations/useAnnotations.ts` — Track A body (local `useState`, optimistic updates). Live `onSnapshot` is Track B.
- [x] Built against an in-memory mock store first, per the "if Track B is still blocked" fallback — Firebase remains blocked as of this writing.

### 4. Annotation contextual panel (`src/components/annotations/`)
- [x] `AnnotationPanel.tsx` (+ `AnnotationForm.tsx`, `DeleteAnnotationDialog.tsx`) — title/description/tags/location, edit/delete. Desktop: `Card` as a real flex sibling (not floating — avoids the top-right `NavigationControl`). Mobile (`useMediaQuery`, `<768px`): `Sheet` with `side="bottom"`.
- [x] Delete requires confirmation (`DeleteAnnotationDialog`, shadcn `Dialog`).
- [x] Freshly-placed `text` annotations auto-open the panel with the title field focused (`justCreatedId` state in `ProjectWorkspace.tsx`).

### 5. Firestore rules + Emulator tests for annotations
- [ ] **Not started — blocked on Task 1's Firebase prerequisite (same as Phase 1).** `firestore.rules`' `annotations` subcollection match block and `tests/integration/annotations-rules.test.ts` are Track B work; see that section below for the exact rule/test shape planned.

### 6. Undo/redo (should-have, not a Task 1–5 blocker)
- [ ] A small history stack (last-N operations: create/edit/delete) scoped to the current drawing session, `Ctrl/Cmd+Z` / `Ctrl/Cmd+Shift+Z` — see [../design/MAP_INTERACTIONS.md](../design/MAP_INTERACTIONS.md) §Undo/redo ("should not be deferred indefinitely," but explicitly not a hard MVP blocker). Sequence this after Tasks 1–5 are working, not before.

## Tech stack for this phase

Terra Draw (+ MapLibre adapter) — pending confirmation above · Firestore `annotations` subcollection ([../DATA_MODEL.md](../DATA_MODEL.md), [../ADR/0002-storage.md](../ADR/0002-storage.md)). No new UI framework or state-management dependency needed — Phase 1's React Context approach was flagged as possibly outgrowing itself around exactly this kind of tool-selection/in-progress-geometry state (see [../PLANNING.md](../PLANNING.md) Phase 1 decision notes); if `ToolRail`'s active-tool state and `DrawingManager`'s in-progress-feature state start fighting each other through prop-drilling, that's the signal to introduce a small store (e.g. Zustand) — don't add one preemptively.

## UI / fonts / theme

No new theme decisions. Reuses Phase 0/1's tokens; monospace font for the coordinate readout in `AnnotationPanel`. Active-tool and selected-annotation states use the accent color per [../PLANNING.md](../PLANNING.md) §Fonts & theme — sparingly, not as a fill.

## Flow path delivered

`drop pin / draw line-polygon-circle / add note` — golden journey steps from [../design/USER_FLOWS.md](../design/USER_FLOWS.md), continuing directly from Phase 1's `create project → open map → search a location`.

## Mobile vs. web

Tool rail collapses into the bottom toolbar (`Pin · Draw · Measure · Layers · More` — "Measure" and "Layers" are placeholders for Phases 5/7, inactive for now) below `768px`. The `AnnotationPanel` becomes a bottom sheet instead of a side panel. Drawing itself (tap-to-place, drag vertices) needs to work on touch — verify Terra Draw's touch support specifically, don't assume desktop mouse-event parity. See [../PLANNING.md](../PLANNING.md) §Mobile-vs-web summary.

## Component library map

Building on Phase 1's substitution precedent (ReUI's hosted registry paywalled a basic `Card` — see [plan-1.md](plan-1.md) implementation notes) — pull these from the **default shadcn registry** unless a specific ReUI-hosted component is confirmed free at implementation time:

| UI element | Source |
|---|---|
| Tool rail icon buttons + tooltips | shadcn `Button` + `Tooltip` (added, default registry — no paywall this time) |
| Active-tool styling | `data-active` attribute + Tailwind on `Button`, no new primitive |
| Desktop annotation panel | shadcn `Card`, as a real flex sibling — `Popover` skipped, not needed |
| Mobile annotation bottom sheet | shadcn `Sheet`, `side="bottom"` (added, default registry) |
| Delete confirmation | shadcn `Dialog` (already had it from Phase 1) |

## Security checklist for this phase (see ../SECURITY_TEST_PLAN.md)

- [ ] Unauthenticated Firestore read on any `annotations` subcollection → denied. **(Track B — not yet applicable, no real Firestore rules deployed.)**
- [ ] User A reads/edits/deletes User B's project's annotations → denied. **(Track B.)**
- [x] No `allow read, write: if true` anywhere in `firestore.rules` (unchanged from Phase 1 — no annotations block added yet).
- [x] Drawn geometry is validated (type, coordinate bounds/count) before being written — `createAnnotation`/`updateAnnotation` in `src/storage/annotations.ts` call `validateDrawnFeature` before accepting anything, never trusting Terra Draw's raw output as pre-sanitized.

## Exit criteria

[../ACCEPTANCE_CRITERIA.md](../ACCEPTANCE_CRITERIA.md) §Drawing, in full: every annotation type renders at the correct geographic location, persists on save, survives reload, and can be edited or deleted afterward. **Not yet met** — "survives reload" needs Track B (real Firestore); everything else is built and passing automated checks (build/lint/typecheck/unit tests) plus a basic manual smoke test (dev server, tool-rail buttons render, no runtime errors). Full interactive drawing (actually dragging vertices, resizing a circle, touch behavior) has **not** been manually verified in a real browser this session — flagged as the next thing to check, not assumed working.

## Open questions / blockers

- **Firebase project not yet created — blocks all of Track B** (Task 3's real persistence, Task 5's rules/tests). Same user action items as [plan-1.md](plan-1.md).
- **Interactive drawing behavior needs real manual verification** (drag vertices, circle resize via `scaleable`, touch support) — automated checks confirm the code compiles and the static markup renders, not that Terra Draw's runtime interaction actually behaves as designed.
- Undo/redo (Task 6) not started — correctly sequenced last, per this doc's own instruction.

## Next

[plan-3.md](plan-3.md) (Phase 3 — Image overlay, the centerpiece feature) — not yet written; write it once this phase is underway, not speculatively now.
