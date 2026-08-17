# Plan 6 — Phase 6: Government GIS (Bhuvan)

**Status:** drafted best-effort, at the user's explicit request, despite the hard gate below not being cleared. **⚠ Every Bhuvan-specific detail in this document (endpoint URL, layer/dataset names, CRS, license text) is an unverified, made-up placeholder — not a real value.** [../DATA_SOURCES.md](../DATA_SOURCES.md)'s Bhuvan entry is `status: unknown`, `last_verified: NEVER`, `url: NOT YET VERIFIED`, with the explicit note *"DO NOT integrate until every field above is filled."* [../PROVIDER_ARCHITECTURE.md](../PROVIDER_ARCHITECTURE.md)'s closing rule: *"Invent an endpoint, layer name, or credential for a provider that hasn't been verified... stop and ask for verification rather than guessing a plausible-looking URL."* [../PLANNING.md](../PLANNING.md)'s own Phase 6 section states a **hard gate**: *"no UI work starts until the relevant DATA_SOURCES.md entry reaches verified status... This phase is currently blocked on that research, not on UI/frontend work."* This plan exists so the shape of the work is visible ahead of time — it is not authorization to implement against the placeholders below. Every `⚠ PLACEHOLDER` value must be replaced with a real, independently-verified value (and the verification recorded in [../DATA_SOURCES.md](../DATA_SOURCES.md)) before a single line of adapter code is written.

This is the detailed task breakdown for [../PLANNING.md](../PLANNING.md) Phase 6 / [../PRODUCT_REQUIREMENTS.md](../PRODUCT_REQUIREMENTS.md) roadmap item 6 ("Bhuvan first, then data.gov.in / Survey of India / state GIS"). It assumes the reader has skimmed [../AGENTS.md](../../AGENTS.md), [../PROVIDER_ARCHITECTURE.md](../PROVIDER_ARCHITECTURE.md), [../DATA_SOURCES.md](../DATA_SOURCES.md), and [plan-5.md](plan-5.md) (the layers panel this phase populates a second group into).

## Objective

By the end of this phase: the layers panel's "Government" group ([../design/MAP_INTERACTIONS.md](../design/MAP_INTERACTIONS.md) §Layers UX) shows Bhuvan-sourced layers a user can toggle on/off, each carrying visible source/license/last-checked metadata, with a defined "Layer unavailable — last verified: `<date>`" failure state when Bhuvan is unreachable — never silent emptiness or stale data presented as current.

## The actual first task, before any of the rest

**Verify Bhuvan** against [../DATA_SOURCES.md](../DATA_SOURCES.md)'s own checklist, in order: official source identified → endpoint verified → dataset/layer name verified → CRS verified → license verified → attribution verified → browser-usage permission verified → caching policy verified → rate limits understood → failure behavior designed → entry recorded in `DATA_SOURCES.md` → *then* the provider adapter gets built → integration test created. This is not a task an AI agent can do by guessing — it needs a human fetching and reading Bhuvan's actual current terms/API docs. Everything below (Tasks 1–6) is what happens *after* that checklist is complete, sequenced so implementation can start immediately once it is — it is explicitly not sequenced to start before it.

## Scope

**In scope (once unblocked):** one provider adapter (Bhuvan), the generic provider-adapter contract/registry it's the first real implementation of, the "Government" layers-panel group, per-layer visibility (reusing [plan-5.md](plan-5.md)'s panel shell), the source-details view, and the unavailable-layer failure state.

**Explicitly out of scope:** data.gov.in, Survey of India, state/local GIS, and commercial providers (Mapbox/Mappls) — [../PROVIDER_ARCHITECTURE.md](../PROVIDER_ARCHITECTURE.md)'s provider-implementation order sequences those strictly after Bhuvan, each independently verified. Per-layer opacity/reorder beyond what [plan-5.md](plan-5.md) already deferred. Any satellite base-map work (that's [plan-5.md](plan-5.md)'s own open blocker, a separate provider gap).

## Technical decisions this plan resolves (architecture only — no invented data)

**The provider adapter follows [../PROVIDER_ARCHITECTURE.md](../PROVIDER_ARCHITECTURE.md)'s frozen contract exactly** — `id`, `name`, `type`, `getCapabilities()`, `getLayers()`, `getLayerMetadata(id)`, `buildLayerSource()`, `health/status`. This part is *not* speculative — it's already-written project architecture, not something this plan invents.

