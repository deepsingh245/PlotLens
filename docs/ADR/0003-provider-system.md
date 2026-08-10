# ADR 0003 — Provider/Adapter System for External GIS Data

## Status

Accepted

## Context

Government and open GIS data relevant to PlotLens is fragmented across many independent sources (Bhuvan/NRSC, Survey of India, data.gov.in, PM Gati Shakti, state/district/municipal GIS portals) plus optional commercial providers (Mapbox, Mappls). There is no single universal government API, and terms/endpoints/CRS vary per source (see [../DATA_SOURCES.md](../DATA_SOURCES.md)). Hardcoding any one of these into map/UI components would make adding the next one increasingly expensive and would violate [../PROJECT_SPEC.md](../PROJECT_SPEC.md) §38 rules 3–4.

## Decision

Every external map/data source is integrated through a common **provider adapter contract** (see [../PROVIDER_ARCHITECTURE.md](../PROVIDER_ARCHITECTURE.md)): `id`, `name`, `type`, `getCapabilities()`, `getLayers()`, `getLayerMetadata()`, `buildLayerSource()`, and a `health/status` field. The map/layer UI depends only on this contract, never on a specific provider's implementation details.

## Reasons

- Satisfies the architectural rule: *adding a new data provider should not require rewriting the map UI.*
- Lets each provider carry its own failure/caching/rate-limit behavior without that logic leaking into shared UI code (see [../PROVIDER_ARCHITECTURE.md](../PROVIDER_ARCHITECTURE.md) §Rules).
- Makes the `status` field (`verified`/`experimental`/`deprecated`/`blocked`/`unknown`) a hard gate: an unverified provider literally cannot be wired into a real project, which enforces the "never invent an endpoint" rule structurally rather than by convention alone.
- Matches how [../DATA_SOURCES.md](../DATA_SOURCES.md) already tracks providers — the registry and the code contract are two views of the same concept.

## Alternatives considered

- **Direct per-provider integration inside map/layer components** — rejected: this is exactly the pattern §38 rule 3 prohibits, and would make the Bhuvan integration (Phase 6) and every subsequent provider progressively more entangled with UI code.
- **A single generic "fetch any WMS/WFS URL" component with no per-provider adapter** — rejected: it would reintroduce the SSRF risk of fetching arbitrary URLs (see [../SECURITY.md](../SECURITY.md) §SSRF) and lose the place to record provider-specific quirks (auth, CRS, rate limits, known failure modes).

## Consequences

- `providers/osm/`, `providers/bhuvan/`, etc. are added one at a time, each only after its [../DATA_SOURCES.md](../DATA_SOURCES.md) entry reaches `verified` (or explicitly-accepted `experimental`) status.
- The provider's domain(s) must be added to the SSRF allowlist (see [../SECURITY.md](../SECURITY.md) §SSRF) as part of building its adapter, not as an afterthought.
- Every provider adapter needs its own failure-mode handling (timeout, retry/backoff, "layer unavailable" UI state) — see [../PROVIDER_ARCHITECTURE.md](../PROVIDER_ARCHITECTURE.md) §Rules and [../ACCEPTANCE_CRITERIA.md](../ACCEPTANCE_CRITERIA.md) §Government layer.
