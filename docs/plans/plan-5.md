# Plan 5 — Phase 5: Layer manager

**Status:** Track A built (2026-08-17) — `src/components/layers/LayersPanel.tsx`: collapsible left panel (176px/34px, verified via headless-Chromium screenshot) with a "Base Map" group showing "Streets" (active, checked) and "Satellite" (disabled, tooltip explains the missing verified provider). Mobile (<768px) variant confirmed: no docked stub, a floating toggle opens a bottom Sheet with the same content. Build/lint/tsc clean; no new unit tests needed (purely presentational, nothing pure to test) — existing 74 pass unchanged. Scope is narrower than it first looks — see "A real blocker this plan surfaces, not solves" below, which remains fully open (no second base map exists yet).

This is the detailed task breakdown for [../PLANNING.md](../PLANNING.md) Phase 5 / [../PRODUCT_REQUIREMENTS.md](../PRODUCT_REQUIREMENTS.md) roadmap item 5 ("multiple datasets coexist cleanly"). It assumes the reader has skimmed [../AGENTS.md](../../AGENTS.md), [../PROVIDER_ARCHITECTURE.md](../PROVIDER_ARCHITECTURE.md), [../DATA_SOURCES.md](../DATA_SOURCES.md), and the current `src/map/MapEngine.ts`.

## Objective

By the end of this phase: a collapsible left-side layers panel exists at the validated dimensions (176px expanded / 34px collapsed, per [../design/DESIGN_SYSTEM.md](../design/DESIGN_SYSTEM.md) §Validated layout dimensions), showing a "Base Map" group. Nothing else — see Scope.

## Scope

