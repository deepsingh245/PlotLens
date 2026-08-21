# Plan 8 — Phase 8: Saved views + investigation timeline

**Status:** Track A built (2026-08-17). Written and implemented in the same session per the user's "continue all — dev only, but runnable" direction; verified via `tsc`/`lint`/`vitest`/`build` only, interactive re-check deferred (no dev server this session, at the user's request).

This is the detailed record for [../PLANNING.md](../PLANNING.md) Phase 8 / [../PRODUCT_REQUIREMENTS.md](../PRODUCT_REQUIREMENTS.md) roadmap item 8 ("preserve the reasoning behind an investigation"). Depends on Phases 1–3 (map, drawing, overlays), all built; also builds on Phase 7's measurement flow as one of the timeline's auto-logged event sources.

**Before this phase could start, per [../PLANNING.md](../PLANNING.md)'s own note, [../ACCEPTANCE_CRITERIA.md](../ACCEPTANCE_CRITERIA.md) needed a §Saved views entry — it didn't have one. Added in this same change** (a Given/When/Then pair for saved-view restore and for auto-logged timeline entries).

## Objective

The user can save the current map view (center/zoom/bearing/pitch + selected feature) under a name and restore it later exactly; a simple, append-only timeline shows what happened in the investigation (annotations created, overlays added, measurements taken) in order, without manual logging, plus an option to jot a manual note.

## Scope

**In scope:** `SavedView` create/list/restore/delete; `InvestigationEvent` auto-logging for annotation creation, overlay creation, and measurement-taken; a manual "add note" entry point; a single slide-over `HistoryPanel` (not two separate UIs) housing both.

**Explicitly out of scope:** editing/deleting individual timeline events (an *append-only* log, matching [../PROJECT_SPEC.md](../PROJECT_SPEC.md) §25's "simple event logging, not a full audit system"); `activeLayers` on `SavedView` staying meaningfully populated (there are no provider-backed `Layer` records yet — Phase 6 is blocked — so this field is always `[]` for now, same "field exists in the schema, stays empty until its dependency phase lands" treatment Phase 3's `attachments` got); logging overlay/annotation *edits* or *deletes* to the timeline (only creation is logged this pass, to keep the log meaningfully sparse rather than noisy).

## Technical decisions this plan resolves

**One `HistoryPanel`, a slide-over `Sheet` (side="right", the shadcn default), not a permanently-docked panel or two separate UIs.** Unlike `AnnotationPanel`/`OverlayControlBar` (contextual to a selected object) or `LayersPanel` (always relevant, so worth a persistent docked stub), saved views and the timeline are occasional project-level lookups — a slide-over triggered from a new `History` icon button in `TopBar.tsx` works identically on desktop and mobile without a separate branch, unlike every other panel in this app so far.

