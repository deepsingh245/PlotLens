# Competitive / Reference Analysis

Purpose: confirm PlotLens is a legitimate, scoped slice of an existing product category — not an arbitrary feature collection — and identify what to deliberately *not* rebuild. Source depth: [research/predevelopment-readiness-checklist-raw.md](research/predevelopment-readiness-checklist-raw.md) §1, §12.

| Product | Study for | Do NOT try to match |
|---|---|---|
| **QGIS** | Georeferencing UX, raster/image overlays, vector layers, measurements, KML/GeoJSON/Shapefile support, map composition | Full desktop-GIS feature breadth. PlotLens is the "simpler, modern, web-first, personal investigation workflow" slice of what QGIS does. |
| **ArcGIS / ArcGIS Pro** | What a mature property/site-analysis workflow looks like: parcel boundaries, aerial imagery, zoning/planning, road access, demographics, flood risk, infrastructure | Geoprocessing depth, suitability/weighted-overlay analysis, enterprise workflows. |
| **Mappls** | India-specific search/geocoding/POIs/administrative-boundary/transportation data; a candidate commercial provider *behind* MapLibre, not a replacement for it | Do not assume it replaces MapLibre as the renderer. |
| **Bhuvan (NRSC)** | India government GIS via WMS/WMTS: satellite imagery, admin boundaries, land-use/cover, water, terrain, flood layers | Assuming any given layer is publicly/freely consumable without verification — see [DATA_SOURCES.md](DATA_SOURCES.md). |
| **Google Earth / Google Maps** | Satellite visualization UX, place discovery, historical-imagery concepts | Never copy Google imagery/data assets into PlotLens or assume a screenshot is freely reusable. |
| **Mapbox** | Web-mapping ecosystem, image-source/raster-opacity patterns | Full adoption as the only map provider — keep it optional/replaceable behind MapLibre. |
| **MapLibre** | Chosen renderer — open, flexible, good raster/vector/image-source support | — |

## What this confirms about PlotLens's direction

Modern real-estate GIS workflows commonly combine: parcel boundaries, aerial imagery, zoning/planning, road access, demographics, flood risk, competing developments, infrastructure, plus photos and maps in a single investigation. PlotLens's layer+investigation model (§2 of [PROJECT_SPEC.md](PROJECT_SPEC.md)) matches this pattern rather than inventing a new one.

## What this tells us to avoid overbuilding

QGIS/ArcGIS both demonstrate a huge surface area (geoprocessing, suitability analysis, enterprise data pipelines) that is explicitly **not** the goal — see non-goals in [PRODUCT_REQUIREMENTS.md](PRODUCT_REQUIREMENTS.md). PlotLens's differentiator is ease of georeferencing + investigation record-keeping for one person, not professional GIS-analyst tooling.
