# PlotLens — Product Requirements

## Problem

Property/land research today requires combining maps, satellite imagery, old maps, government layers, road information, personal notes, measurements, and documents — but that workflow is fragmented across Google Maps/Earth, QGIS, PDFs, screenshots, and government portals with no single place to keep the investigation.

## Solution

PlotLens provides a unified personal GIS investigation workspace: one project per investigation, one map as the primary workspace, layers and overlays that can be toggled and combined, and a persistent record of what was found.

## Primary user

The project owner, personally, as a land/property researcher. See [PROJECT_SPEC.md](PROJECT_SPEC.md) §3 for the full framing and explicit non-users (this is not built for the general public yet).

## MVP — v0.1 (frozen scope)

The first version must make the core map-investigation workflow excellent. Do not implement every feature in [PROJECT_SPEC.md](PROJECT_SPEC.md) — only what's below.

### Map

- MapLibre map with an OpenStreetMap-compatible base layer.
- Satellite option if/when a suitable provider is configured (not blocking for v0.1).
- Search, current-location, zoom controls.

### Project system

- Create, name, save, reopen, delete/archive a project.
- Persist map center and zoom per project.

### Drawing

- Point/marker, line, polygon, circle, text annotation. Create, edit, delete, persist.

### Image overlay — the centerpiece feature

1. Upload image (JPG/PNG).
2. Add to map as an image source.
3. Position geographically via four adjustable corner handles.
4. Adjust opacity.
5. Toggle visibility.
6. Delete overlay.
7. Save overlay with the project and reload it correctly on reopen.

This is the most important differentiating feature in the MVP — see [GIS_ARCHITECTURE.md](GIS_ARCHITECTURE.md) for the georeferencing model and [ACCEPTANCE_CRITERIA.md](ACCEPTANCE_CRITERIA.md) for its done-criteria.

### Data import/export

- GeoJSON import/export only. KML and other formats are v0.2+.

## Non-goals (explicitly out of scope for v0.1, and not to be added without a conversation)

- Public user accounts / multi-tenant auth beyond the single owner.
- Property marketplace, listings, or lead generation.
- Payments or billing.
- Social features (sharing, comments, public profiles).
- Legal/title verification or any ownership guarantee.
- Production-scale infrastructure (this is a personal-scale app).
- Automated ownership verification or automated legal conclusions.
- Nationwide/bulk government-data ingestion.
- Advanced control-point (non-four-corner) georeferencing.
- Natural-language / AI features of any kind (Phase 9, gated on GIS primitives working first).

## Feature priority (post-MVP)

**Should have (v0.2+):** measurements (distance/area/buffer), KML import, layer manager UI, satellite imagery, Bhuvan WMS integration, saved views, notes/attachments.

**Could have:** Shapefile, GeoTIFF, historical map comparison (slider/split-screen), road impact analysis, nearby-infrastructure intelligence, investigation timeline.

**Later/advanced:** PostGIS migration, control-point georeferencing, advanced raster processing, AI spatial queries, automated spatial reports, additional government providers beyond Bhuvan.

## Phased roadmap

| Phase | Goal | Depends on |
|---|---|---|
| 1. Core map | A stable personal map workspace | — |
| 2. Drawing | User can investigate a location manually | Phase 1 |
| 3. Image overlay | User can align an old map/photo with the real map | Phase 1–2 |
| 4. Data import | GeoJSON/KML/CSV import | Phase 1 |
| 5. Layer manager | Multiple datasets coexist cleanly (visibility, opacity, order, source) | Phase 1, 4 |
| 6. Government GIS | Bhuvan first, then data.gov.in / Survey of India / state GIS | Phase 5, [DATA_SOURCES.md](DATA_SOURCES.md) verification |
| 7. Spatial analysis | Distance/area/buffer/nearest/intersection/road-impact | Phase 2, 3 |
| 8. Saved views + timeline | Preserve the reasoning behind an investigation | Phase 1–3 |
| 9. AI | Natural-language spatial queries and summaries, on structured app data only | Phase 1–7 working reliably |

**Rule for every phase:** only implement the current milestone. Later phases existing in this document is not permission to build them early — see [AGENTS.md](../AGENTS.md).

## Definition of "ready to code" (must all be true before Phase 1 implementation starts)

- [x] Product goal, MVP, and non-goals documented (this file)
- [x] Architecture documented ([ARCHITECTURE.md](ARCHITECTURE.md))
- [x] Map engine and provider strategy chosen ([ADR/0001-map-engine.md](ADR/0001-map-engine.md), [PROVIDER_ARCHITECTURE.md](PROVIDER_ARCHITECTURE.md))
- [x] Coordinate/CRS rules documented ([GIS_ARCHITECTURE.md](GIS_ARCHITECTURE.md))
- [x] Data-source registry exists ([DATA_SOURCES.md](DATA_SOURCES.md))
- [x] Security baseline documented ([SECURITY.md](SECURITY.md), [PRIVACY.md](PRIVACY.md))
- [x] AI-agent instructions exist ([AGENTS.md](../AGENTS.md))
- [x] Acceptance criteria drafted ([ACCEPTANCE_CRITERIA.md](ACCEPTANCE_CRITERIA.md))
- [ ] Firestore/Storage security rules actually written and tested in the Emulator (blocked until `src/` and Firebase config exist)
- [ ] Git repository initialized with `main` + `feature/*` convention
- [ ] Next.js + TypeScript project scaffolded

The last three are implementation-phase tasks, intentionally left unchecked — this document set is complete for planning purposes; scaffolding is the next step when the user says to start coding.
