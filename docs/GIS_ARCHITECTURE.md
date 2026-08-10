# GIS Architecture

This document exists because GIS bugs can look visually correct while being geographically wrong — a marker can render on-screen while being placed at the wrong real-world coordinate, and nobody notices until the data is compared against something else. Read this before writing or reviewing any spatial code.

## Coordinate system

Default application CRS: **WGS84 / EPSG:4326.**

GeoJSON coordinate order: **`[longitude, latitude]`** — this is the GeoJSON spec order, and it is the opposite of how humans usually say coordinates aloud ("latitude, longitude"). Every place lat/lng enters or leaves the application (user input, a provider response, a URL param, a form field) is a place this can silently invert.

**Rule:** never mix `lat, lng` and `lng, lat` ordering without an explicit, named conversion function. Do not write `[coords.lat, coords.lng]` inline in a component — call a named helper (e.g. `toGeoJsonPosition(latLng)`) so the conversion is greppable and testable.

If a provider (WMS/WMTS/government dataset) uses a different CRS, the conversion must happen at the provider adapter boundary (see [PROVIDER_ARCHITECTURE.md](PROVIDER_ARCHITECTURE.md)) — the rest of the app only ever sees WGS84.

## Raster vs. vector

- **Vector** (GeoJSON, markers/lines/polygons/circles, most user data): rendered as MapLibre GeoJSON sources/layers.
- **Raster** (satellite base maps, WMS/WMTS government layers, uploaded image overlays): rendered as MapLibre raster or image sources.

Both can coexist per [ARCHITECTURE.md](ARCHITECTURE.md)'s Layer Manager, each carrying its own opacity/visibility/order.

## Service types (for provider layers)

- **WMS** (Web Map Service) — returns rendered map images per request; simplest to integrate, no client-side styling control.
- **WMTS** (Web Map Tile Service) — pre-tiled raster, more cache-friendly.
- **WFS** (Web Feature Service) — returns vector features (GeoJSON-like), enables client-side styling/analysis.

Bhuvan and most Indian government portals expose WMS/WMTS — see [DATA_SOURCES.md](DATA_SOURCES.md). Confirm which one a given dataset actually offers before assuming vector-level interactivity is possible.

## Image overlay / georeferencing (the centerpiece feature)

### v0.1 — simple four-corner mode

An uploaded image is associated with four geographic coordinates, one per corner:

```text
1 (top-left) ---------------- 2 (top-right)
|                                          |
|                  IMAGE                   |
|                                          |
4 (bottom-left) ------------- 3 (bottom-right)
```

The user drags each corner independently on the map to align the image with real geography. MapLibre's image-source API accepts exactly this four-corner geographic model, which is why MapLibre was chosen — see [ADR/0001-map-engine.md](ADR/0001-map-engine.md).

Required behavior: position adjustment, corner-handle resizing, opacity, visibility toggle, name, save/reload with all four corners restored exactly. See schema in [DATA_MODEL.md](DATA_MODEL.md) `ImageOverlay.coordinates`, and done-criteria in [ACCEPTANCE_CRITERIA.md](ACCEPTANCE_CRITERIA.md).

Rotation is a nice-to-have derived from corner positions, not a separately-stored transform, to avoid two sources of truth for the same visual result.

### Future — advanced control-point mode (not MVP)

For scanned/irregular maps where a simple four-corner affine transform isn't enough:

```text
Image Point 1 → Map Point 1
Image Point 2 → Map Point 2
Image Point 3 → Map Point 3   (+ more as needed)
```

...then compute a geographic transformation (e.g. polynomial/rubber-sheeting) from the control points. This is meaningfully harder (need a transform library, more UI, more validation) and is explicitly deferred — do not build it alongside the four-corner mode.

## Measurement

Turf.js is the calculation library for distance, area, buffer/radius, nearest-feature, intersection, and containment (see [PROJECT_SPEC.md](PROJECT_SPEC.md) §19, §22). Rules:

- Every measurement result must be traceable to the actual geometry used — never display a number without the geometry that produced it being inspectable.
- Unit conversions (m/km/acres/etc.) happen at the display layer, not by storing multiple unit variants of the same measurement.
- Road-impact-analysis style features ("properties within 250m") use real buffer/intersection operations on real geometry — never an approximated/eyeballed count.

## Projections

MapLibre renders in Web Mercator (EPSG:3857) internally regardless of the WGS84 data we feed it — this is normal and doesn't need a manual conversion; MapLibre handles that projection step. The rule above (WGS84 as the *application/storage* CRS) is about what our code and Firestore store and pass around, not about the renderer's internal projection.

## Accuracy / confidence

Never display fabricated numeric accuracy. If a source provides a confidence/accuracy figure, show it; if it doesn't, say "source-dependent" or similar rather than inventing a number — see [PROJECT_SPEC.md](PROJECT_SPEC.md) §4 and §21.

## Testing requirements

Minimum GIS test coverage before a feature ships (see [research/predevelopment-readiness-checklist-raw.md](research/predevelopment-readiness-checklist-raw.md) §37): longitude/latitude ordering, distance calculation, area calculation, polygon validity, coordinate conversion, and image-corner serialization/round-trip.
