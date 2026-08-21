# Start Here — the PlotLens docs, in order

This project has ~40 docs. This file is the one to open first — it tells you what order to read things in, gives a lookup table for "I need to know X," and then indexes every single doc with a one-line description and a link. Nothing here duplicates another doc's content; it only points at it.

**How this relates to the other top-level files**, since there are a few and it's fair to wonder why:
- **This file** — human-oriented navigation: what to read, in what order, for what purpose.
- [`../README.md`](../README.md) — the project's front door (what PlotLens is, how to run it, tech stack) — shorter, less complete than this file's index.
- [`README.md`](README.md) — a folder-level map of `docs/`, organized by category (product/architecture/security/etc.), truth-ownership rules. Good as a quick categorical reference once you already know the landscape; this file is better the first few times.
- [`../AGENTS.md`](../AGENTS.md) — instructions for AI coding agents specifically (what an agent must read before touching code, hard rules it must never violate). Not written for a human reading for context, but worth skimming if you want to know what constraints Claude/other agents are operating under.

## If you're catching up for the first time, read these seven in order

1. [PROJECT_SPEC.md](PROJECT_SPEC.md) — what PlotLens *is*: vision, the "investigate the land" framing, who it's for, and the one rule that shapes everything else (§4: never present map analysis as legal/ownership certainty).
2. [PRODUCT_REQUIREMENTS.md](PRODUCT_REQUIREMENTS.md) — the frozen MVP (v0.1) scope: what's in, what's explicitly *not* in, and the phased roadmap (this is where "Phase 1," "Phase 7," etc. are defined).
3. [ARCHITECTURE.md](ARCHITECTURE.md) — the system shape: Next.js → MapLibre → providers/user-data/overlays → Firebase, module boundaries (`gis/`, `map/`, `providers/`, `projects/`, `storage/`), and three rules that constrain every later decision (map-first, GIS/UI separation, providers-as-adapters).
4. [GIS_ARCHITECTURE.md](GIS_ARCHITECTURE.md) — the spatial ground rules: WGS84/`[lng, lat]` always, raster-vs-vector, the four-corner image-georeferencing model that's the app's centerpiece feature.
5. [design/UX_SPECIFICATION.md](design/UX_SPECIFICATION.md) — the design philosophy (map as primary workspace, not a dashboard), the persona, the core UX principles everything else in `design/` builds on.
6. [PLANNING.md](PLANNING.md) — the phase-by-phase execution overview: tech stack, UI/theme, and mobile-vs-web behavior for every phase, Phase 0 through 9.
7. [plans/README.md](plans/README.md) — then open whichever `plans/plan-N.md` matches the phase you care about for the actual task-level build record and current status.

That's enough to understand what the project is, why it's built the way it is, and where things currently stand. Everything past this point is reference material you dip into as needed — see the lookup table below.

## What's actually built right now

Sourced from [plans/README.md](plans/README.md), which is kept current — check that file directly if this feels out of date.

| Phase | What | Status |
|---|---|---|
| 1 — Core Map | Map rendering, project shell, location search | Track A complete; Track B (real persistence) blocked on a Firebase project |
| 2 — Drawing | Pin/Line/Polygon/Circle/Note annotations | Track A built |
| 3 — Image Overlay | Upload + four-corner georeference, opacity, lock | Track A built; Track B blocked on Firebase Storage |
| 4 — Data Import/Export | GeoJSON import/export | Track A built, no Track B needed (client-side only) |
| 5 — Layer manager | Collapsible layers panel | Track A built (panel shell only — no verified second base-map provider yet) |
| 6 — Government GIS (Bhuvan) | First external provider adapter | **Hard-gated** — Bhuvan's endpoint/license/CRS are unverified; plan is a best-effort placeholder, not implementation-ready |
| 7 — Measurements | Distance/area via Turf.js | Track A built (buffer/nearest/intersection deferred) |
| 8 — Saved views + timeline | Save/restore view, auto-logged event log | Track A built |
| 9 — AI | Natural-language spatial queries | Explicitly deferred, not scheduled |

Two standing blockers explain most of the "Track B blocked" rows above: **no Firebase project exists yet** (blocks all real persistence), and **no second map/data provider has been verified** in [DATA_SOURCES.md](DATA_SOURCES.md) (blocks Phase 5 going further and all of Phase 6).

## "I need to know/do X" — lookup table

