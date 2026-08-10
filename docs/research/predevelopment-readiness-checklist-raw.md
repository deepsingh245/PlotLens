# PlotLens — Pre-Development Readiness Checklist

> **Purpose:** This document is the checklist to complete **before serious coding begins** on PlotLens.
>
> The goal is to prevent the project from becoming difficult to maintain, accidentally violating map/data/API terms, leaking secrets, relying on unstable government endpoints, or becoming impossible for another AI coding agent to understand.
>
> This document is intentionally stricter than a normal hobby-project checklist because PlotLens touches maps, government/open data, uploaded documents, GIS formats, external APIs, and potentially sensitive property research.

---

# 1. First: Understand What Already Exists

Before building anything, PlotLens should explicitly acknowledge that it is entering an existing ecosystem.

## Existing tools/products to study

### QGIS

QGIS already provides many of the underlying GIS workflows PlotLens is trying to simplify:

- georeferencing,
- raster/image overlays,
- vector layers,
- measurements,
- spatial analysis,
- KML/GeoJSON/Shapefile support,
- map composition,
- data import/export.

QGIS should be treated as the reference implementation for "what serious GIS users expect."

**Do not try to recreate all of QGIS.**

PlotLens should focus on:

> A simpler, modern, web-first, personal investigation workflow.

---

### ArcGIS / ArcGIS Pro

ArcGIS demonstrates the more advanced end of:

- property/site analysis,
- suitability analysis,
- weighted overlays,
- spatial selection,
- geoprocessing,
- professional GIS workflows.

Modern real-estate GIS workflows commonly combine layers such as:

- parcel boundaries,
- aerial imagery,
- zoning/planning,
- road access,
- demographics,
- flood risk,
- competing developments,
- infrastructure.

This confirms that the proposed PlotLens direction is a legitimate GIS/property-analysis workflow rather than an arbitrary feature collection.

---

### Mappls

Mappls is especially relevant for India.

It provides:

- map SDKs,
- search,
- geocoding,
- reverse geocoding,
- routing,
- GIS/analytics APIs,
- map layers,
- administrative boundaries,
- transportation data,
- land-use and other geospatial datasets,
- satellite/image-related capabilities.

Mappls should therefore be evaluated as a possible **India-specific commercial provider**, especially for:

- India-focused search,
- geocoding,
- POIs,
- map data,
- potentially richer India-specific location information.

Do not assume it should replace MapLibre.

Possible architecture:

```text
MapLibre
   +
Map provider
   +
Government layers
   +
User data
```

---

### Google Earth / Google Maps

These are useful reference products for:

- satellite visualization,
- place discovery,
- historical imagery concepts,
- map navigation.

However, do not copy Google imagery/data into PlotLens or assume that a screenshot/asset can be freely reused.

Always verify the applicable provider terms before integrating their data.

---

# 2. Core Decision Before Coding

Decide this explicitly:

## Map rendering engine

### Preferred

**MapLibre GL JS**

Why:

- open-source,
- flexible,
- good raster/vector support,
- GeoJSON,
- image sources,
- custom layers,
- good fit for external GIS layers.

### Possible providers behind MapLibre

- OpenStreetMap-derived tiles/data
- commercial tile providers
- government WMS/WMTS
- other licensed raster/vector sources

The map engine and the data provider should be separate concepts.

---

# 3. Do NOT Treat OpenStreetMap Tiles as Unlimited

This is an important pre-development check.

OpenStreetMap data is free to use, but the public `tile.openstreetmap.org` servers are not an unlimited production tile service.

OSM's tile policy requires, among other things:

- correct tile URL,
- visible attribution,
- proper identification,
- responsible usage,
- no abusive/heavy usage.

The OSM Foundation may block inappropriate usage.

Therefore:

## Development

Using public OSM tiles for a small personal prototype may be acceptable if policy requirements are followed.

## Production / heavy usage

Plan to use:

- a proper OSM-derived tile provider,
- a commercial provider,
- or your own infrastructure.

Never design the production architecture around unlimited anonymous use of `tile.openstreetmap.org`.

Required map attribution should remain visible.

---

# 4. Provider Terms Must Be a First-Class Concern

Before integrating any map/data provider, create an entry in:

```text
docs/data-sources.md
```

For every provider record:

```text
Provider:
Dataset:
Service:
URL:
Type:
WMS / WMTS / REST / Vector / Raster / Download:
Authentication:
Attribution:
License:
Commercial-use allowed?:
Caching allowed?:
Storage allowed?:
Derivative data allowed?:
Rate limits:
Usage restrictions:
Last verified:
Notes:
```

This should apply to:

- OpenStreetMap
- Mapbox
- Mappls
- Bhuvan
- Survey of India
- data.gov.in
- state GIS portals
- development authorities
- municipal GIS
- any future API

