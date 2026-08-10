# Data Sources Registry

This is one of the three most important files in this project (alongside [AGENTS.md](../AGENTS.md) and [PROJECT_SPEC.md](PROJECT_SPEC.md)). It tracks where every external piece of geographic information comes from and what PlotLens is actually allowed to do with it.

**Rule: no provider is integrated into the application until it has a complete, verified entry here.** An AI coding agent must not invent an endpoint, layer name, or license status. If a provider is needed and has no entry (or a stale one), stop and ask for research/verification instead of guessing.

## Status definitions

- `verified` — endpoint, license, and attribution confirmed against the current primary source.
- `experimental` — being evaluated, not yet safe to rely on in a real project.
- `deprecated` — was verified, no longer trusted (endpoint changed, terms changed, etc.).
- `blocked` — explicitly not to be used (terms prohibit our use case, or access was revoked).
- `unknown` — not yet researched. **Never used in a running project.**

## Entry template

Copy this for every new provider/dataset:

```yaml
provider:
dataset:
service:               # WMS / WMTS / WFS / REST / vector download / raster download
url:
type: raster | vector
authentication:
attribution:
license:
commercial_use_allowed:
caching_allowed:
storage_allowed:
derivative_data_allowed:
rate_limits:
usage_restrictions:
crs:
last_verified:          # YYYY-MM-DD
status: unknown         # verified | experimental | deprecated | blocked | unknown
notes:
```

## Registry

### OpenStreetMap

```yaml
provider: OpenStreetMap
dataset: base map tiles
service: raster tile (XYZ)
url: https://tile.openstreetmap.org/{z}/{x}/{y}.png (dev only, overridable via NEXT_PUBLIC_MAP_STYLE_URL — see notes; public tile.openstreetmap.org is NOT approved for anything beyond light personal/dev use)
type: raster
authentication: none
attribution: "© OpenStreetMap contributors" — must remain visible on the map
license: ODbL
commercial_use_allowed: yes, subject to current tile usage policy
caching_allowed: limited — no bulk/offline tile downloading against the public endpoint
storage_allowed: no persistent bulk storage of downloaded tiles
derivative_data_allowed: yes, per ODbL, with attribution
rate_limits: public endpoint has no formal quota but prohibits abusive/bulk usage — see notes
usage_restrictions: no heavy/production use of tile.openstreetmap.org; use a proper tile provider before scaling beyond personal use
crs: EPSG:3857 (Web Mercator tiles)
last_verified: 2026-08-10 (policy summary only — re-verify current OSM tile usage policy text before Phase 1 ships)
status: experimental
notes: Acceptable for personal-prototype development. Before any usage beyond that, switch to a dedicated OSM-derived tile provider or commercial provider — see ARCHITECTURE.md and PROJECT_SPEC.md §5.
```

### Nominatim (OpenStreetMap Foundation)

