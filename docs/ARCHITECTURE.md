# Architecture

Technical source of truth. Product truth lives in [PROJECT_SPEC.md](PROJECT_SPEC.md); this document covers how the system is built, not what it does.

## System overview

```text
Frontend (Next.js + TypeScript + React)
        ↓
   MapLibre GL JS  (renderer — see ADR/0001-map-engine.md)
        ↓
   Layer Manager
        ↓
 ┌──────────────┬───────────────┬─────────────┬──────────────┐
 Provider        Provider        User data     Image overlays
 (OSM base map)  (Bhuvan, etc.)  (markers,     (georeferenced
                                  lines,        raster)
                                  polygons,
                                  measurements)
 └──────────────┴───────────────┴─────────────┴──────────────┘
        ↓
   Firebase Firestore (project/layer/annotation/overlay metadata)
   Firebase Storage    (images, PDFs, KML/GeoJSON files, attachments)
```

Future (not built now, do not build early): PostgreSQL + PostGIS behind a spatial-analysis service, once Firestore's query/spatial limits actually become a problem — see [ADR/0002-storage.md](ADR/0002-storage.md).

## Module boundaries

```text
src/
├── map/            MapEngine, LayerManager, DrawingManager, MeasurementManager, OverlayManager
├── providers/       osm/, bhuvan/, dataGov/, surveyOfIndia/, state/, custom/  (see PROVIDER_ARCHITECTURE.md)
├── gis/             geojson/, kml/, raster/, georeferencing/, measurements/  (pure spatial logic, no React)
├── projects/        maps/, layers/, annotations/, overlays/, savedViews/     (domain/data layer)
├── storage/         Firebase Storage/Firestore access
└── ai/              Phase 9 only — natural-language query translation, summaries
```

This is a conceptual layout, not a mandate to create every folder on day one — create modules as the corresponding feature is built (Phase 1 needs `map/`, `projects/`; `providers/` and `gis/` grow in Phase 4–6).

## Architecture rule 1 — the map is the primary workspace

Avoid multi-page navigation. Prefer a persistent layout: search bar + project menu on top, layers/tools panel on the side, map filling the rest. Most actions (draw, measure, toggle a layer, adjust overlay opacity) happen without leaving the map. See UX sketch in [research/project-specification-raw.md](research/project-specification-raw.md) §33–35 for the reference layout.

## Architecture rule 2 — GIS logic is separate from UI

Spatial calculations, coordinate transforms, and georeferencing math live in `gis/`, are pure functions with no React/DOM dependency, and are independently unit-testable. React components call into `gis/`; they never reimplement spatial math inline. This exists because GIS bugs can look visually correct while being geographically wrong — see [GIS_ARCHITECTURE.md](GIS_ARCHITECTURE.md).

## Architecture rule 3 — providers are adapters, not hardcoded integrations

Every map/data provider (OSM, Bhuvan, Mappls, data.gov.in, a future state GIS portal) implements the same conceptual contract defined in [PROVIDER_ARCHITECTURE.md](PROVIDER_ARCHITECTURE.md). The map/layer UI calls that contract and never contains provider-specific branching logic. Adding a new provider must not require changing map UI components.

## Data flow

1. User action (draw, upload, toggle layer) → domain module in `projects/` updates in-memory state.
2. `gis/` performs any needed transform/validation (e.g. corner-coordinate math, GeoJSON validation).
3. `map/` (via MapLibre) re-renders the affected layer/source.
4. `storage/` persists the change to Firestore/Storage, scoped to the owning project (see [DATA_MODEL.md](DATA_MODEL.md) and ownership rules in [SECURITY.md](SECURITY.md)).
5. External provider data (`providers/`) is fetched read-only, cached per [DATA_SOURCES.md](DATA_SOURCES.md) caching rules, and never written back to the provider.

## State management

Not yet decided in detail — to be revisited when Phase 1 scaffolding begins. Constraint from this document: whatever is chosen (React context, Zustand, etc.) must not become the place where spatial math lives; it holds UI/app state and delegates calculation to `gis/`.

## API boundary

Internal API routes are documented in [API_CONTRACTS.md](API_CONTRACTS.md). Any server-side route that calls an external provider must go through the provider adapter and its domain allowlist (see [SECURITY.md](SECURITY.md) §SSRF) — never an ad hoc `fetch()` to a user- or config-supplied URL.

## Storage strategy

Firestore holds structured metadata (project, layer, annotation, overlay records). Firebase Storage holds binary content (uploaded images, PDFs, KML/GeoJSON files). See [DATA_MODEL.md](DATA_MODEL.md) for exact schemas and [SECURITY.md](SECURITY.md) for upload validation rules. Large/raw GIS datasets (satellite files, GeoTIFFs, shapefiles) are never committed to Git — see root [.gitignore](../.gitignore).

## Provider abstraction

See [PROVIDER_ARCHITECTURE.md](PROVIDER_ARCHITECTURE.md) for the full contract. Summary: `id`, `name`, `type`, `getCapabilities()`, `getLayers()`, `getLayerMetadata()`, `buildLayerSource()`, `health/status`.