---

# 5. Mapbox Must Be Treated as a Separate Provider

If Mapbox is used:

Check:

- Mapbox Terms of Service,
- product-specific terms,
- attribution requirements,
- API/token restrictions,
- usage limits,
- storage/caching rules,
- geocoding restrictions,
- data retention rules.

Do not assume that because a Mapbox map is visible in the browser, its underlying data can be downloaded, stored, transformed, or redistributed however PlotLens wants.

Keep provider-specific restrictions documented.

---

# 6. Mappls Must Be Evaluated Before Adoption

Mappls is a strong India-specific option.

Potential services:

- Maps,
- Search,
- Geocoding,
- Reverse geocoding,
- Routes,
- GIS/analytics,
- location intelligence.

If used:

Create:

```text
docs/providers/mappls.md
```

Record:

- account,
- API products enabled,
- allowed domains,
- token/key restrictions,
- pricing/free quota,
- attribution,
- usage terms,
- caching/storage restrictions,
- production requirements.

Mappls documentation specifically supports restricting API keys by IP/domain for certain integrations, which should be used where applicable.

---

# 7. Government Data Must Never Be Assumed

Government data is fragmented.

There is no assumption that:

```text
"Government API"
```

means:

```text
"everything is available through one public endpoint."
```

Each dataset must be independently verified.

Potential sources:

```text
Bhuvan / NRSC
Survey of India
data.gov.in
PM Gati Shakti ecosystem
State GIS
District GIS
Municipal GIS
Development Authorities
Road authorities
Planning authorities
Other departmental portals
```

---

# 8. Bhuvan Checklist

Before integrating Bhuvan:

- Find the official service.
- Confirm WMS/WMTS availability.
- Confirm current endpoint.
- Confirm layer name.
- Confirm coordinate reference system.
- Confirm attribution.
- Confirm usage/license conditions.
- Confirm whether browser/client access is permitted.
- Confirm whether caching is permitted.
- Confirm whether the service has rate limits.
- Record the date the endpoint was verified.

Do not hardcode undocumented endpoints discovered from random blog posts.

---

# 9. data.gov.in Checklist

For every dataset:

- dataset owner,
- ministry/state/department,
- dataset URL,
- API availability,
- download availability,
- license,
- update frequency,
- geographic resolution,
- coordinate information,
- whether it is actually spatial,
- transformation required,
- attribution.

data.gov.in states that content is owned by the relevant ministry/state/department/organization and licensed under the Government Open Data License — India.

Do not assume every dataset has the same technical structure.

---

# 10. Survey of India Checklist

Before using Survey of India data:

- identify the exact dataset,
- verify access method,
- verify licensing/terms,
- verify whether redistribution is allowed,
- verify whether commercial use is allowed if relevant later,
- record source/attribution,
- record data date/version.

Treat official geospatial data as authoritative only for what the source actually represents.

Do not turn a visualization into a legal land-title claim.

---

# 11. PM Gati Shakti Checklist

PM Gati Shakti is highly relevant to the infrastructure/road vision.

Potentially useful information categories include:

- planned infrastructure,
- connectivity,
- roads,
- corridors,
- economic zones,
- logistics,
- government projects.

But:

> Do not build the application assuming PM Gati Shakti exposes all layers through a simple public API.

For every desired layer:

```text
Find source
   ↓
Verify public access
   ↓
Verify technical interface
   ↓
Verify license
   ↓
Verify update frequency
   ↓
Build provider adapter
```

---

# 12. Competitor / Reference Feature Matrix

Before coding, create:

```text
docs/competitive-analysis.md
```

Minimum products/tools to compare:

| Product | Study For |
|---|---|
| QGIS | GIS capabilities |
| ArcGIS Pro | Professional spatial analysis |
| Google Earth | Satellite/map UX |
| Mappls | India maps/search/GIS |
| Bhuvan | India government GIS |
| Mapbox | Web mapping ecosystem |
| MapLibre | Open-source map rendering |

Also look at current real-estate/GIS workflows.

A recent GIS discussion about property analysis highlighted practical report elements such as:

- parcel boundaries,
- aerial imagery,
- zoning/planning information,
- road access,
- distances,
- maps,
- photos.

These should influence PlotLens's investigation/reporting features.

---

# 13. The Project Files You Should Have Before Coding

Create this structure **before asking an AI to build features**:

```text
PlotLens/
│
├── README.md
│
├── AGENTS.md
├── CLAUDE.md
├── GEMINI.md
│
├── docs/
│   ├── PROJECT_SPEC.md
│   ├── PRODUCT_REQUIREMENTS.md
│   ├── ARCHITECTURE.md
│   ├── DATA_MODEL.md
│   ├── GIS_ARCHITECTURE.md
│   ├── DATA_SOURCES.md
│   ├── COMPETITIVE_ANALYSIS.md
│   ├── SECURITY.md
│   ├── PRIVACY.md
│   ├── LICENSES_AND_ATTRIBUTION.md
│   ├── API_CONTRACTS.md
│   ├── PROVIDER_ARCHITECTURE.md
│   ├── ADR/
│   │   ├── 0001-map-engine.md
│   │   ├── 0002-storage.md
│   │   └── 0003-provider-system.md
│   └── research/
│
├── src/
│
├── public/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── scripts/
│
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── eslint.config.*
├── prettier.config.*
│
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
├── storage.rules
│
└── CHANGELOG.md
```

Not every file needs substantial content on day one.

The important thing is to establish the structure.

---

# 14. The Most Important AI Context Files

Different coding agents look for different instruction files.

## Primary universal file

### `AGENTS.md`

This should contain:

- project purpose,
- architecture rules,
- coding rules,
- security rules,
- GIS rules,
- provider rules,
- testing expectations,
- forbidden behavior,
- current milestone.

This is the main instruction file for AI coding agents that support the AGENTS.md convention.

---

## Claude

Maintain:

```text
CLAUDE.md
```

It can point to:

```text
AGENTS.md
docs/PROJECT_SPEC.md
docs/ARCHITECTURE.md
```

Do not duplicate the entire specification unnecessarily.

---

## Gemini

Maintain:

```text
GEMINI.md
```

Again, keep it concise and reference the canonical project documents.

---

# 15. Single Source of Truth Rule

Do NOT allow:

```text
AGENTS.md
CLAUDE.md
GEMINI.md
README.md
PROJECT_SPEC.md
```

to contain five different versions of the architecture.

Instead:

```text
AGENTS.md
    ↓
AI behavior/instructions

PROJECT_SPEC.md
    ↓
Product truth

ARCHITECTURE.md
    ↓
Technical truth

DATA_SOURCES.md
    ↓
External data truth

SECURITY.md
    ↓
Security truth
```

Agent-specific files should point back to these documents.

---

# 16. `PRODUCT_REQUIREMENTS.md`

This should define:

## Problem

Property/land research often requires combining:

- maps,
- satellite imagery,
- old maps,
- government layers,
- road information,
- personal notes,
- measurements,
- documents.

The workflow is fragmented across Google Maps/Earth, QGIS, PDFs, screenshots and government portals.

## Solution

PlotLens provides a unified personal GIS investigation workspace.

## Primary user

Personal/property researcher.

## MVP

Explicit list of MVP features.

## Non-goals

Explicitly list things the first version will NOT do.

This prevents AI agents from continuously expanding scope.

---

# 17. `ARCHITECTURE.md`

Document:

```text
Frontend
    ↓
MapLibre
    ↓
Layer Manager
    ↓
Provider Adapters
    ↓
External Data

Firebase
    ↓
Projects
Layers
Annotations
Overlays
Attachments
```

Also document:

- component boundaries,
- data flow,
- state management,
- API boundary,
- storage strategy,
- spatial calculations,
- provider abstraction.

---

# 18. `GIS_ARCHITECTURE.md`

This file should explain:

- GeoJSON,
- coordinate systems,
- WGS84,
- longitude/latitude ordering,
- raster vs vector,
- WMS,
- WMTS,
- WFS,
- image overlays,
- georeferencing,
- projections,
- measurement accuracy.

This is important because GIS bugs can look visually correct while being geographically wrong.

---

# 19. Coordinate System Rules

Establish this early.

Default application coordinate representation:

```text
WGS84
EPSG:4326
```

GeoJSON convention:

```text
[longitude, latitude]
```

Never casually mix:

```text
lat, lng
```

with:

```text
lng, lat
```

without an explicit conversion.

Document coordinate-system conversions.

---

# 20. `DATA_SOURCES.md`

This should become one of the most important project files.

Example:

```yaml
provider: Bhuvan
dataset: Land Use
type: WMS
endpoint: <verified endpoint>
layer: <verified layer>
crs: EPSG:4326
attribution: <required attribution>
license: <verified>
caching: <allowed/not allowed>
last_verified: 2026-08-10
status: experimental
```

Each external dataset should have a status:

```text
verified
experimental
deprecated
blocked
unknown
```

Never use an `unknown` provider in production.

---

# 21. `LICENSES_AND_ATTRIBUTION.md`

Track every external asset/data source.

Example:

```text
Source:
OpenStreetMap

Usage:
Base map

Required attribution:
© OpenStreetMap contributors

License:
ODbL / applicable OSM terms

Restrictions:
See current tile/data usage policies.

Verified:
2026-08-10
```

