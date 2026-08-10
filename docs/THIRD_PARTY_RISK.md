# Third-Party Risk Register

For every major external dependency, track purpose, what data is shared with it, and what happens if it disappears. Complements [DATA_SOURCES.md](DATA_SOURCES.md) (GIS-provider-specific technical/license terms) with a broader risk lens covering infrastructure and library dependencies too.

## Entry template

```text
Provider:
Purpose:
Data shared:
License:
Terms:
Privacy:
Security:
Availability:
Exit strategy:          # what happens if this provider disappears tomorrow
```

## Register

### Firebase (Firestore + Storage + Auth)

```text
Provider: Firebase (Google)
Purpose: primary backend — project/layer/annotation/overlay metadata (Firestore), file storage (Storage), user auth
Data shared: all application data, including SENSITIVE-classified content (coordinates, photos, notes)
License: commercial service, Firebase/Google Cloud ToS
Terms: review data-processing/retention terms before storing sensitive data at any real scale
Privacy: review Firebase's data location/processing terms against DPDP considerations — see COMPLIANCE.md
Security: Firestore/Storage Security Rules are the primary control — see SECURITY.md
Availability: generally high; not a concern for a personal-scale app
Exit strategy: project data is designed to be exportable independently of Firebase (see PROJECT_SPEC.md §10, Rule 10) — GeoJSON/metadata export path must exist before heavy reliance on Firebase-specific features
```

### MapLibre GL JS

```text
Provider: MapLibre GL JS (open-source, no vendor)
Purpose: map rendering engine
Data shared: none (client-side library, no telemetry by default — verify)
License: open-source
Terms: standard OSS license
Privacy: N/A
Security: keep dependency updated; review security advisories periodically
Availability: community-maintained fork of Mapbox GL JS pre-BSL; low bus-factor risk given active ecosystem
Exit strategy: could migrate to Mapbox GL JS or another WebGL map renderer if MapLibre becomes unmaintained — see ADR/0001-map-engine.md
```

### Turf.js

```text
Provider: Turf.js
Purpose: spatial calculations
Data shared: none (client-side library)
License: MIT
Terms: standard OSS
Privacy: N/A
Security: keep dependency updated
Availability: widely used, low risk
Exit strategy: spatial functions are called through gis/ module boundary (see ARCHITECTURE.md) specifically so Turf.js could be swapped without touching UI code
```

### OpenStreetMap (data + public tiles)

```text
Provider: OpenStreetMap Foundation / community
Purpose: base map data/tiles
Data shared: none beyond standard tile requests (IP address to whichever tile server is used)
License: ODbL
Terms: tile usage policy — see DATA_SOURCES.md
Privacy: minimal direct concern; review if usage scales beyond personal/dev use
Security: N/A (no credentials involved for public tiles)
Availability: public infrastructure not guaranteed for production load — see SECURITY.md rate-limit notes
Exit strategy: switch to a dedicated OSM-derived tile provider or commercial provider; MapLibre remains the renderer either way
```

### Government/GIS providers (Bhuvan, data.gov.in, Survey of India, PM Gati Shakti, state/local GIS)

```text
Provider: (per DATA_SOURCES.md entry)
Purpose: government/open GIS layers
Data shared: none from PlotLens to the provider beyond standard requests, unless authenticated access requires registration
License: per-provider — see DATA_SOURCES.md
Terms: unverified/unknown for most — see DATA_SOURCES.md status field
Privacy: minimal direct concern (read-only public data), but do not assume dataset accuracy/completeness
Security: enforce via provider adapter + domain allowlist — see PROVIDER_ARCHITECTURE.md, SECURITY.md §SSRF
Availability: not guaranteed — government endpoints can move/disappear without notice; design for graceful failure (see PROVIDER_ARCHITECTURE.md)
Exit strategy: provider adapter can be disabled independently; the rest of the app does not depend on any single government source being available
```

### AI provider (Phase 9, not yet adopted)

```text
Provider: TBD
Purpose: natural-language spatial queries, investigation summaries
Data shared: potentially SENSITIVE application data (coordinates, notes) — must be minimized and documented before adoption
License/Terms: to be reviewed at adoption time — training-use, retention, data location
Privacy: see PRIVACY.md §AI and privacy; never send private documents by default without a documented reason
Security: prompt injection risk from imported content — see PRIVACY.md §Prompt injection
Availability: AI features are optional by design (PROJECT_SPEC.md §26) — the app must remain fully functional without AI
Exit strategy: AI is additive, never load-bearing for core GIS functionality
```

## npm dependencies (general)

Not itemized individually here — see [SECURITY.md](SECURITY.md) §Dependency security for the per-package adoption checklist. Once `package.json` exists, consider a periodic dependency audit as part of the release checklist.