```yaml
provider: Nominatim (OpenStreetMap Foundation)
dataset: forward geocoding / place search
service: REST (search endpoint)
url: https://nominatim.openstreetmap.org/search
type: vector (structured JSON results; not a tile/raster layer)
authentication: none required, but a valid identifying HTTP User-Agent (and/or Referer) is required by policy — generic library defaults are not sufficient
attribution: "© OpenStreetMap contributors" — must be shown wherever search results are surfaced, same as the base map
license: ODbL (underlying OSM data); the Nominatim *service* itself is additionally governed by the separate Nominatim Usage Policy
commercial_use_allowed: yes for the underlying data under ODbL; the public nominatim.openstreetmap.org endpoint is for reasonable/non-heavy use only — see usage_restrictions
caching_allowed: yes — results must be cached client-side per policy; repeatedly submitting identical queries may get a client blocked
storage_allowed: do not persist raw response payloads beyond the current search session; storing a coordinate the user explicitly selects (as Project.map.center) is normal user data, not bulk harvesting
derivative_data_allowed: yes, with attribution, subject to ODbL and the Nominatim usage policy
rate_limits: maximum 1 request/second for general/interactive use (bulk/periodic scripted use is capped far lower — 4 requests/minute — and is discouraged; not relevant to PlotLens's interactive search)
usage_restrictions: client-side autocomplete/typeahead is explicitly prohibited by policy ("This is not yet supported by Nominatim and you must not implement such a service on the client side using the API") — search in PlotLens is therefore explicit-submit only (type → Enter/click → results list), never live-suggest-as-you-type; must be called from a server-side proxy, never directly from browser JS (browsers block scripts from setting a custom User-Agent header); the proxy enforces a strict domain allowlist (nominatim.openstreetmap.org only, per SECURITY.md §SSRF) and its own throttle; apps whose *primary* function is geocoding must run their own service — not applicable to PlotLens, whose primary function is GIS investigation
crs: WGS84 / EPSG:4326 — returns decimal lat/lon as strings; converted to the app's [lng, lat] order via src/gis/coordinates.ts, never inline
last_verified: 2026-08-10 (fetched directly from the live policy at operations.osmfoundation.org/policies/nominatim/ this session)
status: verified
notes: Lowest-friction personal-scale default, consistent with the OSM base map already in use. Implemented as a Next.js Route Handler proxy (src/app/api/geocode/route.ts), not a direct client fetch — required both for the User-Agent header and to centralize the rate limit. Reconsider (self-hosted Nominatim, or a paid geocoder) if this app is ever used beyond a single personal owner.
```

### Bhuvan / NRSC

```yaml
provider: Bhuvan (NRSC / ISRO)
dataset: TBD — administrative boundaries / land-use-land-cover / water resources / thematic layers
service: WMS/WMTS (expected — must be confirmed per dataset)
url: NOT YET VERIFIED
type: raster (WMS/WMTS)
authentication: unknown — verify
attribution: unknown — verify required attribution text
license: unknown — verify
commercial_use_allowed: unknown — verify
caching_allowed: unknown — verify
storage_allowed: unknown — verify
derivative_data_allowed: unknown — verify
rate_limits: unknown — verify
usage_restrictions: unknown — verify whether browser/client-side access is permitted at all
crs: unknown — verify per layer
last_verified: NEVER
status: unknown
notes: First government-data integration target (PRODUCT_REQUIREMENTS.md Phase 6). DO NOT integrate until every field above is filled from the current official Bhuvan documentation — not from blog posts or memory. See checklist in research/predevelopment-readiness-checklist-raw.md §8.
```

### data.gov.in

```yaml
provider: data.gov.in (Government Open Data Platform India)
dataset: TBD — identify specific dataset before adding an entry per-dataset
service: varies by dataset — API and/or download; not guaranteed spatial
url: N/A — per-dataset
type: varies
authentication: varies — many datasets require an API key
attribution: content owned by the relevant ministry/state/department/organization
license: Government Open Data License — India (GODL)
commercial_use_allowed: per GODL terms, subject to exemptions (personal info, sensitive/non-shareable data, official symbols, third-party rights excluded)
caching_allowed: verify per dataset
storage_allowed: verify per dataset
derivative_data_allowed: per GODL, with attribution, subject to exemptions above
rate_limits: verify per dataset/API key tier
usage_restrictions: not every dataset is spatial — verify before assuming a GIS use case applies
crs: verify per dataset
last_verified: NEVER
status: unknown
notes: Use as a discovery source (research/predevelopment-readiness-checklist-raw.md §9). Each dataset needs its own verification pass — do not treat "data.gov.in" as one provider with one set of terms.
```

### Survey of India

```yaml
provider: Survey of India
dataset: TBD
service: unknown — verify
url: NOT YET VERIFIED
type: unknown
authentication: unknown — likely restricted/official-process access for detailed data
attribution: unknown — verify
license: unknown — verify, do not assume redistribution or commercial use is allowed
commercial_use_allowed: unknown — verify
caching_allowed: unknown — verify
storage_allowed: unknown — verify
derivative_data_allowed: unknown — verify
rate_limits: N/A until access method is known
usage_restrictions: treat as authoritative only for what the source explicitly represents; never turn a visualization into a legal land-title claim
crs: unknown — verify
last_verified: NEVER
status: unknown
notes: Future integration target, lower priority than Bhuvan. Respect access restrictions strictly — this is likely to be the most access-restricted source in this registry.
```

