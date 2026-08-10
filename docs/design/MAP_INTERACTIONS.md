# Map Interactions

How the map itself behaves — tools, layers, overlays, annotations, measurement. Companion to [../GIS_ARCHITECTURE.md](../GIS_ARCHITECTURE.md) (which covers spatial *correctness*; this file covers spatial *interaction*). Source depth: [../research/ui-ux-design-workflow-raw.md](../research/ui-ux-design-workflow-raw.md) §13–21.

## Interaction model — the map behaves like a canvas

Avoid a modal-heavy flow (click tool → open modal → configure → close modal → start drawing). Prefer immediate, direct manipulation: click a tool → cursor changes → draw directly on the map → see a live result → finish. Apply this same philosophy to every drawing/measuring tool (pin, line, polygon, measure, note) — see [../PRODUCT_REQUIREMENTS.md](../PRODUCT_REQUIREMENTS.md) MVP drawing feature list.

## Map tool set

**MVP (v0.1):** Pin, Line, Polygon, Circle, Note, Image Overlay — matches [../PRODUCT_REQUIREMENTS.md](../PRODUCT_REQUIREMENTS.md)'s Drawing scope (marker/line/polygon/circle/text annotation). An earlier version of this list omitted Circle; PRODUCT_REQUIREMENTS.md is the frozen-scope source of truth (see [../README.md](../README.md) index) — reconciled here.

**v0.2+:** Measure Distance, Measure Area, Export.

**Future (do not build before the MVP workflow is stable):** Circle/Radius, Buffer, Route, coordinate conversion, split/merge polygon, elevation, parcel lookup, street/road analysis.

## Layers UX

Layers should read as professional GIS layers while staying understandable to non-GIS users:

```text
LAYERS

Base Map
  ◉ Satellite
  ○ Streets

Government
  ☑ Proposed Roads
  ☐ Zoning

Your Data
  ☑ My Properties
  ☑ Annotations

Overlays
  ☑ 1995 Survey Map      42%
```

Each layer eventually supports: visibility, opacity, rename, reorder, metadata, source, date, legend — see [../DATA_MODEL.md](../DATA_MODEL.md) `Layer` and `ImageOverlay` schemas, and [../PROJECT_SPEC.md](../PROJECT_SPEC.md) §10.

## Image overlay UX (the centerpiece feature)

```text
Add Image Overlay → Select Image → Image appears over map →
Adjust position → Adjust opacity → Lock → Save
```

Controls: opacity slider, move (drag/arrow keys), visibility toggle, and — for v0.1 — the four corner handles described in [../GIS_ARCHITECTURE.md](../GIS_ARCHITECTURE.md) §Image overlay. Rotation/scale are visual conveniences derived from corner positions, not separately stored (see that same doc, to avoid two sources of truth).

Two additional controls, independently validated by both the wireframe exploration ([wireframes/](wireframes/), turn 3a) and later design-prompt research ([../research/ai-design-prompt-pack-raw.md](../research/ai-design-prompt-pack-raw.md)), are worth building alongside the four MVP controls rather than treated as a later add-on:

- **Lock** — prevents accidental movement once alignment is finished. Trivial to build (a boolean gating drag/corner-handle interaction) and cheap insurance against nudging a carefully-aligned overlay while panning the map.
- **Blend mode** (Normal / Multiply / Screen) — lets the overlay visually merge with the base map (e.g. Multiply to let dark base-map features show through a light scanned document) instead of only being a flat, opaque-at-some-percent image on top. This is a CSS/WebGL blend-mode property on the overlay layer, not new stored data beyond one enum field on `ImageOverlay` (see [../DATA_MODEL.md](../DATA_MODEL.md) — add `blendMode: "normal" | "multiply" | "screen"`, default `"normal"`).

Both remain within the existing four-corner overlay feature already committed in [../PRODUCT_REQUIREMENTS.md](../PRODUCT_REQUIREMENTS.md) — they're refinements to *how* opacity/positioning are exposed, not new scope.

A floating contextual control bar (not a side panel) holds opacity, rotation, scale, blend, and lock while an overlay is selected — see the validated layout in [wireframes/](wireframes/) turn 3a, and the component mapping in [../PLANNING.md](../PLANNING.md) Phase 3.

## Image alignment

v0.1 ships the four-corner model: drag each of four corner anchors independently. Future (not MVP): multi-control-point alignment for scanned/irregular maps, evolving into the rubber-sheeting transform described in [../GIS_ARCHITECTURE.md](../GIS_ARCHITECTURE.md) §Future — advanced control-point mode.

## Annotation UX

Clicking an annotation opens a contextual side panel (not a separate page) showing: location, area/measurement if applicable, notes, photos, and sources — mirroring [../DATA_MODEL.md](../DATA_MODEL.md) `Annotation`. Edit and delete actions live in that same panel.

## Measurement UX

Immediate, live feedback while drawing:

```text
Distance:  Measure → click A → move cursor (live distance) → click B → finish
Area:      Measure Area → click points (polygon appears, live area) → finish
```

Display both metric and a locally-useful unit where relevant (e.g. m² and hectares/acres) — see [../GIS_ARCHITECTURE.md](../GIS_ARCHITECTURE.md) §Measurement for the calculation-correctness rules behind these numbers.

## Source-aware UX

Every external layer exposes: source, dataset name, published date, last-checked date, license, and any accuracy caveat — directly surfacing the fields tracked in [../DATA_SOURCES.md](../DATA_SOURCES.md) and [../LICENSES_AND_ATTRIBUTION.md](../LICENSES_AND_ATTRIBUTION.md). This is not optional polish — it's how the app avoids implying false authority (see next section).

## Uncertainty visualization

Do not make all data appear equally authoritative. Use a distinct visual language per data category, e.g.:

```text
Official source        ───────────────
User-drawn              - - - - - - - -
Approximate              · · · · · · · ·
Historical overlay       ───────────────  (distinct color/pattern from "official")
```

When a layer is selected, explain what it represents. **Never visually imply that a user-drawn boundary is a legal property boundary** — this is the UX enforcement of the legal/data principle in [../PROJECT_SPEC.md](../PROJECT_SPEC.md) §4.

## Contextual panels over modals

Prefer side panels for: layer details, annotation details, source details, measurement details. Reserve modals for actions that genuinely need focused confirmation (e.g. destructive delete). This matches core UX principle 11 in [UX_SPECIFICATION.md](UX_SPECIFICATION.md).

## Search

Supports place name, address, coordinates, landmark, PIN code in v0.1-adjacent scope; parcel ID / project name / saved-annotation search is a later addition. Search moves the map — it never navigates the user away from it.

## Undo / redo

Needed for drawing/positioning tools specifically: polygon drawing, line drawing, annotation editing, overlay positioning. Standard shortcuts (Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z). This is listed as a v0.1-adjacent nicety, not a hard MVP blocker, but should not be deferred indefinitely given how easy it is to misplace an overlay corner or a polygon vertex.

## Keyboard shortcuts (indicative, finalize during implementation)

`P` pin · `L` line · `G` polygon · `M` measure · `N` note · `O` overlay · `Esc` cancel current tool · `Space` pan · `Delete` delete selected · `Ctrl/Cmd+Z` undo · `Ctrl/Cmd+Shift+Z` redo. Surface these in tooltips rather than requiring a separate help screen.
