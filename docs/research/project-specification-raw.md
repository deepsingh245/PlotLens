# PlotLens — Project Specification & AI Context

> **Working name:** PlotLens  
> **Tagline:** Investigate the land. See what surrounds it.
>
> **Project type:** Personal mini-project / vibe-coding project
>
> **Primary idea:** A personal GIS-style workspace for investigating land, property, roads, government infrastructure projects, maps, satellite imagery, uploaded map images, and spatial annotations.

---

## 1. Project Vision

PlotLens is **not intended to be another Google Maps clone** and is not initially intended to be a public/commercial property marketplace.

The core concept is:

> A personal GIS investigation workspace for property, land and infrastructure research.

The user should be able to create independent map projects, place properties/locations on a map, add government/open-data layers, upload old maps or photographs, georeference those images against the real map, reduce their opacity, and annotate/measure/interrogate the geography.

The application should make it easy to answer questions such as:

- Where exactly is this property?
- What roads surround it?
- Is there a proposed/new road nearby?
- What government/infrastructure layers are relevant?
- What is the distance from the property to a road/highway/water body/etc.?
- How does an old map compare with current geography?
- What areas/features fall within a particular radius?
- What have I previously investigated about this property?
- Can I overlay a scanned government map on current satellite imagery?
- Can I save a complete investigation and reopen it later?

---

# 2. Core Product Philosophy

Build the application around **layers and investigations**, not around property listings.

The mental model should be:

```text
Project
  ├── Base map
  ├── Government layers
  ├── External GIS layers
  ├── User data
  ├── Image overlays
  ├── Markers
  ├── Lines
  ├── Polygons
  ├── Measurements
  ├── Notes
  ├── Attachments
  ├── Saved views
  └── Investigation history
```

The application should feel like a lightweight, modern, purpose-built GIS tool for property researchers.

---

# 3. Primary User

Initial user:

- The project owner / personal use.
- Property/land researchers.
- People investigating potential land purchases.
- People tracking proposed roads and infrastructure.
- People comparing old maps with current geography.

This is initially a **personal tool**, not a live public service.

Do not optimize the first version for:

- public user accounts,
- marketplace functionality,
- property listings,
- payments,
- lead generation,
- legal/title guarantees,
- production-scale infrastructure.

The architecture should still be clean enough that these could be added later if the project grows.

---

# 4. Important Legal/Data Principle

PlotLens can assist with **spatial investigation**, but map layers must not be presented as authoritative proof of:

- land ownership,
- legal title,
- exact cadastral boundaries,
- acquisition status,
- legal road reservation,
- development approval,
- property legality.

Government/open GIS data can be incomplete, outdated, generalized, or subject to source-specific limitations.

The application should distinguish between:

- `source data`
- `user interpretation`
- `derived analysis`
- `official/legal verification`

Do not make legal conclusions from GIS layers.

---

# 5. Recommended Technology Stack

## Frontend

- Next.js
- TypeScript
- React

The project owner already uses this ecosystem, so it is preferred.

## Map engine

### Preferred: MapLibre GL JS

MapLibre is preferred over making Mapbox the application's core dependency because:

- open-source ecosystem,
- flexible data sources,
- vector/raster layers,
- GeoJSON,
- raster tiles,
- image sources,
- WMS-compatible raster sources,
- custom layers,
- good control over map rendering,
- excellent fit for a GIS-oriented application.

### Mapbox

Mapbox remains a valid alternative if its services, tiles, geocoding, or ecosystem become useful.

Do not tightly couple the entire application to one map provider.

---

## Spatial utilities

### Turf.js

Use Turf.js for:

- distance calculations,
- area calculations,
- buffers,
- intersections,
- containment,
- bounding boxes,
- nearest-feature calculations,
- geometric operations.

---

## Initial persistence

### Firebase

Use:

- Firestore for project/map metadata.
- Firebase Storage for images, PDFs, KML/GeoJSON files and other attachments.

This is appropriate for the personal prototype and aligns with the project owner's existing experience.

---

## Future spatial database

If the project becomes serious:

### PostgreSQL + PostGIS

PostGIS should become the preferred spatial backend for:

- large datasets,
- spatial indexing,
- spatial queries,
- intersection analysis,
- property/plot datasets,
- government GIS data ingestion,
- advanced spatial analytics.

Do NOT introduce PostGIS prematurely if Firebase is sufficient for the initial personal version.

---

# 6. High-Level Architecture

```text
                    ┌───────────────────────┐
                    │       Next.js         │
                    │      TypeScript       │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │      MapLibre GL       │
                    └───────────┬───────────┘
                                │
       ┌─────────────┬──────────┼───────────┬──────────────┐
       ↓             ↓          ↓           ↓              ↓
      OSM          Bhuvan     Govt GIS    My Data       Imagery
       │             │          │           │              │
       │            WMS        APIs       GeoJSON       JPG/PNG
       │            WMTS       WFS        KML           PDF
       │                         │          SHP           TIFF
       └─────────────┬──────────┴───────────┴──────────────┘
                     ↓
               Layer Manager
                     ↓
             ┌───────────────┐
             │ Project Map   │
             ├───────────────┤
             │ Markers       │
             │ Lines         │
             │ Polygons      │
             │ Measurements  │
             │ Annotations   │
             │ Image Overlay │
             │ Govt Layers   │
             └───────┬───────┘
                     ↓
              Firebase Storage
              + Firestore
```

Future:

```text
                PostGIS
                   ↑
             Spatial Analysis
                   ↑
              GIS Engine
```

---

# 7. Project Structure / Mental Model

A project is an independent investigation.

Example:

```text
My Maps

├── Agra Land Search
├── Proposed Road Investigation
├── Project XYZ
└── Farm Land Analysis
```

Each project contains:

```text
Project
├── map state
├── layers
├── markers
├── lines
├── polygons
├── circles
├── image overlays
├── annotations
├── measurements
├── attachments
├── saved views
└── investigation history
```

---

# 8. MVP — Version 0.1

Do NOT start by implementing every planned feature.

The first version should focus on making the core map investigation workflow excellent.

## V0.1 Features

### Map

- MapLibre map.
- Base map.
- OpenStreetMap-compatible source.
- Satellite option if a suitable provider is configured.
- Search.
- Current location.
- Zoom controls.

### Project

- Create project.
- Name project.
- Save project.
- Reopen project.
- Delete/archive project.
- Persist map center and zoom.

### Drawing

Support:

- Point/marker.
- Line.
- Polygon.
- Circle.
- Text annotation.

### Image overlay — centerpiece feature

Allow:

1. Upload image.
2. Add image to map.
3. Position image geographically.
4. Adjust its corners.
5. Change opacity.
6. Toggle visibility.
7. Delete overlay.
8. Save overlay with project.

Example:

```text
Image

A ---------------- B
|                  |
|      OLD MAP     |
|                  |
C ---------------- D
```

The user moves A/B/C/D to align the image with real geographic locations.

This is the most important differentiating feature in the MVP.

### Data

Initially support:

- GeoJSON import/export.

KML and other formats can follow.

---

# 9. Image Overlay / Georeferencing

This functionality is central to PlotLens.

## Simple four-corner mode

The image is associated with four geographic coordinates:

```text
1 ---------------- 2
|                  |
|      IMAGE       |
|                  |
4 ---------------- 3
```

The user can move each corner on the map.

The image should support:

- position adjustment,
- resizing through corner handles,
- rotation if useful,
- opacity,
- visibility toggle,
- name,
- save/reload.

MapLibre's image source model is suitable for this.

---

## Advanced control-point mode — future

For scanned/irregular government maps:

```text
Image Point 1 → Map Point 1
Image Point 2 → Map Point 2
Image Point 3 → Map Point 3
```

Then calculate a geographic transformation.

This should be a later feature, not MVP.

---

# 10. Layer System

The application should have a first-class layer manager.

Example:

```text
LAYERS

☑ Satellite
☑ Roads
☑ Government Road
☑ Land Use
☐ Flood
☐ Water
☐ Boundaries

MY DATA

☑ Property
☑ Old Map
☑ Notes
```

