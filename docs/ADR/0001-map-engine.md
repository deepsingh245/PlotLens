# ADR 0001 — Map Rendering Engine

## Status

Accepted

## Context

PlotLens needs a web map renderer that supports interactive maps, GeoJSON vector data, raster tiles (base map + government WMS/WMTS layers), image sources with geographic corner positioning (for the image-overlay/georeferencing centerpiece feature — see [../GIS_ARCHITECTURE.md](../GIS_ARCHITECTURE.md)), and custom layers, without locking the entire application to one commercial map vendor (see [../PROJECT_SPEC.md](../PROJECT_SPEC.md) §5, §38 rule 3–4).

## Decision

Use **MapLibre GL JS** as the map rendering engine.

## Reasons

- Open-source, no vendor token required to render a map at all.
- Flexible data sources: GeoJSON, raster tiles, image sources, WMS-compatible raster sources, custom layers.
- Its image-source API natively supports four geographic corner coordinates for an image, which is exactly the model needed for the georeferencing feature.
- Good fit for a GIS-oriented application layering multiple external data sources.

## Alternatives considered

- **Mapbox GL JS** — also supports image sources, raster opacity, interactive layers; capable alternative, but commercial-token-based and would couple the app to one vendor's terms/pricing. Kept as a possible *provider* behind MapLibre or a fallback renderer, not adopted as the primary engine — see [../DATA_SOURCES.md](../DATA_SOURCES.md) Mapbox entry.
- **Leaflet** — considered as a lighter-weight alternative; not chosen because MapLibre's raster/vector/image-source flexibility and GIS-oriented ecosystem fit fits PlotLens's layered-provider architecture better.

## Consequences

- The map/layer UI and `providers/` adapters (see [../PROVIDER_ARCHITECTURE.md](../PROVIDER_ARCHITECTURE.md)) are written against MapLibre's API.
- Mapbox or another renderer remains swappable in principle because GIS logic lives in `gis/`, separate from the renderer (see [../ARCHITECTURE.md](../ARCHITECTURE.md) rule 2), but no renderer swap is planned or should be attempted without a new ADR superseding this one.