```
providers/
├── osm/        (existing base map, Phase 1 — reused as the reference "already works" adapter shape)
└── bhuvan/      (this phase)
```

**No `if (provider === 'bhuvan')` branch anywhere in UI code** — the layers panel, `LayerManager`, and `Source Details` view call only the generic `Provider` interface. Bhuvan-specific request/response shaping lives entirely inside `providers/bhuvan/`.

**A new `LayerManager` class, mirroring `src/map/OverlayManager.ts`'s role** — the same "owns the MapLibre source/layer bookkeeping for a category of map content" pattern Phase 3 established for image overlays, applied here to provider-backed raster/WMS layers: `add(layer)`, `remove(id)`, `setVisible(id, visible)`, and a failure-state hook (`onLayerError`) that surfaces the "Layer unavailable — last verified: `<date>`" UI state per [../design/UX_SPECIFICATION.md](../design/UX_SPECIFICATION.md) §Error states, instead of a silently-empty layer.

**New domain type/storage, per [../DATA_MODEL.md](../DATA_MODEL.md) (already-designed schema, real, not invented):**
```
Layer     { id, projectId, providerId, datasetId, name, type, visible, opacity, order, sourceMetadata }
Provider  { id, name, type, baseUrl, status }
Dataset   { id, providerId, name, crs, license, attribution, lastVerified }
```
`storage/layers.ts` (Track A: in-memory, mirrors `storage/overlays.ts`'s pattern) + `storage/providers.ts` (a small read-only registry, seeded from whatever's actually verified in `DATA_SOURCES.md` at implementation time — not from this plan's placeholders).

**Every Bhuvan HTTP call is server-side, through the domain allowlist** ([../SECURITY.md](../SECURITY.md) §SSRF: *"unknown URL = BLOCK is the default, not the exception"*) — a `GET /api/providers/:id/layers` route (already listed as "planned" in [../API_CONTRACTS.md](../API_CONTRACTS.md)) proxies Bhuvan the same way `GET /api/geocode` already proxies Nominatim (Phase 1 precedent — see `src/app/api/geocode/route.ts`). The client never fetches Bhuvan directly.

## Task breakdown (sequenced for after verification — do not start early)

### 1. `src/providers/` contract + OSM reference adapter
`src/providers/types.ts` — the `Provider` interface per the contract above. `src/providers/osm/index.ts` — wraps the *already-working* OSM base map (`src/map/osmStyle.ts`) in the new interface, proving the contract fits something real before Bhuvan is attempted. No new behavior, just a reference implementation.

### 2. `src/providers/bhuvan/index.ts` (⚠ blocked — needs real verified values)
```ts
// ⚠ PLACEHOLDER — every value below is invented, not verified. Do not ship.
const BHUVAN_BASE_URL = "https://bhuvan-wms.nrsc.gov.in/bhuvan/wms"; // ⚠ PLACEHOLDER, unverified
const BHUVAN_LAYERS = [
  { id: "lulc250k", name: "Land Use / Land Cover (250k)" }, // ⚠ PLACEHOLDER name, unverified
];
const BHUVAN_CRS = "EPSG:4326"; // ⚠ PLACEHOLDER — Bhuvan's actual native CRS must be confirmed, not assumed
```
Implements `getCapabilities()`/`getLayers()`/`getLayerMetadata()`/`buildLayerSource()` against WMS (per [../GIS_ARCHITECTURE.md](../GIS_ARCHITECTURE.md) §Service types — "Bhuvan and most Indian government portals expose WMS/WMTS... confirm which one a given dataset actually offers"). **The very first real step of this task is deleting every placeholder constant above and replacing it with a verified value**, not writing code around them.

### 3. `src/app/api/providers/[id]/layers/route.ts` (+ `src/app/api/providers/route.ts`)
Server-side proxy, mirroring `src/app/api/geocode/route.ts`'s shape: validates `id` against the provider registry (`status !== "verified"` → `403`, never silently falls through), fetches through the domain allowlist, rate-limits/timeouts per [../PROVIDER_ARCHITECTURE.md](../PROVIDER_ARCHITECTURE.md) rule 5 ("failure is normal, not exceptional").

### 4. `src/map/LayerManager.ts` + `src/map/useLayerManager.ts`
New class per "Technical decisions" above, mirroring `OverlayManager.ts`/`useOverlayManager.ts`'s constructor/hook shape exactly.

### 5. Layers panel "Government" group
Extends [plan-5.md](plan-5.md)'s `src/components/layers/LayersPanel.tsx`'s `BaseMapGroup`-sibling pattern with a `GovernmentGroup` (per-layer visibility toggle, reusing the same disabled+tooltip idiom for a `blocked`/`unavailable` layer). A `Source Details` panel/sheet per [../design/MAP_INTERACTIONS.md](../design/MAP_INTERACTIONS.md) §Source-aware UX (source, dataset, published date, last-checked date, license, accuracy caveat — all read from `Dataset`, none hardcoded in the component).

### 6. Docs
- [../API_CONTRACTS.md](../API_CONTRACTS.md): move `GET /api/providers` / `GET /api/providers/:id/layers` from "planned" to "implemented" once built, with real request/response shapes.
- [../DATA_SOURCES.md](../DATA_SOURCES.md): Bhuvan's row updated with the real verified values — this row is the actual source of truth Task 2 must read from, not this plan.

## Tech stack for this phase

No new base dependency for WMS itself (a `<img>`/MapLibre raster/`image` source consuming a WMS `GetMap` URL needs no client library — same pattern the existing raster OSM style already uses). Possible new dependency only if Bhuvan turns out to require WMS capabilities-XML parsing beyond a hand-rolled minimal parser — decide once `getCapabilities()`'s real response shape is known, not now.

## UI / fonts / theme

Reuses [plan-5.md](plan-5.md)'s panel tokens/dimensions. Source Details view uses the existing `Card`/description-list pattern already in the component library map.

## Flow path delivered

*enable government/project layer, inspect source* — per [../PLANNING.md](../PLANNING.md) Phase 6.

## Mobile vs. web

Identical information; Source Details renders in a bottom sheet on mobile, same `useMediaQuery("(max-width: 767px)")` idiom every other contextual panel in this codebase already uses.

## Component library map

| UI element | Source |
|---|---|
| Government group rows | Same pattern as [plan-5.md](plan-5.md)'s `BaseMapGroup` rows |
| Source Details | `Card` + description-list (already added) |
| Unavailable-layer state | `Alert`/`Toast` (not yet added — `npx shadcn@latest add alert` at implementation time if still missing) |

## Security checklist for this phase (see ../SECURITY_TEST_PLAN.md)

- [ ] No client-side fetch of any provider URL, verified or not — server-side proxy only, through the domain allowlist.
- [ ] `status !== "verified"` (and not explicitly-accepted `experimental`) blocks a provider from being usable, enforced server-side, not just hidden in the UI.
- [ ] Timeout + retry/backoff on every Bhuvan call; a failure renders the defined "Layer unavailable" state, never a silent empty layer or stale data shown as current.
- [ ] IDOR checklist applies once `Layer` records are project-scoped and persisted (Track B) — a project's layer list must never leak another user's layers.

## Exit criteria

[../ACCEPTANCE_CRITERIA.md](../ACCEPTANCE_CRITERIA.md) §Government layer, verbatim: *"Given a configured provider layer, when the provider is unreachable or returns an error, then the UI shows 'Layer unavailable — last verified: `<date>`' rather than silently rendering nothing or stale/incorrect data."*

## Open questions / blockers

- **The hard gate, restated once more so it isn't missed:** this entire phase is blocked on verifying Bhuvan (endpoint, license, CRS, attribution, usage terms, rate limits) in [../DATA_SOURCES.md](../DATA_SOURCES.md). That is a research task for a human, not something to resolve by guessing a plausible-looking URL. Every technical detail in Task 2 above is a placeholder for exactly this reason.
- Track B (Firestore `Layer`/`Provider`/`Dataset` persistence) is additionally blocked on the same Firebase project prerequisite as Phases 1–4.
- Whether Bhuvan's real API turns out to be WMS, WMTS, or something else entirely changes Task 2/3's actual implementation — do not assume WMS is correct; [../GIS_ARCHITECTURE.md](../GIS_ARCHITECTURE.md) explicitly warns not every service type offers the same interactivity.

## Next

Phase 7 (Spatial analysis / measurements, Turf.js) doesn't depend on this phase clearing — see [../PLANNING.md](../PLANNING.md)'s roadmap table (Phase 7 depends on Phases 2–3, not 6). If Bhuvan verification is still pending when work continues, `plan-7.md` is a reasonable next plan to write instead of waiting on this one.
