# Changelog

All notable changes to PlotLens are recorded here. Format loosely follows Keep a Changelog; dates are `YYYY-MM-DD`.

## 2026-08-10

### Added

- Initial project research: product specification, pre-development readiness checklist, security/privacy/compliance checklist, UI/UX design workflow (`docs/research/`).
- Canonical UX/design documentation set: `docs/design/UX_SPECIFICATION.md`, `MAP_INTERACTIONS.md`, `DESIGN_SYSTEM.md`, `USER_FLOWS.md`, distilled from the UI/UX design workflow research doc; `AGENTS.md` UI/UX rules section added.
- Wireframe exploration archived at `docs/design/wireframes/`; validated layout dimensions (176px layers panel, 34px rail/top-bar) folded into `DESIGN_SYSTEM.md` and `PLANNING.md`.
- `docs/research/ai-design-prompt-pack-raw.md` added (external AI design-tool prompt pack, process reference only).
- Image overlay scope extended with `blendMode` and `locked` fields (validated independently by the wireframe and the design prompt pack) — updated in `DATA_MODEL.md` and `design/MAP_INTERACTIONS.md`.
- `docs/ADR/0005-ui-component-library.md`: adopted ReUI (primary) + coss.com/ui (complementary) as the UI component base; Aceternity UI, Tailark, and Skiper UI evaluated and excluded from the core app.
- `docs/PLANNING.md` added: the authoritative phase-by-phase execution plan (tech stack, UI/fonts/theme, flow path, mobile-vs-web, component-library map per phase), reconciling `PRODUCT_REQUIREMENTS.md`'s phase numbering with `design/USER_FLOWS.md`'s build order.
- `docs/plans/` added: detailed, task-level per-phase execution plans (`PLANNING.md` stays the overview; `plans/plan-N.md` is the turn-by-turn breakdown). `plans/plan-1.md` (Phase 1 — Core Map) drafted first.
- Canonical documentation set established: `docs/PROJECT_SPEC.md`, `PRODUCT_REQUIREMENTS.md`, `ARCHITECTURE.md`, `DATA_MODEL.md`, `GIS_ARCHITECTURE.md`, `DATA_SOURCES.md`, `PROVIDER_ARCHITECTURE.md`, `API_CONTRACTS.md`, `COMPETITIVE_ANALYSIS.md`, `ACCEPTANCE_CRITERIA.md`.
- Security/privacy documentation set: `SECURITY.md`, `PRIVACY.md`, `COMPLIANCE.md`, `DATA_CLASSIFICATION.md`, `LICENSES_AND_ATTRIBUTION.md`, `THIRD_PARTY_RISK.md`, `THREAT_MODEL.md`, `SECURITY_TEST_PLAN.md`, `INCIDENT_RESPONSE.md`, `DATA_RETENTION.md`.
- Architecture Decision Records: map engine, storage, provider system, coordinate system (`docs/ADR/`).
- AI-agent instruction files: `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`.
- `.env.example`, `.gitignore`.

### Status

No application code exists yet. Project is in the pre-development/planning phase — see `docs/PRODUCT_REQUIREMENTS.md` for the frozen MVP scope and `AGENTS.md` for what an AI agent may and may not do at this stage.