Each layer should support where applicable:

- visibility toggle,
- opacity,
- ordering,
- metadata/info,
- source information,
- remove.

Example:

```text
Layer
├── Visibility
├── Opacity
├── Z-index/order
├── Source
├── Type
└── Metadata
```

---

# 11. Government / Public GIS Data

Government GIS data is potentially one of the most valuable parts of PlotLens.

Do NOT assume there is one universal government API.

The ecosystem is fragmented across:

- central government,
- state government,
- districts,
- municipalities,
- development authorities,
- Bhuvan/NRSC,
- Survey of India,
- data.gov.in,
- individual departments,
- individual GIS portals.

The architecture must therefore support multiple providers.

---

# 12. Bhuvan / NRSC

Bhuvan is a high-priority integration candidate.

Potentially useful Bhuvan data/layers include:

- satellite imagery,
- administrative boundaries,
- land-use / land-cover,
- water resources,
- terrain,
- thematic layers,
- flood-related layers,
- urban land-use,
- other geospatial datasets.

Bhuvan provides OGC-oriented services such as:

- WMS,
- WMTS,
- and related GIS services.

The application should treat Bhuvan as a configurable layer provider rather than hardcoding one layer.

Potential UI:

```text
ADD GOVERNMENT LAYER

Bhuvan
  ├── Administrative Boundaries
  ├── Land Use
  ├── Water Bodies
  ├── Flood
  ├── Urban Land Use
  └── Other available layers
```

Before implementing any specific endpoint, verify current access requirements, licensing, service URL, and whether the layer is publicly consumable.

---

# 13. PM Gati Shakti

PM Gati Shakti is relevant conceptually because it is a large GIS-based infrastructure planning ecosystem.

Potentially relevant categories include:

- roads,
- highways,
- industrial corridors,
- logistics,
- economic zones,
- infrastructure projects,
- planned connectivity,
- other government initiatives.

Important:

Do not assume that every PM Gati Shakti layer is publicly available through a simple API.

For each desired dataset:

1. Identify the authoritative source.
2. Check whether public access exists.
3. Check API/WMS/WFS/download availability.
4. Check terms/licensing.
5. Check update frequency.
6. Store source metadata.
7. Integrate through the provider abstraction.

---

# 14. data.gov.in

Use India's Open Government Data platform as another discovery source.

Potential workflow:

```text
data.gov.in
      ↓
Find useful dataset
      ↓
Check API/download availability
      ↓
Normalize data
      ↓
Convert to spatial representation where appropriate
      ↓
PlotLens layer
```

Do not assume every dataset is spatial.

---

# 15. Survey of India

Potential future source for official geospatial data.

Treat Survey of India data separately from open/general map sources.

Important:

- respect access restrictions,
- respect licensing,
- identify authoritative source,
- don't imply unofficial layers are legally authoritative.

---

# 16. State / Local Government GIS

This could eventually be extremely useful.

Examples of source categories:

- state GIS portals,
- development authorities,
- municipal GIS,
- district portals,
- urban planning authorities,
- road authorities,
- industrial development authorities.

The system should allow these to be added as providers without changing the core map architecture.

---

# 17. Provider Adapter Architecture

Do NOT hardcode government integrations directly into UI components.

Use a provider abstraction.

Conceptually:

```text
providers/
├── osm/
├── bhuvan/
├── dataGov/
├── surveyOfIndia/
├── state/
└── custom/
```

Each provider should expose something conceptually similar to:

```text
Provider
├── name
├── type
├── getCapabilities()
├── getLayers()
├── getMetadata()
└── getData()
```

The exact interface can evolve.

The key architectural rule:

> Adding a new data provider should not require rewriting the map UI.

---

# 18. Supported Data Formats

## V0.1

- GeoJSON
- PNG/JPG

## V0.2

- KML
- KMZ
- CSV with coordinates

## Later

- Shapefile ZIP
- GeoTIFF
- Cloud Optimized GeoTIFF
- PDF georeferencing
- other GIS formats

