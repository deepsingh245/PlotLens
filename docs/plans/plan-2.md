# Plan 2 — Phase 2: Drawing

**Status:** drafted, not started. **Depends on:** Phase 1 exit criteria met — see [../ACCEPTANCE_CRITERIA.md](../ACCEPTANCE_CRITERIA.md) §Project system. As of this writing, Phase 1 Track A (map/shell/search) is complete but Track B (real Firestore persistence) is still blocked on the user creating a Firebase project — see [plan-1.md](plan-1.md). This phase follows the same Track A/B split for the same reason; if Firebase is already set up by the time this phase starts, skip straight to full persistence in Task 3 rather than building a mock-data track first.

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
- [ ] Confirm the Terra Draw decision above (or the chosen alternative); install it and its MapLibre adapter.
- [ ] `src/map/DrawingManager.ts` — wraps the Terra Draw instance the same way `MapEngine.ts` wraps vanilla MapLibre: `start(mode)`, `stop()`, `on(event, callback)` for finish/edit/delete events, `getFeatures()`. Keeps Terra Draw's API out of React components directly, matching [../ARCHITECTURE.md](../ARCHITECTURE.md) rule 2.
- [ ] `src/gis/annotationGeometry.ts` — validates a drawn feature before it's treated as a savable `Annotation` (geometry type matches the active tool, coordinate count is bounded per [../SECURITY.md](../SECURITY.md) §GeoJSON Security) and converts Terra Draw's output into the `Annotation.geometry` shape. This is where the "circle → polygon" mapping from above lives, not inline in a component.
- [ ] Unit tests: geometry validation accepts well-formed features and rejects a degenerate one (e.g. a 1-point "polygon"), per the minimum GIS test coverage in [../GIS_ARCHITECTURE.md](../GIS_ARCHITECTURE.md) §Testing requirements.

### 2. Tool rail UI (`src/components/map/`, `src/components/shell/`)
- [ ] `ToolRail.tsx` — right-side, **34px** wide (validated dimension, [../design/DESIGN_SYSTEM.md](../design/DESIGN_SYSTEM.md)), icon buttons for Pin / Line / Polygon / Circle / Note, each with a tooltip and an obvious active state (accent-colored per [../design/DESIGN_SYSTEM.md](../design/DESIGN_SYSTEM.md) — "accent only for active/selected states").
- [ ] Direct-manipulation flow, not modal-first: click tool → cursor changes → draw on map → finish (double-click/Enter for line/polygon, single click for pin/note) — see [../design/MAP_INTERACTIONS.md](../design/MAP_INTERACTIONS.md) §Interaction model. `Esc` cancels the current in-progress draw.
- [ ] Keyboard shortcuts per [../design/MAP_INTERACTIONS.md](../design/MAP_INTERACTIONS.md) §Keyboard shortcuts (`P`/`L`/`G`/`N`, plus `C` for Circle — not yet listed there, add it in the same change): surfaced as tooltips, not a separate help screen.

### 3. Annotation data layer (`src/projects/`, `src/storage/`)
- [ ] Model `Annotation` as a Firestore **subcollection** of its project (`projects/{projectId}/annotations/{annotationId}`), not a top-level collection — this lets ownership be enforced by checking the parent project's `ownerId` (see Task 5's rules), consistent with the tree in [../SECURITY.md](../SECURITY.md) §Authorization model.
- [ ] `src/storage/annotations.ts` — CRUD: `createAnnotation`, `updateAnnotation` (geometry and/or title/description/tags), `deleteAnnotation`, `listAnnotations(projectId)`.
- [ ] `src/projects/annotations/useAnnotations.ts` — live `onSnapshot` subscription scoped to the open project, replacing any Track A mock state.
- [ ] **If Track B from Phase 1 is still blocked:** build this task against an in-memory mock store first (same pattern as `src/projects/mockProjects.ts`) so Tasks 2 and 4 aren't blocked waiting on Firebase; swap in the real Firestore-backed version once unblocked, per [plan-1.md](plan-1.md)'s Track A/B precedent.

### 4. Annotation contextual panel (`src/components/annotations/`)
- [ ] `AnnotationPanel.tsx` — opens when an annotation is clicked/selected: title, description, tags, geometry-derived location (reuse `src/lib/format.ts`'s `formatCoordinate` for a point; a line/polygon shows its first vertex or centroid, not a raw coordinate array), edit and delete actions. Desktop: side panel or floating card, never a full-page navigation. Mobile (`<768px`): bottom sheet.
- [ ] Delete requires a confirmation step (destructive action) — this is one of the "genuinely need focused confirmation" cases [../design/MAP_INTERACTIONS.md](../design/MAP_INTERACTIONS.md) §Contextual panels over modals carves out for a modal/dialog rather than the panel itself.
- [ ] For a freshly-placed `text` annotation, open this panel automatically so the label can be typed immediately (see the data-model note above).

### 5. Firestore rules + Emulator tests for annotations
- [ ] Extend `firestore.rules` with an `annotations` subcollection match block under `projects/{projectId}`, checking the *parent* project's `ownerId` via `get(/databases/$(database)/documents/projects/$(projectId)).data.ownerId` — deny-by-default still applies via the existing top-level catch-all.
- [ ] Extend `tests/integration/firestore-rules.test.ts` (or add a sibling file) with the same IDOR matrix Phase 1 used for `Project`, applied to `annotations`: unauthenticated denied, owner CRUD succeeds, a second user's read/update/delete all denied — see [../SECURITY_TEST_PLAN.md](../SECURITY_TEST_PLAN.md).

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
| Tool rail icon buttons + tooltips | shadcn `Button` (already added) + `Tooltip` (not yet added — `npx shadcn@latest add tooltip`) |
| Active-tool styling | CSS state on `Button`, no new primitive |
| Desktop annotation panel | shadcn `Card` (already added) or `Popover` (not yet added) |
| Mobile annotation bottom sheet | shadcn `Sheet` / Base UI `Drawer` primitive (not yet added — evaluate `sheet` vs. building on the `Dialog` primitive already in the project) |
| Delete confirmation | shadcn `Dialog` (already added) |

## Security checklist for this phase (see ../SECURITY_TEST_PLAN.md)

- [ ] Unauthenticated Firestore read on any `annotations` subcollection → denied.
- [ ] User A reads/edits/deletes User B's project's annotations → denied.
- [ ] No `allow read, write: if true` anywhere in the updated `firestore.rules`.
- [ ] Drawn geometry is validated (type, coordinate bounds/count) before being written — never trust Terra Draw's raw output as pre-sanitized, per [../DATA_MODEL.md](../DATA_MODEL.md) §Validation rules ("apply regardless of Security Rules").

## Exit criteria

[../ACCEPTANCE_CRITERIA.md](../ACCEPTANCE_CRITERIA.md) §Drawing, in full: every annotation type renders at the correct geographic location, persists on save, survives reload, and can be edited or deleted afterward.

## Open questions / blockers

- **Drawing library choice (Terra Draw vs. an alternative) needs confirmation before Task 1** — see "A new dependency decision to confirm" above.
- **Firebase project** — if still not created by the time this phase starts, Task 3 follows the same Track A (mock data) / Track B (real Firestore) split as [plan-1.md](plan-1.md); resolve the same way (user creates the project, fills in `.env.local`).
- Whether Terra Draw's touch/mobile support is solid enough to ship without a fallback — verify early in Task 1 rather than discovering it late in Task 2.

## Next

[plan-3.md](plan-3.md) (Phase 3 — Image overlay, the centerpiece feature) — not yet written; write it once this phase is underway, not speculatively now.
