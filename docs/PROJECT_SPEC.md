# PlotLens — Project Specification

> **Tagline:** Investigate the land. See what surrounds it.
> **Project type:** Personal mini-project / vibe-coding project

This is the canonical product-truth document for PlotLens. For the full-length original research/spec brief this was distilled from (feature examples, UI sketches, extended rationale), see [research/project-specification-raw.md](research/project-specification-raw.md).

## 1. Vision

PlotLens is **not** a Google Maps clone and **not** a public/commercial property marketplace. It is:

> A personal GIS investigation workspace for property, land, and infrastructure research.

A user creates independent map **projects**, places properties/locations, adds government/open-data layers, uploads old maps or photographs, georeferences those images against the real map, adjusts their opacity, and annotates/measures/interrogates the geography. The application should make it easy to answer questions like "how far is this from the nearest road?", "does an old map line up with current satellite imagery?", or "what did I already investigate about this property?"

## 2. Core product philosophy

Build around **layers and investigations**, not property listings:

```text
Project
  ├── Base map
  ├── Government layers
  ├── External GIS layers
  ├── User data
  ├── Image overlays
  ├── Markers / Lines / Polygons
  ├── Measurements
  ├── Notes / Attachments
  ├── Saved views
  └── Investigation history
```

## 3. Primary user

The project owner, personally, plus (conceptually) other land/property researchers, people evaluating a land purchase, people tracking proposed roads/infrastructure, and people comparing old maps against current geography.

This is a **personal tool first**. Do not optimize v0.1 for: public user accounts, marketplace functionality, listings, payments, lead generation, legal/title guarantees, or production-scale infrastructure. The architecture should stay clean enough to add these later, but they are not being built now.

## 4. Legal/data principle (read this before building anything analysis-related)

PlotLens assists with **spatial investigation**. Map layers must never be presented as authoritative proof of land ownership, legal title, exact cadastral boundaries, acquisition status, legal road reservation, development approval, or property legality. Government/open GIS data can be incomplete, outdated, generalized, or source-limited.

The application must distinguish between:

- `source data` (what a provider gave us)
- `user interpretation` (what the user drew/annotated)
- `derived analysis` (what we calculated from the above)
- `official/legal verification` (something PlotLens does not do)

**Do not make legal conclusions from GIS layers.** This rule is absolute and applies to UI copy, AI-generated summaries, and exported reports alike.

## 5. Technology stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js + TypeScript + React | project owner's existing ecosystem |
| Map engine | MapLibre GL JS | open-source, flexible raster/vector/image sources, no vendor lock-in — see [ADR/0001-map-engine.md](ADR/0001-map-engine.md) |
| Spatial utilities | Turf.js | distance, area, buffer, intersection, containment, nearest-feature |
| Persistence (initial) | Firebase (Firestore + Storage) | fits personal-prototype scale and owner's experience — see [ADR/0002-storage.md](ADR/0002-storage.md) |
| Spatial DB (future) | PostgreSQL + PostGIS | only introduced if/when the project outgrows Firebase — do not adopt prematurely |

Mapbox remains a valid alternative/fallback map provider but the app must not be tightly coupled to one map provider (see [PROVIDER_ARCHITECTURE.md](PROVIDER_ARCHITECTURE.md)).

## 6. High-level architecture

Full detail in [ARCHITECTURE.md](ARCHITECTURE.md). Summary:

```text
Next.js + TypeScript
        ↓
   MapLibre GL
        ↓
 ┌──────┴───────────────────────┐
 OSM   Bhuvan   Govt GIS   My Data   Imagery
        ↓
   Layer Manager
        ↓
 Project Map (markers, lines, polygons, measurements,
              annotations, image overlays, govt layers)
        ↓
 Firebase Storage + Firestore
```

## 7. Project mental model

Each project (e.g. "Agra Land Search", "Proposed Road Investigation") independently owns: map state, layers, markers, lines, polygons, circles, image overlays, annotations, measurements, attachments, saved views, and investigation history. See [DATA_MODEL.md](DATA_MODEL.md) for the schema.

## 8. Government / open GIS data landscape

There is no single "government API." The ecosystem is fragmented across Bhuvan/NRSC, Survey of India, data.gov.in, PM Gati Shakti, and state/district/municipal GIS portals. PlotLens treats every one of these as a pluggable **provider** (see [PROVIDER_ARCHITECTURE.md](PROVIDER_ARCHITECTURE.md)) and records verified terms in [DATA_SOURCES.md](DATA_SOURCES.md) before integrating anything. Bhuvan is the first integration target (WMS/WMTS-based, India-specific thematic layers) — see roadmap in [PRODUCT_REQUIREMENTS.md](PRODUCT_REQUIREMENTS.md).

## 9. AI's role in this product

AI is an assistant, not the source of truth: *"GIS application with AI assistance,"* not *"AI property finding."* AI features (natural-language spatial queries, investigation summaries) are Phase 9 — after core GIS primitives work reliably — and must operate only on structured application data. AI must never invent government approvals, ownership, title, road plans, legal status, or missing measurements.

## 10. What NOT to overbuild (v0.1)

User marketplace, payments, social features, complex authentication, public sharing, a large backend/microservices split, complicated AI agents, automated legal conclusions, nationwide government-data ingestion, automated ownership verification. The goal of the first version is a **beautiful, fast, personal GIS investigation tool** — see non-goals in [PRODUCT_REQUIREMENTS.md](PRODUCT_REQUIREMENTS.md).

## 11. Product name

**PlotLens.** Tagline: *Investigate the land. See what surrounds it.* Alternative positioning line: *A personal GIS workspace for land and infrastructure research.*

## 12. The core differentiator

> Take any map/image/document you have, align it with the real world, put it beside government/open GIS layers, and investigate the geography yourself.

Everything else in the product exists to support that one experience — see the image-overlay/georeferencing design in [GIS_ARCHITECTURE.md](GIS_ARCHITECTURE.md) §Georeferencing.
