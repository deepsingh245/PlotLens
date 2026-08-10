# Provider Architecture

The architectural rule this document exists to enforce:

> **Adding a new data provider should not require rewriting the map UI.**

Government/open-data integrations are fragmented (Bhuvan, Survey of India, data.gov.in, PM Gati Shakti, state/district/municipal GIS, commercial providers like Mapbox/Mappls). None of that fragmentation should leak into UI components — see [ARCHITECTURE.md](ARCHITECTURE.md) rule 3.

## Conceptual folder layout

```text
providers/
├── osm/
├── bhuvan/
├── dataGov/
├── surveyOfIndia/
├── state/
└── custom/
```

## Provider contract

Every provider implements the same conceptual interface (exact TypeScript shape to be finalized at implementation time — this is the frozen contract, not frozen syntax):

```text
Provider
├── id
├── name
├── type                  // "wms" | "wmts" | "wfs" | "rest" | "geojson" | "raster-tiles"
├── getCapabilities()     // what this provider/dataset supports
├── getLayers()           // available layers/datasets
├── getLayerMetadata(id)  // attribution, license, CRS, last-verified date
├── buildLayerSource()    // returns a MapLibre-consumable source definition
└── health/status         // "verified" | "experimental" | "deprecated" | "blocked" | "unknown"
```

The map/layer UI calls only this interface. It must never contain a `if (provider === 'bhuvan')` branch — provider-specific behavior lives inside that provider's adapter.

## Rules

1. **Do not hardcode a government integration directly into a UI component.** If a component needs Bhuvan-specific behavior, that's a sign the Bhuvan adapter's contract is incomplete — extend the contract, not the component.
2. **Provider config (URLs, layer names, credentials) is data, not code embedded in components.** It lives in configuration/`DATA_SOURCES.md`-tracked entries, easy to update without a UI change.
3. **Every provider call goes through the domain allowlist** — see [SECURITY.md](SECURITY.md) §SSRF. A provider adapter fetching an unlisted domain is a bug, not a feature.
4. **Status must gate usage.** An `unknown` or `blocked` provider must never be selectable/active in a real project. Only `verified` (or explicitly-accepted `experimental`) providers may be used — see [DATA_SOURCES.md](DATA_SOURCES.md).
5. **Failure is normal, not exceptional.** Government endpoints disappear, move, rate-limit, or change CRS/layer names without notice. Every provider call needs a timeout, retry/backoff policy, and a defined UI failure state ("Layer unavailable — last verified: <date>") — never a silent empty layer or stale data presented as current.
6. **Caching respects the provider's terms**, not just what's technically possible — see caching column in [DATA_SOURCES.md](DATA_SOURCES.md) per provider.

## Provider implementation order

1. **OSM** — base map, Phase 1. Public tile usage is for personal/dev scale only — see [DATA_SOURCES.md](DATA_SOURCES.md) OSM entry and [SECURITY.md](SECURITY.md) rate-limit rules before any heavier usage.
2. **Bhuvan** — first government provider, Phase 6. Verify endpoint/license/CRS before writing the adapter — see checklist in [DATA_SOURCES.md](DATA_SOURCES.md).
3. **data.gov.in, Survey of India, state/local GIS** — added after Bhuvan, each independently verified. Not every dataset from these sources is spatial or has a simple API — verify before adapting.
4. **Mappls / Mapbox** — evaluated as commercial alternatives/supplements, never as a hard replacement for MapLibre as the renderer (see [ADR/0001-map-engine.md](ADR/0001-map-engine.md)).

## What an AI coding agent must never do here

Invent an endpoint, layer name, or credential for a provider that hasn't been verified in [DATA_SOURCES.md](DATA_SOURCES.md). If a provider integration is requested and the entry doesn't exist yet or is stale, stop and ask for verification rather than guessing a plausible-looking URL.