**`MapEngine.flyTo()` widened to accept bearing/pitch, and a new `getViewState()` method** — restoring a saved view needs all four (center/zoom/bearing/pitch per [../DATA_MODEL.md](../DATA_MODEL.md)'s `SavedView.map`), and capturing them needs a clean read, not `ProjectWorkspace.tsx` reaching into `engine.getMap()` directly for something this reusable.

**Auto-logging hooks into the three existing creation paths (draw-tool `create`, text-tool click handler, `AddOverlayDialog`'s `onConfirm`) plus the measurement `create` branch Phase 7 added — no new event bus, no generic "log everything" middleware.** Three or four call sites calling `createEvent(...)` directly is simpler and more traceable than an abstraction for something this small ("simple event logging, not a full audit system").

**A `measurementResultRef` alongside the existing `measurementResult` state**, so the `create`-handler's measurement branch (which doesn't re-subscribe on every draft vertex) can read the latest computed value without a stale closure — a targeted fix, not a broader refactor of how that state flows.

## What was built

- `src/map/MapEngine.ts`: `flyTo()` widened to `(center, { zoom?, bearing?, pitch? })`; new `getViewState(): MapViewState`.
- `src/projects/savedViews/` (`types.ts`, `mockSavedViews.ts`, `useSavedViews.ts`) + `src/storage/savedViews.ts` — mirrors the existing annotations/overlays Track A pattern exactly.
- `src/projects/investigationEvents/` (`types.ts`, `mockInvestigationEvents.ts`, `useInvestigationEvents.ts`) + `src/storage/investigationEvents.ts` — same pattern, append-only (no update/delete).
- `src/components/timeline/HistoryPanel.tsx` + `SaveViewDialog.tsx`: saved-views list (restore on click, delete on hover), a reverse-chronological event list with a per-type icon, and a manual note-add row.
- `src/components/shell/TopBar.tsx`: new `History` icon button opening the panel.
- `src/components/projects/ProjectWorkspace.tsx`: wires both hooks, the four auto-logging call sites, and the save/restore/delete/add-note handlers.
- `docs/ACCEPTANCE_CRITERIA.md`: new §Saved views + investigation timeline entry (added first, per [../PLANNING.md](../PLANNING.md)'s note).

## Tech stack for this phase

No new dependency — plain `Date`/`toLocaleString()` for timestamps, no date-formatting library added for a single display use.

## UI / fonts / theme

Reuses existing `Sheet`/`Button`/`Input` primitives; event-type icons reuse icons already imported elsewhere in the app (`MapPin`, `ImagePlus`, `Ruler`, `StickyNote`) rather than introducing new ones.

## Flow path delivered

*save investigation* / *revisit why a property was interesting* — per [../PLANNING.md](../PLANNING.md) Phase 8.

## Mobile vs. web

No separate branch needed — a slide-over `Sheet` behaves the same on both, per [../PLANNING.md](../PLANNING.md) Phase 8's own note that the timeline list "is naturally responsive."

## Component library map

| UI element | Source |
|---|---|
| History panel | shadcn `Sheet` (already added) |
| Save-view dialog | shadcn `Dialog`/`Input`/`Label` (already added) |
| Timeline entries | Plain list + existing icons, no dedicated Timeline/Stepper primitive (none is actually available in this project's component set — same "substitute a plain primitive" precedent as prior phases) |

## Exit criteria

[../ACCEPTANCE_CRITERIA.md](../ACCEPTANCE_CRITERIA.md) §Saved views + investigation timeline (added this phase) — both Given/When/Then pairs are met by the Track A implementation above.

## Verification

1. `npx tsc --noEmit` / `npm run lint` / `npm run build` — clean.
2. `npm run test` — no new pure-logic unit tests needed (this phase is CRUD plumbing + UI wiring, matching the existing untested-at-the-unit-level precedent for `storage/annotations.ts`/`storage/overlays.ts`); full suite (80 tests) still passes unchanged.
3. **Not yet done this session:** interactive verification — save a view, change the map, restore it and confirm center/zoom/bearing/pitch and selection all return exactly; draw an annotation/overlay/measurement and confirm each logs a timeline entry in order; add a manual note. Deferred at the user's explicit request to keep this pass code-only.

## Open questions / blockers

- None novel — no Firebase/provider prerequisite for Track A. Track B (real Firestore persistence for `SavedView`/`InvestigationEvent`) is blocked on the same Firebase project prerequisite as every other phase.

## Next

Phase 9 (AI) is explicitly deferred/not committed in [../PLANNING.md](../PLANNING.md) — *"nothing here is scheduled or designed in detail yet"* — and gated on Phases 1–8 working reliably first. With Phase 8 built, every phase up to the AI phase and the hard-gated Phase 6 (Bhuvan) is now at least Track-A-buildable; the next real work is either the deferred interactive verification pass across Phases 5–8, or clearing one of the two standing blockers (a Firebase project for Track B, or a verified second provider for Phases 5–6).