**In scope:** the layers panel shell (desktop side panel + mobile bottom sheet, matching [../design/MAP_INTERACTIONS.md](../design/MAP_INTERACTIONS.md) §Layers UX's visual language), a "Base Map" group with a "Streets" option (the existing OSM raster style, already active by default) and a visibly-present-but-disabled "Satellite" option explaining why it isn't selectable yet.

**Explicitly out of scope:** the "Government" group (Phase 6 — no government layers exist yet to populate it), the "Your Data"/"Overlays" groups (annotations and image overlay visibility), per-layer opacity controls in the panel, and drag-to-reorder. [../PLANNING.md](../PLANNING.md)'s own Phase 5 section is explicit about this: *"v0.1 (Phases 1–4) only ever needs a base-map toggle... the full grouped panel... is v0.2+ scope... sequence it after Phase 6 starts, not before."* Annotations and overlays already have working visibility/opacity controls today (`AnnotationPanel`, `OverlayControlBar`) — folding them into this panel too is a real v0.2+ task, not a free add-on to sneak into this phase.

## A real blocker this plan surfaces, not solves

**There is no verified second base-map provider today.** [../DATA_SOURCES.md](../DATA_SOURCES.md)'s entire registry has exactly one provider with a usable base-map tile source: OpenStreetMap (`status: experimental`). Every provider that could plausibly supply satellite imagery (Bhuvan, Mapbox, Mappls) is `status: unknown`, `last_verified: NEVER`, with no endpoint on file. [../PROVIDER_ARCHITECTURE.md](../PROVIDER_ARCHITECTURE.md)'s closing rule is unambiguous: *"Invent an endpoint... for a provider that hasn't been verified... stop and ask for verification rather than guessing a plausible-looking URL."* That rule is not optional for this plan.

Practical consequence: a real, functioning "Streets ⇄ Satellite" toggle **cannot be built this phase**. What this plan delivers instead is the panel shell with Streets as the one real, active option, and Satellite rendered as a disabled row with a short explanation (e.g. "Needs a verified satellite provider — see DATA_SOURCES.md") — honest about the gap rather than papering over it with a fake or half-wired second style. **This also means [../ACCEPTANCE_CRITERIA.md](../ACCEPTANCE_CRITERIA.md) §Layer manager's exit criterion (toggle/opacity/reorder across *multiple* layers) cannot be fully satisfied yet** — there's only one real layer to toggle. Full exit-criteria satisfaction is blocked on the same kind of user action as Firebase Track B: someone needs to research and verify a satellite tile provider (following the checklist in [../DATA_SOURCES.md](../DATA_SOURCES.md) "Before adding the first government layer, complete") before a second option can exist.

**No `MapEngine` base-map-switching machinery is built this phase either**, for the same reason: with only one real destination, a generic `setBaseMap(id)`/style-registry abstraction has nothing to prove itself against and would be built purely speculatively — against this project's own "don't design for hypothetical future requirements" rule. Once a second base map is actually verified, *that's* the moment to add the switching method to `MapEngine.ts` alongside it, not before.

**No new domain type or storage is needed.** [../DATA_MODEL.md](../DATA_MODEL.md)'s `Layer` schema (`providerId`, `datasetId`, `sourceMetadata`, etc.) is built for provider-backed layers — squarely a Phase 6 concern once Bhuvan or another verified provider exists. This phase's "Base Map" group is presentational only (which of two hardcoded styles is active), so it needs no `storage/layers.ts`, no Firestore rules, and no `Project.layers` population. When Phase 6 lands, `Layer`/`storage/layers.ts` get built together with the first real provider adapter — not speculatively here.

## Task breakdown

### 1. `src/components/layers/LayersPanel.tsx` (+ collapsed stub)
Desktop side panel, `176px` expanded / `34px` collapsed (mirrors `ToolRail.tsx`'s `34px` right rail, but on the left and collapsible). Collapsed state is a vertical stub with a single icon button (`PanelLeft` or `Layers` from `lucide-react`) that expands it; expanded state shows a "Base Map" heading and two rows:
- **Streets** — active (visually indicated, e.g. a filled radio dot), clickable but a no-op since it's already the only real option.
- **Satellite** — `disabled`, wrapped in a `Tooltip` (reuse `@/components/ui/tooltip`, same pattern as `ToolRail.tsx`/`ProjectMenu.tsx`'s disabled-Export-item tooltip) explaining *"Needs a verified satellite imagery provider — see docs/DATA_SOURCES.md."*

No new shadcn component needed — reuse `Tooltip`/`Button` already in the project.

### 2. Mobile variant
Bottom `Sheet` (reuse `@/components/ui/sheet`, same `useMediaQuery("(max-width: 767px)")` gate `AnnotationPanel.tsx`/`OverlayControlBar.tsx` already use), triggered from a small toggle affordance rather than a permanently-docked 34px stub (no persistent left rail on mobile, consistent with [../PLANNING.md](../PLANNING.md)'s mobile-vs-web table: *"Layers panel | left side panel, 176px, collapsible | bottom sheet"*).

### 3. `ProjectWorkspace.tsx` integration
Mount `LayersPanel` as the **first** child of the existing `<div className="flex min-h-0 flex-1">` row (mirrors `ToolRail` being the last child on the right) — collapsed by default, matching [../design/DESIGN_SYSTEM.md](../design/DESIGN_SYSTEM.md)'s framing that "with both panels collapsed, the map occupies roughly 97% of the viewport." New local state: `layersPanelCollapsed` (no persistence needed — resets to collapsed on reload, same as `activeTool`/selection state today).

### 4. Docs
- [../PLANNING.md](../PLANNING.md) Phase 5 section: add the `**Detailed task plan:**` pointer line (same pattern as Phases 1–4).
- [../plans/README.md](README.md): add the `plan-5.md` row.
- [../ACCEPTANCE_CRITERIA.md](../ACCEPTANCE_CRITERIA.md): no edit needed — the existing §Layer manager criterion already correctly describes the *eventual* full feature; this phase's partial delivery doesn't need the doc weakened, just called out honestly in `plan-5.md`'s own status (this file) once built.

## Tech stack for this phase

No new npm dependency. No new shadcn component (reuses `Tooltip`, `Button`, `Sheet`, all already added).

## UI / fonts / theme

`176px` / `34px`, per [../design/DESIGN_SYSTEM.md](../design/DESIGN_SYSTEM.md) §Validated layout dimensions — exact values, not approximations. Disabled row styling matches the existing disabled-menu-item convention (`ProjectMenu.tsx`'s "Delete Project" stub): muted text, `cursor-not-allowed`, no hover state.

## Flow path delivered

*enable/add layers* (golden journey step) — partially: the panel exists and correctly shows the one real option, but "adding" a second base map isn't possible yet (see blocker above).

## Mobile vs. web

Left side panel (176px/34px) on desktop; bottom sheet on mobile — see [../PLANNING.md](../PLANNING.md) Phase 5's mobile-vs-web row and [../design/MAP_INTERACTIONS.md](../design/MAP_INTERACTIONS.md) §Layers UX.

## Component library map

| UI element | Source |
|---|---|
| Panel shell, collapse toggle | plain `Button`/`div` (same pattern as `ToolRail.tsx`) |
| Disabled option explanation | shadcn `Tooltip` (already added) |
| Mobile variant | shadcn `Sheet` (already added) |

## Security checklist for this phase (see ../SECURITY_TEST_PLAN.md)

- [ ] No client-side or server-side fetch of an unverified provider URL — the disabled Satellite row must not reference or prefetch any endpoint, verified or not (see [../PROVIDER_ARCHITECTURE.md](../PROVIDER_ARCHITECTURE.md) "What an AI coding agent must never do here").
- [ ] Nothing in this phase touches Firestore/Storage rules or cross-project data — the panel is presentational only, so the usual IDOR checklist doesn't apply here (no new resource type is introduced).

## Exit criteria

[../ACCEPTANCE_CRITERIA.md](../ACCEPTANCE_CRITERIA.md) §Layer manager, **partially met by design** — see "A real blocker this plan surfaces, not solves" above. The panel shell, collapse behavior, and the Streets/disabled-Satellite presentation are the testable exit bar for *this* plan; the full toggle/opacity/reorder-across-multiple-layers criterion stays open until a second base map is verified and/or Phase 6 lands.

## Open questions / blockers

- **A satellite (or other second base-map) provider needs to be researched and verified** in [../DATA_SOURCES.md](../DATA_SOURCES.md) before a real toggle can be built — this is a user-driven research/verification step, not something an AI agent should guess at (see [../PROVIDER_ARCHITECTURE.md](../PROVIDER_ARCHITECTURE.md)'s explicit prohibition). Until then, this phase's "Track A" ceiling is the panel shell described above.
- Once a second base map exists: `MapEngine.ts` needs a `setBaseMap`/style-registry method, and `Project`'s schema likely needs a small addition (e.g. a persisted `baseMapId`) to remember the user's choice — neither exists in [../DATA_MODEL.md](../DATA_MODEL.md) today. Deliberately not designed here (see "no speculative machinery" above) — design it together with the second provider, not before.
- Track B (Firestore/Storage) is not blocked by anything new here, since this phase introduces no new persisted resource.

## Next

Phase 6 (Government layers / first provider adapter, Bhuvan) is next in [../PLANNING.md](../PLANNING.md)'s sequence — and per [../PROVIDER_ARCHITECTURE.md](../PROVIDER_ARCHITECTURE.md)'s provider-implementation order, is itself blocked on verifying Bhuvan's endpoint/license/CRS in [../DATA_SOURCES.md](../DATA_SOURCES.md) first. `plan-6.md` — not yet written; write it once that verification work is underway, not speculatively now.
