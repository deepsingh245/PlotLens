# Licenses and Attribution

Tracks every external data/asset source's license and required attribution — separate from [DATA_SOURCES.md](DATA_SOURCES.md), which tracks the *technical/access* terms of GIS data providers. This file is the attribution-display and license-compliance register for everything, including non-GIS assets (icons, fonts, libraries).

## Entry template

```text
Source:
Usage:                    (what PlotLens uses it for)
Required attribution:     (exact text/format required, if any)
License:
Restrictions:
Verified:                 (date)
```

## Registry

### OpenStreetMap

```text
Source: OpenStreetMap
Usage: base map tiles
Required attribution: © OpenStreetMap contributors — must remain visible on the map, not hidden in a menu
License: ODbL
Restrictions: see current OSM tile usage policy (research/security-privacy-compliance-checklist-raw.md §41); no bulk/offline caching against the public tile endpoint
Verified: 2026-08-10 (re-verify against current OSM policy text before Phase 1 ships — see DATA_SOURCES.md)
```

### MapLibre GL JS

```text
Source: MapLibre GL JS
Usage: map rendering engine
Required attribution: per MapLibre project conventions — include in an about/credits surface, not required on-map beyond standard map attribution
License: open-source (BSD-3-Clause per MapLibre GL JS) — verify current license file at adoption time
Restrictions: none beyond standard open-source license terms
Verified: NOT YET — verify at Phase 1 dependency install time
```

### Turf.js

```text
Source: Turf.js
Usage: spatial calculations (distance, area, buffer, intersection, containment)
Required attribution: none required beyond standard open-source notices
License: MIT — verify current license at adoption time
Restrictions: none
Verified: NOT YET
```

### Firebase (Firestore + Storage)

```text
Source: Firebase (Google)
Usage: project/layer/annotation/overlay metadata storage; image/PDF/GeoJSON/KML file storage
Required attribution: none for end users
License: commercial service, governed by Firebase/Google Cloud Terms of Service
Restrictions: data residency/processing terms apply — review before storing sensitive data at scale; see COMPLIANCE.md and THIRD_PARTY_RISK.md
Verified: NOT YET — review current Firebase ToS at project setup
```

### Bhuvan, data.gov.in, Survey of India, PM Gati Shakti, Mapbox, Mappls

Not yet integrated. Do not add an attribution entry here until the corresponding [DATA_SOURCES.md](DATA_SOURCES.md) entry reaches `verified` status — the attribution requirement and the access terms are verified together, from the same primary source, in the same pass.

## Rule for user-uploaded content

Uploading a file to PlotLens (old maps, photos, PDFs) does not grant PlotLens any redistribution/publication right beyond what's needed to display it back to the uploading user. Never assume upload implies a license to publish, redistribute, sell, or use the content to train an AI model — see [COMPLIANCE.md](COMPLIANCE.md) §Copyright and [PRIVACY.md](PRIVACY.md).

## Where attribution must appear

- Visibly on the map itself for any layer whose license requires on-map attribution (OSM, most WMS/WMTS government layers).
- In map/report exports, if the source's terms require attribution there too — check per source, don't assume export is exempt.
- Never cropped out of an exported image/PDF unless the source's terms explicitly permit that.