| If you want to... | Read |
|---|---|
| Know what's built vs. blocked right now | [plans/README.md](plans/README.md) (table above is a snapshot of it) |
| Add a new feature / start the next phase | [PLANNING.md](PLANNING.md) for the overview, then that phase's `plans/plan-N.md` for the task list |
| Work with map coordinates without a lng/lat bug | [GIS_ARCHITECTURE.md](GIS_ARCHITECTURE.md), and [ADR/0004-coordinate-system.md](ADR/0004-coordinate-system.md) for why |
| Add or change a UI component | [design/DESIGN_SYSTEM.md](design/DESIGN_SYSTEM.md) for tokens, [ADR/0005-ui-component-library.md](ADR/0005-ui-component-library.md) for which library |
| Understand a map interaction (drawing, layers, measurement UX) | [design/MAP_INTERACTIONS.md](design/MAP_INTERACTIONS.md) |
| Touch anything auth/upload/external-fetch related | [SECURITY.md](SECURITY.md), then [SECURITY_TEST_PLAN.md](SECURITY_TEST_PLAN.md) for what must pass before it ships |
| Check if a data provider/endpoint is allowed to be used | [DATA_SOURCES.md](DATA_SOURCES.md) (registry + verification status) and [PROVIDER_ARCHITECTURE.md](PROVIDER_ARCHITECTURE.md) (the adapter contract) |
| Understand why we're on MapLibre/Firebase/Terra Draw/etc. | [ADR/](ADR/) — one file per past decision |
| Check the entity/data schema (Project, Annotation, Layer, ...) | [DATA_MODEL.md](DATA_MODEL.md) |
| Know what's tracked as "done" for a feature | [ACCEPTANCE_CRITERIA.md](ACCEPTANCE_CRITERIA.md) |
| Understand privacy/data-retention/legal posture | [PRIVACY.md](PRIVACY.md), [DATA_CLASSIFICATION.md](DATA_CLASSIFICATION.md), [DATA_RETENTION.md](DATA_RETENTION.md), [COMPLIANCE.md](COMPLIANCE.md) |
| Respond to a real security incident | [INCIDENT_RESPONSE.md](INCIDENT_RESPONSE.md) |
| See how PlotLens compares to QGIS/ArcGIS/Bhuvan/etc. and why it's scoped differently | [COMPETITIVE_ANALYSIS.md](COMPETITIVE_ANALYSIS.md) |
| Know what an AI coding agent is/isn't allowed to do here | [../AGENTS.md](../AGENTS.md) |
| See the original raw research a canonical doc was distilled from | [research/](research/) — historical only, canonical docs win on any conflict |

## Full index, by category

### Product & scope
- [PROJECT_SPEC.md](PROJECT_SPEC.md) — vision, philosophy, primary user, the legal/data principle, tech stack table.
- [PRODUCT_REQUIREMENTS.md](PRODUCT_REQUIREMENTS.md) — MVP feature list, non-goals, phased roadmap.
- [COMPETITIVE_ANALYSIS.md](COMPETITIVE_ANALYSIS.md) — QGIS/ArcGIS/Mappls/Bhuvan/Google Earth/Mapbox/MapLibre compared, what to learn from each vs. not try to match.
- [ACCEPTANCE_CRITERIA.md](ACCEPTANCE_CRITERIA.md) — given/when/then done-criteria per feature.

### Execution planning
- [PLANNING.md](PLANNING.md) — phase-by-phase overview (tech stack, theme, mobile-vs-web, component map) for every phase.
- [plans/README.md](plans/README.md) — index of the per-phase task-level plans, with current status.
- [plans/plan-1.md](plans/plan-1.md) through [plan-8.md](plans/plan-8.md) — one file per phase's actual build record (see the status table above for a summary of each).