Do not implement every format before the core workflow is stable.

---

# 19. Measurement Tools

PlotLens should support spatial measurements.

## Distance

Example:

```text
Property ───────────── Road

             420 m
```

## Area

Draw a polygon:

```text
     ┌───────────┐
     │           │
     │   LAND    │
     │           │
     └───────────┘

Area: 2.84 acres
```

Allow useful unit conversions where appropriate.

## Radius / buffer

Example:

```text
Show everything within 1 km.
```

Then render a buffer around the selected feature.

Turf.js can be used for these calculations initially.

---

# 20. Property Investigation

A property can simply be a user-defined feature.

Example:

```text
Property
├── point
├── boundary
├── name
├── notes
├── tags
├── attachments
└── analysis
```

A project could contain multiple properties.

---

# 21. Nearby Intelligence

For a selected property, eventually show relevant spatial relationships.

Example:

```text
PROPERTY ANALYSIS

Area:
2.84 acres

Nearest:
Road          340 m
Highway       1.2 km
Railway       4.7 km
School        800 m
Hospital      2.3 km
Industrial    1.8 km
Water body    600 m
```

These values should be calculated from actual available layers/data.

Never invent missing data.

---

# 22. Road Impact Analysis

One particularly useful feature for the target use case:

A proposed road can be represented as a line or imported GIS layer.

The application can calculate affected/nearby properties.

Example:

```text
PROPOSED ROAD
────────────────────────────────────

Properties within 100m:
8

Properties within 250m:
21

Properties intersected:
3
```

This should be implemented using actual geometry and spatial operations.

Potential later extension:

- road corridor/buffer,
- affected plots,
- distance to road,
- before/after comparison.

---

# 23. Historical Map Comparison

Use image overlays to compare historical and current geography.

Possible UI:

```text
OLD MAP
   ↕
slider
   ↕
CURRENT MAP
```

Or synchronized split-screen maps:

```text
┌─────────────────────┬─────────────────────┐
│                     │                     │
│      OLD MAP        │     CURRENT MAP     │
│                     │                     │
│                     │                     │
└─────────────────────┴─────────────────────┘
```

Potential uses:

- old government plans,
- historical map documents,
- proposed infrastructure,
- previous site imagery,
- changes in roads/water/development.

---

# 24. Saved Views

Allow users to save map states.

Example:

```text
Project XYZ

Saved Views
├── Property Overview
├── Proposed Road
├── Land Use
├── Water Analysis
└── Old Map Comparison
```

A saved view should restore as much as practical:

- map center,
- zoom,
- bearing/pitch if used,
- active layers,
- layer opacity,
- overlays,
- visibility,
- selected feature if appropriate.

---

# 25. Investigation Timeline

A useful later feature.

Example:

```text
10 Aug 2026
├── Property discovered
├── Added satellite screenshot
├── Added old map
├── Added proposed road
├── Measured 420m from road
└── Added note
```

The timeline helps the user remember why a property/project was interesting.

This can initially be simple event logging rather than a complicated audit system.

---

# 26. AI Integration

AI should be an assistant, **not the source of truth**.

Do not build the product around vague "AI property finding."

Instead:

> GIS application with AI assistance.

Potential AI features:

### Natural-language map queries

Examples:

- "Show properties within 500m of the proposed highway."
- "Find everything within 1 km of this property."
- "Which of my properties are closest to a water body?"
- "What changed around this property between these two maps?"

AI should translate natural language into structured GIS operations.

---

## AI-generated investigation summaries

For a selected property:

```text
PROPERTY ANALYSIS

Area:
2.84 acres

Road access:
~340m

Nearest highway:
1.2km

Water body:
~600m

Land-use:
Urban / source-dependent

Flood layer:
No overlap detected

Infrastructure:
Potential road alignment ~220m away

Notes:
3 attachments
2 image overlays
5 annotations
```

AI must summarize actual application data.

It must not invent:

- government approvals,
- ownership,
- title,
- road plans,
- legal status,
- missing measurements.

---

# 27. Image Processing Workflow

Future image-processing pipeline:

```text
Upload image
     ↓
Crop
     ↓
Rotate
     ↓
Perspective correction (optional)
     ↓
Georeference
     ↓
Overlay
     ↓
Adjust opacity
     ↓
Save
```

This can become one of the strongest features of PlotLens.

---

# 28. Data Model

Initial Firestore-oriented conceptual model:

```text
Project
{
  id,
  name,
  description,

  map: {
    center,
    zoom,
    bearing,
    pitch
  },

  layers: [],
  overlays: [],
  annotations: [],

  createdAt,
  updatedAt
}
```

---

## Annotation

```text
Annotation
{
  id,
  type: "point | line | polygon | circle | text",
  geometry,
  title,
  description,
  tags,
  attachments[]
}
```

---

## Image Overlay

```text
ImageOverlay
{
  id,
  imageUrl,

  coordinates: [
    [lng, lat],
    [lng, lat],
    [lng, lat],
    [lng, lat]
  ],

  opacity,
  visible,
  rotation,
  name
}
```

The exact schema can evolve.

---

# 29. Recommended Application Modules

Conceptually:

```text
src/
│
├── map/
│   ├── MapEngine
│   ├── LayerManager
│   ├── DrawingManager
│   ├── MeasurementManager
│   └── OverlayManager
│
├── providers/
│   ├── osm/
│   ├── bhuvan/
│   ├── dataGov/
│   ├── surveyOfIndia/
│   └── state/
│
├── gis/
│   ├── geojson/
│   ├── kml/
│   ├── raster/
│   ├── georeferencing/
│   └── measurements/
│
├── projects/
│   ├── maps/
│   ├── layers/
│   ├── annotations/
│   ├── overlays/
│   └── savedViews/
│
├── storage/
│
└── ai/
```

This is conceptual rather than a mandatory exact folder structure.

---

# 30. Development Roadmap

## Phase 1 — Core Map

Build:

- Next.js project
- TypeScript
- MapLibre
- base map
- map controls
- location/search
- project creation
- project persistence

Goal:

> A stable personal map workspace.

---

## Phase 2 — Drawing

Add:

- markers,
- lines,
- polygons,
- circles,
- text annotations,
- deletion/editing,
- persistence.

Goal:

> User can investigate a location manually.

---

## Phase 3 — Image Overlay

This is the major milestone.

Add:

- upload image,
- image source,
- four-corner handles,
- geographic positioning,
- opacity,
- visibility,
- save/reload,
- delete.

Goal:

> User can take an old map/photo and align it with the real map.

---

## Phase 4 — Data Import

Add:

- GeoJSON import/export,
- KML,
- CSV coordinates.

Goal:

> User can bring external spatial data into a project.

---

## Phase 5 — Layer Manager

Add:

- layer list,
- visibility,
- opacity,
- order,
- metadata,
- source attribution.

Goal:

> Multiple datasets can coexist cleanly.

---

## Phase 6 — Government GIS

First integration target:

### Bhuvan

Before implementing:

- verify current public service endpoints,
- verify access,
- verify terms,
- verify attribution,
- verify current layer availability.

Then add configurable Bhuvan layers.

After Bhuvan:

- data.gov.in datasets,
- Survey of India where appropriate,
- state/local GIS providers.

---

## Phase 7 — Spatial Analysis

Add:

- distance,
- area,
- radius/buffer,
- nearest feature,
- intersections,
- containment,
- road impact analysis.

Goal:

> Turn the map from a viewer into an analysis tool.

---

## Phase 8 — Saved Views + Timeline

Add:

- saved map views,
- investigation history,
- project activity,
- notes.

Goal:

> Preserve the reasoning behind an investigation.

---

## Phase 9 — AI

Only after GIS primitives work reliably.

Add:

- natural-language spatial queries,
- analysis summaries,
- map explanation,
- comparison summaries.

AI must operate on structured application data.

---

# 31. Feature Priority

## Must Have

- Map
- Project system
- Markers
- Lines
- Polygons
- Image overlays
- Image opacity
- Image corner positioning
- GeoJSON
- Persistence

## Should Have

