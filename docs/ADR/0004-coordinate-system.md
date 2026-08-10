# ADR 0004 — Coordinate System Convention

## Status

Accepted

## Context

PlotLens combines data from many sources (user-drawn geometry, uploaded image overlays, GeoJSON imports, government WMS/WFS layers) that may not share a single coordinate reference system or axis order. GIS bugs from coordinate-order or CRS mismatches can look visually plausible while being geographically wrong (a map still renders, a marker still appears — just in the wrong place), making them easy to ship unnoticed. See [../GIS_ARCHITECTURE.md](../GIS_ARCHITECTURE.md) for the full rationale.

## Decision

The application's canonical coordinate system is **WGS84 (EPSG:4326)**, with **GeoJSON coordinate order: `[longitude, latitude]`**, applied consistently across storage ([../DATA_MODEL.md](../DATA_MODEL.md)), application code, and API boundaries. Any source using a different CRS or axis order must be converted at the provider-adapter boundary (see [../PROVIDER_ARCHITECTURE.md](../PROVIDER_ARCHITECTURE.md)) before that data enters the rest of the application.

## Reasons

- WGS84/EPSG:4326 is the de facto standard for GeoJSON and for most consumer-facing GIS/web-mapping data, minimizing conversion needs for the majority of sources (OSM, most government WMS/WFS services, user-drawn geometry).
- A single, named convention makes "did we mix lat/lng order somewhere" a checkable property (grep for the named conversion helper) instead of an implicit, easily-violated assumption.
- MapLibre GL JS renders internally in Web Mercator (EPSG:3857) regardless of the CRS fed to it, so this decision is about what our own code/storage uses — not about fighting the renderer's internal projection.

## Alternatives considered

- **Storing coordinates in whatever CRS/order each provider natively returns** — rejected: this would push CRS-awareness into every consumer of geometry data (UI, measurement code, storage) instead of concentrating it once at the adapter boundary, and would make lat/lng-order bugs far more likely.
- **`[latitude, longitude]` order to match common verbal convention** — rejected: it contradicts the GeoJSON spec order, and every GeoJSON-consuming library (including MapLibre and Turf.js) expects `[lng, lat]` — fighting that convention would create constant friction and bugs at every library boundary.

## Consequences

- Every coordinate conversion must go through a named, testable helper — never an inline `[a.lat, a.lng]`-style swap (see [../GIS_ARCHITECTURE.md](../GIS_ARCHITECTURE.md) rule).
- Provider adapters bear the responsibility of normalizing to WGS84/`[lng, lat]` before returning data to the rest of the app — see [../PROVIDER_ARCHITECTURE.md](../PROVIDER_ARCHITECTURE.md).
- Minimum test coverage includes explicit longitude/latitude-ordering and coordinate-conversion tests (see [../GIS_ARCHITECTURE.md](../GIS_ARCHITECTURE.md) §Testing requirements, [../SECURITY_TEST_PLAN.md](../SECURITY_TEST_PLAN.md)).