### Architecture
- [ARCHITECTURE.md](ARCHITECTURE.md) — system diagram, module boundaries, core architecture rules.
- [DATA_MODEL.md](DATA_MODEL.md) — entity/schema definitions (Project, Annotation, ImageOverlay, Layer, SavedView, InvestigationEvent, Provider/Dataset).
- [GIS_ARCHITECTURE.md](GIS_ARCHITECTURE.md) — CRS, coordinate order, raster/vector, georeferencing, measurement rules.
- [PROVIDER_ARCHITECTURE.md](PROVIDER_ARCHITECTURE.md) — the provider-adapter contract every external data source must implement.
- [API_CONTRACTS.md](API_CONTRACTS.md) — internal API surface (what's actually implemented vs. planned).
- [ADR/0001-map-engine.md](ADR/0001-map-engine.md) — why MapLibre GL JS over Mapbox GL JS/Leaflet.
- [ADR/0002-storage.md](ADR/0002-storage.md) — why Firebase over Postgres+PostGIS or a custom backend.
- [ADR/0003-provider-system.md](ADR/0003-provider-system.md) — why the adapter contract over per-provider UI branching or a generic "fetch any URL" approach.
- [ADR/0004-coordinate-system.md](ADR/0004-coordinate-system.md) — why WGS84/`[lng, lat]` is locked app-wide.
- [ADR/0005-ui-component-library.md](ADR/0005-ui-component-library.md) — why ReUI + coss.com/ui over the alternatives evaluated.
- [ADR/0006-drawing-library.md](ADR/0006-drawing-library.md) — why Terra Draw over hand-rolled drawing or mapbox-gl-draw.

### Data & external sources
- [DATA_SOURCES.md](DATA_SOURCES.md) — registry of every external provider, verification status, what's allowed.
- [LICENSES_AND_ATTRIBUTION.md](LICENSES_AND_ATTRIBUTION.md) — attribution/license tracking per external asset.

### Design & UX
- [design/UX_SPECIFICATION.md](design/UX_SPECIFICATION.md) — design philosophy, persona, information architecture.
- [design/MAP_INTERACTIONS.md](design/MAP_INTERACTIONS.md) — tool set, layers/overlay/annotation/measurement UX.
- [design/DESIGN_SYSTEM.md](design/DESIGN_SYSTEM.md) — palette, typography, tokens, validated layout dimensions.
- [design/USER_FLOWS.md](design/USER_FLOWS.md) — the golden user journey, recommended build order.
- [design/wireframes/](design/wireframes/) — the actual wireframe exploration (open the `.dc.html` file in a browser).

### Security, privacy & compliance
- [SECURITY.md](SECURITY.md) — core security principles, secrets handling, upload/SSRF/API security.
- [SECURITY_TEST_PLAN.md](SECURITY_TEST_PLAN.md) — the test matrix that must pass before a feature ships.
- [PRIVACY.md](PRIVACY.md) — data inventory, classification, privacy defaults.
- [COMPLIANCE.md](COMPLIANCE.md) — DPDP Act/Rules, IT Act, CERT-In, licensing regimes (not legal advice).
- [DATA_CLASSIFICATION.md](DATA_CLASSIFICATION.md) — the five classification levels and what belongs in each.
- [DATA_RETENTION.md](DATA_RETENTION.md) — retention/deletion rules per data type.
- [LICENSES_AND_ATTRIBUTION.md](LICENSES_AND_ATTRIBUTION.md) — see Data & external sources above.
- [THIRD_PARTY_RISK.md](THIRD_PARTY_RISK.md) — risk register per external dependency (Firebase, MapLibre, ...).
- [THREAT_MODEL.md](THREAT_MODEL.md) — assets, threats, mitigations.
- [INCIDENT_RESPONSE.md](INCIDENT_RESPONSE.md) — the incident-response runbook.

### Research (raw, historical input — not current truth)
- [research/README.md](research/README.md) — explains these are the original AI-research drafts, superseded by the canonical docs above.
- [research/project-specification-raw.md](research/project-specification-raw.md) — source for PROJECT_SPEC.md.
- [research/predevelopment-readiness-checklist-raw.md](research/predevelopment-readiness-checklist-raw.md) — source for COMPETITIVE_ANALYSIS.md and parts of SECURITY.md.
- [research/security-privacy-compliance-checklist-raw.md](research/security-privacy-compliance-checklist-raw.md) — source for SECURITY.md/COMPLIANCE.md/LICENSES_AND_ATTRIBUTION.md.
- [research/ui-ux-design-workflow-raw.md](research/ui-ux-design-workflow-raw.md) — source for the whole `design/` set.
- [research/ai-design-prompt-pack-raw.md](research/ai-design-prompt-pack-raw.md) — a prompt pack for prototyping via external AI design tools; process guidance, not a decision doc.

## The one rule this project holds itself to

Every doc above owns a specific kind of truth, and none of them repeat each other's content — they link instead. If you ever find the same fact stated two different ways in two docs, that's a bug in the docs: whichever is more specific to the topic wins, and the other should be fixed to link to it instead of restating it.