Do this for:

- maps,
- tiles,
- imagery,
- icons,
- fonts,
- datasets,
- libraries,
- government data,
- AI-generated assets if relevant.

---

# 22. `SECURITY.md`

Before coding, establish:

## Secrets

Never commit:

```text
API keys
service account keys
private tokens
Firebase admin credentials
database passwords
```

Use:

```text
.env.local
```

and commit only:

```text
.env.example
```

---

# 23. `.env.example`

Create a complete template:

```env
NEXT_PUBLIC_MAP_PROVIDER=
NEXT_PUBLIC_MAP_STYLE=
NEXT_PUBLIC_MAP_TOKEN=

NEXT_PUBLIC_MAPPLS_KEY=

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

AI_PROVIDER=
AI_API_KEY=
```

Only include variables actually needed.

Never put real secrets into this file.

---

# 24. Public vs Private API Keys

This must be decided per provider.

Some browser-side mapping keys are designed to be public but domain-restricted.

Others must remain server-side.

For each key record:

```text
Key:
Provider:
Public/browser safe?:
Domain restricted?:
IP restricted?:
Server only?:
Rotation process:
```

Never ask an AI coding agent to "just put the API key in the frontend" without checking the provider documentation.

---

# 25. Firebase Security Must Exist From the Beginning

Do not use Firebase in a permanently open mode.

Firebase's documentation explicitly recommends treating Security Rules as a core security mechanism and writing rules alongside the application's data model.

Create:

```text
firestore.rules
storage.rules
```

from the beginning.

For a personal app, at minimum define ownership:

```text
user
  ↓
projects
  ↓
layers
overlays
annotations
attachments
```

A user should only access their own project data.

---

# 26. Firebase App Check

If Firebase services are exposed to a web application:

Evaluate and eventually enable:

- Firebase App Check,
- monitoring,
- alerts,
- proper Security Rules.

Firebase specifically recommends App Check and monitoring as part of its security checklist.

---

# 27. Firebase Emulator

Use the Firebase Emulator Suite for:

- Firestore rules,
- Storage rules,
- local testing,
- security tests.

Do not test security by repeatedly changing production rules.

---

# 28. File Upload Security

PlotLens will accept:

- JPG,
- PNG,
- PDF,
- KML,
- GeoJSON,
- possibly ZIP,
- possibly GeoTIFF.

Therefore define:

```text
Allowed MIME types
Maximum file size
Maximum image dimensions
Maximum archive size
Filename sanitization
Virus/malware scanning strategy if public
Parsing limits
Storage path rules
```

Do not allow arbitrary uploaded files to be executed.

---

# 29. GIS File Security

Be especially careful with:

```text
ZIP
KML
KMZ
Shapefile
GeoTIFF
PDF
```

An AI coding agent must not blindly parse untrusted uploaded files using arbitrary native/system commands.

Use trusted libraries and isolate heavy/unsafe processing if necessary.

---

# 30. API Rate-Limit Protection

Every external provider should have:

```text
timeout
retry policy
backoff
rate limit handling
error state
cache policy
fallback
```

Do not create a frontend that continuously requests a government WMS/API on every render.

Use debouncing and caching where allowed.

Respect provider terms.

---

# 31. Data Source Failure Must Be Normal

Government endpoints can:

- disappear,
- change URLs,
- become unavailable,
- become slow,
- change layer names,
- require authentication,
- change projections.

The UI should show:

```text
Layer unavailable
Last verified:
2026-08-10
```

rather than silently displaying incorrect information.

---

# 32. Provider Adapter Contract

Each provider should conceptually implement:

```text
Provider
├── id
├── name
├── type
├── getCapabilities()
├── getLayers()
├── getLayerMetadata()
├── buildLayerSource()
└── health/status
```

The map UI should not know how Bhuvan or Mappls works internally.

---

# 33. Source Attribution Must Be Visible

For every map/data source where required:

- show attribution,
- make it readable,
- don't hide it behind an obscure menu,
- don't crop it out of exported maps unless permitted.

For exported reports/images, determine whether the source requires attribution there as well.

---

# 34. `API_CONTRACTS.md`

Document all internal APIs.

Example:

```text
POST /api/projects
GET /api/projects/:id
PATCH /api/projects/:id
DELETE /api/projects/:id

POST /api/overlays
POST /api/import/geojson
POST /api/import/kml
GET /api/providers
```

Do not create random endpoints without documenting them.

---

# 35. `DATA_MODEL.md`

Define:

```text
User
Project
Layer
Annotation
ImageOverlay
Attachment
SavedView
InvestigationEvent
Provider
Dataset
```

For each:

- fields,
- required/optional,
- ownership,
- indexes,
- relationships,
- validation.

---

# 36. Database Validation

Security Rules are not the only validation.

Validate:

- geometry,
- coordinates,
- strings,
- file metadata,
- IDs,
- numeric ranges,
- opacity,
- zoom,
- project ownership.

Never trust data simply because it came from your own frontend.

---

# 37. Testing Files

Before feature development:

```text
tests/
├── unit/
├── integration/
└── e2e/
```

Minimum tests:

### GIS

- longitude/latitude ordering,
- distance,
- area,
- polygon validity,
- coordinate conversion,
- image corner serialization.

### Security

- user A cannot read user B's project,
- user A cannot upload to user B's storage path,
- unauthenticated access is blocked where intended.

### Provider

- provider unavailable,
- invalid response,
- timeout,
- malformed GeoJSON,
- WMS failure.

### UI

- create project,
- add marker,
- draw polygon,
- upload image,
- move image corners,
- change opacity,
- save/reopen.

---

# 38. `ACCEPTANCE_CRITERIA.md`

Every feature should have explicit acceptance criteria.

Example:

## Image Overlay

Given:

- an existing project,
- a valid JPG/PNG.

When:

- the user uploads it,
- places it on the map,
- adjusts four corners,
- changes opacity,
- saves the project.

Then:

- the overlay remains geographically aligned after reload,
- opacity persists,
- visibility persists,
- image metadata persists,
- deleting the overlay removes it from the project.

This prevents AI agents from saying "feature completed" when only the UI exists.

---

# 39. `CHANGELOG.md`

Every meaningful feature should add:

```text
## YYYY-MM-DD

### Added
- ...

### Changed
- ...

### Fixed
- ...

### Security
- ...
```

This helps AI agents understand project history.

---

# 40. Architecture Decision Records

Create:

```text
docs/ADR/
```

At minimum:

```text
0001-map-engine.md
0002-storage.md
0003-provider-system.md
0004-coordinate-system.md
```

Example:

```text
Decision:
Use MapLibre GL JS.

Reason:
Need open/flexible web map renderer with image overlays,
GeoJSON and external raster/GIS layers.

Alternatives:
Mapbox GL JS
Leaflet

Status:
Accepted
```

This prevents future AI agents from randomly replacing core technologies.

---

# 41. AI Agents You Should Use

You do NOT need ten AI agents coding simultaneously.

Use different AIs for different jobs.

## AI #1 — Primary Coding Agent

Use one strong coding agent as the project owner.

Responsibilities:

- implementation,
- refactoring,
- tests,
- documentation,
- project consistency.

Examples of suitable coding agents:

- Claude Code
- Gemini CLI / Gemini coding environment
- GitHub Copilot coding agent
- Cursor
- other repository-aware coding agents.

Pick **one primary agent**.

Do not let five agents independently rewrite the architecture.

---

# 42. AI #2 — Research Agent

Use a separate AI/web research workflow for:

- government APIs,
- Bhuvan layers,
- data.gov.in,
- Survey of India,
- provider terms,
- current API documentation,
- licensing.

Rule:

> Coding AI should not invent API endpoints.

Research agent finds and verifies them.

Then write the result into:

```text
docs/DATA_SOURCES.md
```

---

# 43. AI #3 — GIS Reviewer

Use an AI with GIS/QGIS knowledge to review:

- CRS,
- GeoJSON,
- projections,
- georeferencing,
- raster/vector handling,
- spatial operations,
- measurement correctness.

This is important because normal web-development AI can produce code that works visually but is geographically incorrect.

---

# 44. AI #4 — Security Reviewer

Use a separate security-focused review periodically.

Check:

- Firebase Rules,
- Storage Rules,
- authentication,
- secrets,
- API exposure,
- file uploads,
- SSRF risks,
- malicious GIS files,
- dependency vulnerabilities,
- provider tokens,
- authorization.

---

# 45. AI #5 — Product/UI Reviewer

Use another AI or visual-capable tool for:

- map UX,
- layer panel,
- overlay controls,
- drawing tools,
- information density,
- responsive behavior,
- accessibility,
- visual hierarchy.

The map should remain the main workspace.

---

# 46. AI Review Pipeline

Recommended workflow:

```text
Idea
 ↓
Research AI
 ↓
Write findings
 ↓
Update docs
 ↓
Primary Coding AI
 ↓
Implement
 ↓
Tests
 ↓
GIS Review
 ↓
Security Review
 ↓
UI Review
 ↓
Merge
```

Do not reverse this.

---

# 47. AI Must Check These Before Writing Code

Every AI coding session should first inspect:

```text
AGENTS.md
PROJECT_SPEC.md
PRODUCT_REQUIREMENTS.md
ARCHITECTURE.md
DATA_MODEL.md
GIS_ARCHITECTURE.md
DATA_SOURCES.md
SECURITY.md
ACCEPTANCE_CRITERIA.md
CHANGELOG.md
```

Then:

1. inspect current repository,
2. understand existing implementation,
3. identify current milestone,
4. identify relevant architecture decisions,
5. implement only requested scope,
6. update tests,
7. update docs,
8. report assumptions.

---

# 48. AI Must NEVER Do These Things

Never allow an AI coding agent to:

- invent government API endpoints,
- invent API credentials,
- copy proprietary map tiles into the repository,
- scrape a provider simply because an API is inconvenient,
- bypass provider restrictions,
- disable Firebase Security Rules to make code work,
- commit secrets,
- silently change map providers,
- silently change coordinate systems,
- silently replace Firebase with another backend,
- delete tests to make a build pass,
- fabricate spatial data,
- claim legal ownership/title from map data,
- implement large features outside the requested milestone.

---

# 49. AI Must Ask / Stop When

The coding AI should stop and flag the issue when:

- an external API's license is unclear,
- a provider prohibits the intended usage,
- a coordinate system is unknown,
- a dataset has unclear accuracy,
- a government endpoint is undocumented,
- a security rule needs to be weakened,
- a secret is required but not configured,
- a requested feature conflicts with architecture,
- a GIS operation requires assumptions about the source data,
- a legal/ownership conclusion is requested.

---

# 50. Git Rules Before Coding

Initialize Git immediately.

Create:

```text
main
develop (optional)
feature/*
```

For a personal project, even:

```text
main
feature/*
```

is sufficient.

Make small commits.

Example:

```text
feat: initialize map workspace
feat: add project persistence
feat: add polygon drawing
feat: add image overlay
feat: add overlay opacity
test: add image overlay persistence tests
docs: document Bhuvan provider
```

---

# 51. `.gitignore`

At minimum ensure:

```text
node_modules/
.next/
.env
.env.*
!.env.example
firebase-debug.log
*.log
.DS_Store
```

Also ignore local/private GIS datasets if necessary.

---

# 52. Do Not Commit Large GIS Data

Do not put huge:

- satellite files,
- GeoTIFFs,
- Shapefiles,
- government downloads,
- raw imagery,
- generated map tiles

into Git.

Use:

- Firebase Storage,
- object storage,
- local fixture directories excluded from Git,
- Git LFS only when genuinely appropriate.

---

# 53. Separate Source Data From Derived Data

For every dataset distinguish:

```text
SOURCE
↓
Raw provider data

DERIVED
↓
Processed/transformed data

USER
↓
Manual annotations

ANALYSIS
↓
Calculated results
```

Never overwrite original source data.

---

# 54. Dataset Metadata

Every imported dataset should ideally have:

```text
Dataset ID
Source
Provider
Original URL
Downloaded/imported at
Source date
Coordinate system
Format
License
Attribution
Processing steps
```

This becomes extremely valuable later.

---

# 55. Accuracy / Confidence

PlotLens should eventually show source confidence.

Example:

```text
Road location
Source: OSM
Confidence: Medium
Last verified: ...
```

or:

```text
Government layer
Source: Official department
Confidence: Source-dependent
```

Do not display fake numeric accuracy if the source does not provide it.

---

# 56. Property Research Checklist

For each property investigation, the eventual workflow can be:

```text
1. Create project
2. Pin property
3. Draw/attach boundary
4. Add satellite/base map
5. Add road layers
6. Add government layers
7. Upload old maps/documents
8. Georeference overlays
9. Add annotations
10. Measure distances
11. Measure area
12. Create buffers
13. Check nearby infrastructure
14. Compare historical/current views
15. Save important views
16. Record notes
17. Record sources
18. Export investigation if needed
```

---

# 57. Recommended Property Analysis Layers

Where legitimate/public data is available, useful categories include:

```text
BASE
- Streets
- Satellite
- Terrain

BOUNDARIES
- State
- District
- Tehsil
- Village
- Municipal

LAND
- Land use
- Land cover
- Parcels where legally/publicly available

TRANSPORT
- Roads
- Highways
- Railways
- Proposed infrastructure

WATER
- Rivers
- Canals
- Lakes
- Water bodies
- Flood-related layers

INFRASTRUCTURE
- Schools
- Hospitals
- Industrial zones
- Utilities where available

PLANNING
- Zoning
- Development plans
- Planning boundaries
- Proposed projects where officially available
```

Availability will vary by location.

---

# 58. Do Not Assume Parcel/Ownership Data Exists

One of the biggest risks in this project is assuming:

```text
Map boundary = legal property boundary
```

