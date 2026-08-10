# PlotLens Documentation Map

This folder is the single source of truth for PlotLens. Different files own different kinds of truth — do not duplicate content across them; link instead.

```text
AGENTS.md (root)     → AI behavior/instructions
PROJECT_SPEC.md       → product truth (what PlotLens is, vision, philosophy)
PRODUCT_REQUIREMENTS.md → MVP scope, non-goals, roadmap
ARCHITECTURE.md       → technical truth (modules, data flow, stack)
DATA_MODEL.md         → entity/schema truth
GIS_ARCHITECTURE.md   → coordinate systems, CRS, spatial correctness rules
PROVIDER_ARCHITECTURE.md → provider adapter contract
DATA_SOURCES.md       → external data truth (what's allowed, what's verified)
API_CONTRACTS.md      → internal API truth
SECURITY.md           → security truth
PRIVACY.md            → privacy truth
COMPLIANCE.md         → regulatory truth
```

## Full index

### Planning

- [PLANNING.md](PLANNING.md) — the authoritative phase-by-phase execution plan: tech stack, UI/fonts/theme, flow path, and mobile-vs-web behavior for every phase, plus the component-library map. Start here when you're ready to move from docs to code.
- [plans/](plans/) — one detailed, task-level execution plan per phase (`plan-1.md` = Phase 1, etc.). `PLANNING.md` is the overview map; `plans/` is the turn-by-turn directions for each phase.

### Product

- [PROJECT_SPEC.md](PROJECT_SPEC.md) — vision, philosophy, primary user, legal/data principle, feature catalogue, product direction.
- [PRODUCT_REQUIREMENTS.md](PRODUCT_REQUIREMENTS.md) — MVP (v0.1) feature list, non-goals, phased roadmap.
- [COMPETITIVE_ANALYSIS.md](COMPETITIVE_ANALYSIS.md) — QGIS, ArcGIS, Mappls, Bhuvan, Google Earth, Mapbox, MapLibre compared.
- [ACCEPTANCE_CRITERIA.md](ACCEPTANCE_CRITERIA.md) — given/when/then criteria per feature, so "done" is checkable.

### Design

- [design/UX_SPECIFICATION.md](design/UX_SPECIFICATION.md) — product design principle, persona, information architecture, primary screens, empty/loading/error states, review checklists.
- [design/MAP_INTERACTIONS.md](design/MAP_INTERACTIONS.md) — map tool set, layers/overlay/annotation/measurement UX, uncertainty visualization.
- [design/DESIGN_SYSTEM.md](design/DESIGN_SYSTEM.md) — visual direction, palette, typography, tokens, components, breakpoints, accessibility.
- [design/USER_FLOWS.md](design/USER_FLOWS.md) — golden user journey, MVP UX success definition, recommended build order.
- [design/wireframes/](design/wireframes/) — an actual wireframe exploration (open `PlotLens Wireframes.dc.html` in a browser); source of the validated layout dimensions used in DESIGN_SYSTEM.md and PLANNING.md.

### Architecture

- [ARCHITECTURE.md](ARCHITECTURE.md) — system architecture, module boundaries, stack.
- [DATA_MODEL.md](DATA_MODEL.md) — Firestore/Storage entity schemas.
- [GIS_ARCHITECTURE.md](GIS_ARCHITECTURE.md) — CRS, GeoJSON conventions, georeferencing, measurement.
- [PROVIDER_ARCHITECTURE.md](PROVIDER_ARCHITECTURE.md) — the provider adapter contract for map/GIS data sources.
- [API_CONTRACTS.md](API_CONTRACTS.md) — internal API surface.
- [ADR/](ADR/) — architecture decision records (map engine, storage, provider system, coordinate system, UI component library, drawing library).

### Data & external sources

- [DATA_SOURCES.md](DATA_SOURCES.md) — registry of every external map/data provider and its verified terms.
- [LICENSES_AND_ATTRIBUTION.md](LICENSES_AND_ATTRIBUTION.md) — attribution/license tracking for every external asset.

### Security, privacy, compliance

- [SECURITY.md](SECURITY.md) — secrets, Firebase rules, upload security, SSRF, API security.
- [PRIVACY.md](PRIVACY.md) — data inventory, classification, privacy defaults.
- [COMPLIANCE.md](COMPLIANCE.md) — DPDP 2023/2025, IT Act, CERT-In, licensing regimes.
- [DATA_CLASSIFICATION.md](DATA_CLASSIFICATION.md) — classification levels and what belongs in each.
- [DATA_RETENTION.md](DATA_RETENTION.md) — retention/deletion rules per data type.
- [THIRD_PARTY_RISK.md](THIRD_PARTY_RISK.md) — risk register for every external dependency.
- [THREAT_MODEL.md](THREAT_MODEL.md) — assets, threats, mitigations.
- [SECURITY_TEST_PLAN.md](SECURITY_TEST_PLAN.md) — the test matrix that must pass before shipping.
- [INCIDENT_RESPONSE.md](INCIDENT_RESPONSE.md) — what to do when something goes wrong.

### Research (raw input material)

- [research/](research/) — the original AI-research documents this canonical set was distilled from (product spec, pre-development checklist, security/privacy/compliance checklist, UI/UX design workflow). Treat as historical/reference input, not as the current source of truth — if research/ and a canonical doc disagree, the canonical doc wins and research/ should be reconciled or marked superseded.

## Rule

If you're about to add a paragraph of architecture, security, or product reasoning to `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, or `README.md` (root) — stop. Put it in the relevant file above and link to it instead.