- Measurements
- KML
- Layer manager
- Satellite imagery
- Bhuvan WMS
- Saved views
- Notes/attachments

## Could Have

- Shapefile
- GeoTIFF
- historical comparison
- road impact analysis
- nearby intelligence
- timeline

## Later / Advanced

- PostGIS
- control-point georeferencing
- advanced raster processing
- AI spatial queries
- automated spatial reports
- additional government providers

---

# 32. What NOT to Overbuild

For the first personal version, avoid:

- user marketplace,
- payments,
- social features,
- complex authentication,
- public sharing,
- massive backend,
- microservices,
- complicated AI agents,
- automated legal conclusions,
- nationwide government data ingestion,
- automatic property ownership verification.

The first goal is a **beautiful, fast personal GIS investigation tool**.

---

# 33. UX Principles

The map should remain the primary workspace.

Avoid forcing the user through many pages.

Prefer:

```text
┌──────────────────────────────────────────────────────────┐
│ Search                                      Project Menu │
├───────────────┬──────────────────────────────────────────┤
│               │                                          │
│ Layers        │                                          │
│               │                  MAP                     │
│ My Data       │                                          │
│               │                                          │
│ Tools         │                                          │
│               │                                          │
│               │                                          │
└───────────────┴──────────────────────────────────────────┘
```

The user should be able to perform most actions without leaving the map.

---

# 34. Suggested Tools Panel

```text
TOOLS

📍 Marker
〰 Line
⬡ Polygon
⭕ Circle
📏 Measure
🖼 Image Overlay
📝 Note
📐 Area
🔍 Analyze
```

The exact UI can evolve.

---

# 35. Layer Panel

Example:

```text
LAYERS

BASE
☑ Streets
☑ Satellite

GOVERNMENT
☑ Land Use
☐ Flood
☐ Water
☐ Boundaries
☐ Proposed Roads

MY DATA
☑ Property
☑ Old Map
☑ Notes
```

Each layer can expose:

```text
Visibility
Opacity ─────●────
Info
Move Up
Move Down
```

---

# 36. Project Example

Example investigation:

```text
Project:
"Potential Land — Agra"

Property:
2.84 acres

Layers:
- Satellite
- Roads
- Bhuvan Land Use
- Water Bodies
- Administrative Boundary

User Data:
- Property polygon
- Proposed road line
- Old government map
- 5 annotations

Analysis:
- Road distance: 340m
- Water body: 600m
- Proposed road: 220m

Saved Views:
- Overview
- Proposed Road
- Old Map
- Land Use
```

---

# 37. Future Advanced Features

These are ideas, not MVP requirements.

## Property comparison

Compare multiple investigated properties:

```text
Property A
Property B
Property C
```

Possible attributes:

- area,
- road distance,
- highway distance,
- nearby infrastructure,
- relevant layers,
- notes.

---

## Automated report

Generate a project report containing:

- map snapshot,
- property boundary,
- measurements,
- active layers,
- notes,
- attachments,
- source information,
- analysis.

The report must clearly distinguish source data from user interpretation.

---

## Map screenshot/export

Allow:

- PNG export,
- PDF report,
- shareable project package.

---

## Project package

Eventually export/import an entire investigation:

```text
project.zip

├── project.json
├── overlays/
├── attachments/
├── geojson/
└── metadata/
```

This is useful for backup and portability.

---

# 38. Architecture Rules for AI Coding Assistants

Any AI coding assistant working on PlotLens should follow these rules.

### Rule 1 — Map first

The map is the primary workspace.

Do not create unnecessary navigation/page complexity.

### Rule 2 — Separate GIS logic from UI

Spatial calculations and transformations should not be deeply embedded in React components.

### Rule 3 — Providers must be modular

Government/open-data integrations should be adapters/providers.

### Rule 4 — Do not hardcode data providers

Provider URLs, layer definitions, metadata and configuration should be easy to update.

### Rule 5 — Preserve source metadata

Every external GIS layer should ideally track:

- provider,
- dataset,
- source URL/service,
- retrieval date if relevant,
- attribution,
- license/usage information.