That is false in general.

Detailed ownership/cadastral information may be difficult to access or may require official processes.

The application should allow:

```text
User-drawn boundary
```

and clearly label it as:

> User-defined / approximate boundary

unless the source explicitly provides an authoritative boundary.

---

# 59. Existing GIS Community Insight

Current GIS/property-analysis discussions reinforce several useful patterns:

People doing property/site analysis commonly combine:

- parcel boundaries,
- aerial imagery,
- zoning/planning information,
- road access,
- distances,
- photos,
- maps.

Other GIS users also recommend QGIS for workflows involving property boundaries, contours, imagery and imported geographic datasets.

This supports the idea that PlotLens should focus on making this workflow easier rather than trying to invent an entirely new GIS methodology.

---

# 60. First-Day Setup Checklist

Before writing the first feature:

```text
[ ] Choose final project name: PlotLens
[ ] Create Git repository
[ ] Initialize Next.js + TypeScript
[ ] Create AGENTS.md
[ ] Create CLAUDE.md if using Claude
[ ] Create GEMINI.md if using Gemini
[ ] Create docs/
[ ] Add PROJECT_SPEC.md
[ ] Add PRODUCT_REQUIREMENTS.md
[ ] Add ARCHITECTURE.md
[ ] Add GIS_ARCHITECTURE.md
[ ] Add DATA_MODEL.md
[ ] Add DATA_SOURCES.md
[ ] Add SECURITY.md
[ ] Add LICENSES_AND_ATTRIBUTION.md
[ ] Add ACCEPTANCE_CRITERIA.md
[ ] Add CHANGELOG.md
[ ] Create .env.example
[ ] Create .gitignore
[ ] Configure Firebase
[ ] Create Firestore rules
[ ] Create Storage rules
[ ] Configure Firebase Emulator
[ ] Decide MapLibre setup
[ ] Decide initial base-map provider
[ ] Record provider attribution
[ ] Install Turf.js
[ ] Set up testing
```

---

# 61. Before Adding the First Government Layer

Complete:

```text
[ ] Official source identified
[ ] Endpoint verified
[ ] Dataset/layer name verified
[ ] CRS verified
[ ] License verified
[ ] Attribution verified
[ ] Browser usage verified
[ ] Caching policy verified
[ ] Rate limits understood
[ ] Failure behavior designed
[ ] Source recorded in DATA_SOURCES.md
[ ] Provider adapter created
[ ] Integration test created
```

Only then add it to the application.

---

# 62. Before Adding Any Commercial Map API

Complete:

```text
[ ] Account created
[ ] Billing status understood
[ ] Free quota understood
[ ] API key created
[ ] Key restrictions configured
[ ] Domain/IP restrictions configured
[ ] Attribution understood
[ ] Terms reviewed
[ ] Caching/storage restrictions understood
[ ] Production pricing understood
[ ] Fallback provider considered
```

Never make a provider decision based only on "there is a free tier."

---

# 63. Before Public Deployment

Even if the app is initially personal:

```text
[ ] Firebase rules locked down
[ ] Storage rules locked down
[ ] App Check evaluated/enabled
[ ] API keys restricted
[ ] No secrets in Git
[ ] Dependency audit
[ ] File upload limits
[ ] Rate limiting
[ ] Monitoring
[ ] Error tracking
[ ] Provider attribution
[ ] License review
[ ] Privacy review
[ ] Backup/export tested
[ ] Data deletion tested
[ ] Security tests passing
```

Firebase explicitly recommends monitoring/alerting, App Check, and initializing backend security rules in locked/deny-by-default mode.

---

# 64. Suggested AI Team Configuration

If using multiple AI tools:

```text
                    PLOTLENS
                       │
              ┌────────┴────────┐
              │                 │
        PRIMARY CODER       RESEARCH AI
              │                 │
        implementation      APIs/data/terms
              │                 │
              └────────┬────────┘
                       ↓
                 DOCUMENTATION
                       ↓
              ┌────────┴────────┐
              │                 │
          GIS REVIEW        SECURITY REVIEW
              │                 │
              └────────┬────────┘
                       ↓
                   TESTING
                       ↓
                  UI REVIEW
                       ↓
                    MERGE
```

You do not need separate subscriptions/tools for every role. One AI can perform multiple roles if it is instructed explicitly.

---

# 65. Minimum AI Setup

If you want to keep it simple:

### AI 1 — Coding

One repository-aware coding AI.

### AI 2 — Research

ChatGPT/web research or another browser-capable research AI.

### AI 3 — Review

Use a second model occasionally to review:

- security,
- architecture,
- GIS correctness.

That is enough.

---

# 66. Definition of "Ready to Code"

The project is ready for feature coding when these are true:

