# ADR 0006 — Drawing Library

## Status

Accepted

## Context

Phase 2 ([../plans/plan-2.md](../plans/plan-2.md)) needs the user to draw point/line/polygon/circle annotations directly on the map, with click-to-add-vertex creation, drag-to-edit, and delete. MapLibre GL JS ([ADR/0001](0001-map-engine.md)) ships no drawing tools of its own — only raw map/source/layer primitives. Hand-rolling vertex-by-vertex interaction state for four distinct geometry modes is a meaningful amount of custom code, and it's exactly the kind of "looks visually right, is geographically wrong" surface [../GIS_ARCHITECTURE.md](../GIS_ARCHITECTURE.md) warns about — e.g. a dragged vertex silently breaking a polygon's ring closure.

## Decision

Adopt **[Terra Draw](https://github.com/JamesLMilner/terra-draw)** (`terra-draw` + `terra-draw-maplibre-gl-adapter`) as the drawing engine, wrapped by a first-party `src/map/DrawingManager.ts` so the rest of the app never touches Terra Draw's API directly (same pattern as `MapEngine.ts` wrapping vanilla `maplibre-gl`).

Verified before adoption (2026, this session): `terra-draw` v1.32.3, MIT license, zero runtime dependencies; `terra-draw-maplibre-gl-adapter` v1.4.1, MIT license, `peerDependencies: {"terra-draw": "^1.0.0", "maplibre-gl": ">=4"}` — compatible with the project's installed `maplibre-gl ^6.2.0` (open-ended peer range).

## Reasons

- Same "don't reinvent tested logic" reasoning [ADR/0001](0001-map-engine.md)/Phase 1 used for adopting MapLibre's built-in `NavigationControl`/`ScaleControl` instead of hand-building zoom/compass/scale math — applied one level up, to drawing instead of map chrome.
- Framework-agnostic core with a dedicated MapLibre adapter (also has adapters for Mapbox GL, Leaflet, Google Maps, OpenLayers, ArcGIS) — doesn't lock PlotLens's drawing layer to a renderer-specific library, consistent with [ADR/0001](0001-map-engine.md)'s "don't tightly couple to one map provider" spirit.
- Ships the exact modes needed (`TerraDrawPointMode`, `TerraDrawLineStringMode`, `TerraDrawPolygonMode`, `TerraDrawCircleMode`, `TerraDrawSelectMode`) plus built-in per-mode edit flags (draggable/scaleable/rotateable/resizable coordinates) — covers create *and* edit without custom vertex-drag code.
- Zero runtime dependencies and an active release cadence (verified current version at adoption time) — low supply-chain risk for a personal project.

## Alternatives considered

- **Hand-rolled drawing via raw MapLibre mouse/touch events** — rejected: substantially more code, more surface area for the exact GIS-correctness bugs this ADR's Context section describes, and no meaningful benefit over a maintained library for a personal project.
- **`@mapbox/mapbox-gl-draw`** — rejected: built and typed against Mapbox GL JS specifically; using it with MapLibre requires a compatibility shim and fighting type mismatches, undermining the very reason MapLibre was chosen over Mapbox in [ADR/0001](0001-map-engine.md).

## Consequences

- `package.json` depends on `terra-draw` and `terra-draw-maplibre-gl-adapter`.
- All Terra Draw interaction (mode names, event names, feature ids) is confined to `src/map/DrawingManager.ts` and `src/map/useDrawingManager.ts`. Components and `gis/` code interact only with `DrawingManager`'s own interface.
- Circle annotations are stored as `Polygon` geometry (Terra Draw's own circle-mode output shape) since GeoJSON has no native Circle type — see [../DATA_MODEL.md](../DATA_MODEL.md) and [../design/MAP_INTERACTIONS.md](../design/MAP_INTERACTIONS.md).
- Text annotations are not a Terra Draw mode at all — built separately as a plain MapLibre `Marker` + click handler (no library primitive fits "labeled text point").
- If Terra Draw is ever swapped, only `DrawingManager`/`useDrawingManager` need to change — no other module should reference Terra Draw types directly.