### PM Gati Shakti ecosystem

```yaml
provider: PM Gati Shakti (National Master Plan)
dataset: TBD — roads / highways / industrial corridors / logistics / infrastructure projects
service: unknown — do not assume a simple public API exists for any given layer
url: N/A — per-layer
type: unknown
authentication: unknown — verify per layer
attribution: unknown — verify
license: unknown — verify
commercial_use_allowed: unknown — verify
caching_allowed: unknown — verify
storage_allowed: unknown — verify
derivative_data_allowed: unknown — verify
rate_limits: unknown
usage_restrictions: for every desired layer — find source, verify public access, verify technical interface, verify license, verify update frequency, only then build an adapter
crs: unknown — verify per layer
last_verified: NEVER
status: unknown
notes: Conceptually high-value (roads/infrastructure planning), but public API access per layer is unconfirmed. Treat each desired layer as its own research task.
```

### Mapbox (optional commercial provider)

```yaml
provider: Mapbox
dataset: base map / geocoding (if adopted)
service: REST / vector tiles
url: N/A unless adopted
type: raster/vector
authentication: API token, must be domain-restricted
attribution: Mapbox attribution required per their ToS when their tiles/data are used
license: Mapbox Terms of Service + product-specific terms
commercial_use_allowed: per current Mapbox pricing/ToS — verify before relying on free tier
caching_allowed: verify — Mapbox restricts storage/caching of certain tile/geocoding data
storage_allowed: verify — do not assume visible browser data may be downloaded/stored
derivative_data_allowed: verify
rate_limits: per plan tier
usage_restrictions: token must be domain/URL restricted; do not assume production-scale usage is free
crs: EPSG:3857 (Web Mercator tiles)
last_verified: NEVER
status: unknown
notes: Not required for MVP — MapLibre + OSM/Bhuvan is the default. Only add if a specific need (better India geocoding, etc.) arises. See ADR/0001-map-engine.md.
```

### Mappls (India-specific commercial provider)

```yaml
provider: Mappls (MapmyIndia)
dataset: maps / search / geocoding / GIS-analytics (if adopted)
service: REST / SDK
url: N/A unless adopted
type: raster/vector + services
authentication: API key, restrictable by domain/IP per Mappls docs
attribution: verify current requirement
license: Mappls terms of service — verify current version
commercial_use_allowed: verify pricing/quota tier
caching_allowed: verify — do not assume
storage_allowed: verify — do not assume
derivative_data_allowed: verify
rate_limits: per plan/quota
usage_restrictions: verify before adoption; create docs/providers/mappls.md with account/product details if adopted (see research/predevelopment-readiness-checklist-raw.md §6)
crs: verify
last_verified: NEVER
status: unknown
notes: Strong India-specific candidate for search/geocoding/POIs. Evaluate only when a concrete need arises — do not adopt "because it has a free tier."
```

## Before adding the first government layer, complete (per provider)

Official source identified → endpoint verified → dataset/layer name verified → CRS verified → license verified → attribution verified → browser-usage permission verified → caching policy verified → rate limits understood → failure behavior designed → entry recorded above → provider adapter created (see [PROVIDER_ARCHITECTURE.md](PROVIDER_ARCHITECTURE.md)) → integration test created.

## Failure handling (applies to every entry above)

Government/commercial endpoints can disappear, move, rate-limit, or change CRS without notice. The UI must show `Layer unavailable — last verified: <date>` rather than silently displaying nothing or stale/incorrect data. See [ACCEPTANCE_CRITERIA.md](ACCEPTANCE_CRITERIA.md) §Government layer.