### Rule 6 — Never invent spatial data

If a source does not provide information, the application must not fabricate it.

### Rule 7 — Never present analysis as legal certainty

Spatial proximity does not prove legal ownership, title, acquisition, approval or reservation.

### Rule 8 — Build incrementally

Do not implement future features just because they appear in this document.

Only implement the current milestone unless explicitly requested.

### Rule 9 — Avoid unnecessary dependencies

Prefer established GIS libraries and small abstractions.

### Rule 10 — Keep project data portable

Design project data so it can eventually be exported/imported independently of the current backend.

---

# 39. Research Findings / Technical Feasibility

The concept is technically feasible.

Important ecosystem findings:

## MapLibre

MapLibre GL JS supports:

- interactive maps,
- GeoJSON,
- raster sources,
- image sources,
- custom layers,
- geographic image positioning.

Its image source API supports geographic coordinates for image corners and allows image repositioning.

## Mapbox

Mapbox GL JS also supports:

- image sources,
- geographic image overlays,
- raster opacity,
- interactive map layers.

Mapbox remains a viable alternative.

## Bhuvan / NRSC

Bhuvan provides OGC-style GIS services such as WMS/WMTS and has India-specific thematic/geospatial datasets.

This makes it one of the strongest candidates for the first government GIS integration.

## PM Gati Shakti

The platform is based around a large national GIS infrastructure-planning ecosystem containing many infrastructure-related layers.

However, public access to individual datasets/APIs must be verified independently.

## data.gov.in

India's Open Government Data platform provides datasets and APIs from government departments.

It can be used as a discovery source for relevant datasets.

## Survey of India

Survey of India is an important authoritative geospatial source to investigate for future integrations, subject to current access and usage rules.

---

# 40. Suggested Initial Build Prompt for Another AI

When another AI starts coding this project, its initial understanding should be:

> You are building PlotLens, a personal GIS/property investigation workspace.
>
> The application is built with Next.js, TypeScript, React, MapLibre GL JS, Turf.js and Firebase.
>
> The primary experience is a full-screen interactive map with a project system, layers, annotations, drawings, measurements and especially georeferenced image overlays.
>
> The user must be able to upload an image/map, place it over the geographic map using four adjustable corners, change its opacity, and save it as part of a project.
>
> The architecture must support external GIS providers such as Bhuvan, data.gov.in, Survey of India and state/local GIS through provider adapters.
>
> Do not tightly couple the application to one map/data provider.
>
> Keep GIS/spatial logic separate from UI components.
>
> Do not fabricate government data or make legal/title claims.
>
> Build the project incrementally. Start with the MVP and do not implement advanced features until requested.
>
> The goal is a polished personal GIS investigation tool, not a property marketplace.

---

# 41. Product Name

### PlotLens

Working tagline:

> **Investigate the land. See what surrounds it.**

Alternative positioning:

> **A personal GIS workspace for land and infrastructure research.**

Other names considered:

- GeoCanvas
- TerraLens
- MapForge
- LandScope
- PlotLayer
- GeoTrace
- TerraMap
- GeoOverlay
- LandCanvas

**PlotLens is currently the preferred name.**

---

# 42. Final Product Direction

The long-term vision can be summarized as:

```text
                 PLOTLENS
                     │
          Personal GIS Workspace
                     │
       ┌─────────────┼─────────────┐
       │             │             │
     MAPS          DATA          ANALYSIS
       │             │             │
  Satellite      Government      Distance
  OSM            Bhuvan          Area
  Old Maps       State GIS       Buffer
  Overlays       Open Data       Intersection
       │             │             │
       └─────────────┼─────────────┘
                     │
              INVESTIGATION
                     │
        ┌────────────┼────────────┐
        │            │            │
     Properties   Roads        Projects
        │            │            │
        └────────────┼────────────┘
                     │
                 INSIGHTS
```

The most important differentiator is:

> **Take any map/image/document you have, align it with the real world, put it beside government/open GIS layers, and investigate the geography yourself.**

That is the core experience around which the rest of PlotLens should be built.