```text
[✓] Product goal is clear
[✓] MVP is frozen
[✓] Architecture is documented
[✓] Map engine chosen
[✓] Data provider strategy chosen
[✓] External data sources have a registry
[✓] Licensing/attribution process exists
[✓] Security baseline exists
[✓] Firebase rules exist
[✓] Environment variable strategy exists
[✓] AI instructions exist
[✓] Testing strategy exists
[✓] Acceptance criteria exist
[✓] Git is initialized
```

---

# 67. Most Important Rule

The biggest thing to remember:

> **Do not let the coding AI make external-data, GIS, security, or legal assumptions.**

The AI can write the implementation.

But:

```text
Research
   ↓
Verify
   ↓
Document
   ↓
Implement
   ↓
Test
```

should be the workflow.

Not:

```text
AI guesses
   ↓
Code
   ↓
Hope it works
```

---

# 68. Recommended Final Development Flow

```text
                    IDEA
                     ↓
              PRODUCT SPEC
                     ↓
             RESEARCH EXISTING
             PRODUCTS + WORKFLOWS
                     ↓
              DATA SOURCE RESEARCH
                     ↓
             LICENSE / TERMS CHECK
                     ↓
                ARCHITECTURE
                     ↓
             SECURITY BASELINE
                     ↓
              AI CONTEXT FILES
                     ↓
                MVP FREEZE
                     ↓
               IMPLEMENTATION
                     ↓
                 UNIT TESTS
                     ↓
              GIS VALIDATION
                     ↓
              SECURITY REVIEW
                     ↓
                 UI REVIEW
                     ↓
             DOCUMENT CHANGES
                     ↓
                  COMMIT
                     ↓
              NEXT FEATURE
```

---

# 69. The Three Documents That Matter Most

If you are in a hurry and don't want to create everything immediately, create these first:

## 1. `AGENTS.md`

How AI must behave.

## 2. `docs/PROJECT_SPEC.md`

What PlotLens is.

## 3. `docs/DATA_SOURCES.md`

Where every external piece of geographic information comes from and what you are allowed to do with it.

Then add:

```text
SECURITY.md
ARCHITECTURE.md
GIS_ARCHITECTURE.md
ACCEPTANCE_CRITERIA.md
```

before the project becomes substantial.

---

# 70. Final Pre-Flight Checklist

Before asking an AI:

> "Build PlotLens."

verify:

```text
PROJECT
[ ] Name decided
[ ] Purpose decided
[ ] MVP decided
[ ] Non-goals decided

ARCHITECTURE
[ ] Next.js
[ ] TypeScript
[ ] MapLibre
[ ] Turf.js
[ ] Firebase
[ ] Provider abstraction

GIS
[ ] CRS rules
[ ] GeoJSON rules
[ ] Image overlay design
[ ] Measurement strategy
[ ] Import/export strategy

DATA
[ ] OSM usage understood
[ ] Bhuvan researched
[ ] data.gov.in researched
[ ] Survey of India researched
[ ] State/local GIS strategy
[ ] PM Gati Shakti strategy
[ ] Mappls evaluated
[ ] Mapbox evaluated

LEGAL
[ ] Attribution system
[ ] License registry
[ ] Provider terms registry
[ ] No unauthorized scraping
[ ] No unsupported legal claims

SECURITY
[ ] .env.example
[ ] .gitignore
[ ] Firebase rules
[ ] Storage rules
[ ] App Check plan
[ ] Upload limits
[ ] API key restrictions
[ ] No secrets in Git

AI
[ ] AGENTS.md
[ ] CLAUDE.md if needed
[ ] GEMINI.md if needed
[ ] Coding agent selected
[ ] Research workflow selected
[ ] Review workflow selected

QUALITY
[ ] Tests
[ ] Acceptance criteria
[ ] Changelog
[ ] ADRs
[ ] Git

READY
[ ] MVP frozen
[ ] First milestone defined
[ ] AI instructed to inspect docs first
```

---

# 71. Bottom Line

PlotLens can remain a small personal project, but it should be **built with the discipline of a GIS product**.

The biggest risks are not React or MapLibre.

The real risks are:

1. **Using external map/data services incorrectly.**
2. **Assuming government data is authoritative or permanently available.**
3. **Getting coordinate systems/georeferencing wrong.**
4. **Letting AI agents change architecture without understanding the project.**
5. **Weak Firebase/file-upload security.**
6. **Losing track of where geographic data came from.**
7. **Overbuilding before the core image-overlay workflow works.**

The strongest development principle is:

> **Research → Verify → Document → Implement → Test → Review.**

And the strongest product principle is:

> **PlotLens is a spatial investigation workspace, not a legal property verification system and not another generic map application.**
