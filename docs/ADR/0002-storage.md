# ADR 0002 — Storage / Persistence

## Status

Accepted

## Context

PlotLens needs to persist project metadata (map state, layers, annotations, overlays — see [../DATA_MODEL.md](../DATA_MODEL.md)) and binary content (uploaded images, PDFs, GeoJSON/KML files). The project is currently a personal-scale prototype, not a production multi-tenant service (see [../PROJECT_SPEC.md](../PROJECT_SPEC.md) §3).

## Decision

Use **Firebase** — Firestore for structured project/metadata, Firebase Storage for binary attachments — as the initial persistence layer.

## Reasons

- Matches the project owner's existing experience, minimizing setup friction for a personal prototype.
- Firestore's document model maps reasonably well onto the project/layer/annotation/overlay structure in [../DATA_MODEL.md](../DATA_MODEL.md) without needing a spatial database yet.
- Firebase Storage handles binary attachments with the same auth model as Firestore, simplifying ownership enforcement (see [../SECURITY.md](../SECURITY.md) §Authorization model).
- Firebase Security Rules + the Emulator Suite give a workable path to a private-by-default backend without standing up custom server infrastructure.

## Alternatives considered

- **PostgreSQL + PostGIS** — the eventual preferred spatial backend for large datasets, spatial indexing, and advanced spatial queries (see [../PROJECT_SPEC.md](../PROJECT_SPEC.md) §5). Explicitly **not** adopted now — introducing PostGIS prematurely would add operational overhead (hosting, migrations, connection management) the personal-scale MVP doesn't need. This decision should be revisited via a new ADR if/when Firestore's query or spatial-analysis limits actually become a blocker (Phase 7 spatial analysis is the most likely trigger).
- **A custom backend (Node/Express + a SQL database)** — rejected for now as unnecessary infrastructure for a single-owner personal tool; would also require building auth from scratch, which Firebase Auth already provides.

## Consequences

- All Firestore/Storage access must go through owner-scoped Security Rules from day one (see [../SECURITY.md](../SECURITY.md) §Firebase security rules) — this is not optional even though there's currently one user.
- Project data must remain exportable independently of Firebase (GeoJSON + metadata export path) so the choice doesn't become permanent lock-in — see [../PROJECT_SPEC.md](../PROJECT_SPEC.md) §38 rule 10 and [../THIRD_PARTY_RISK.md](../THIRD_PARTY_RISK.md) Firebase exit strategy.
- A future migration to PostGIS is anticipated in the architecture (see [../ARCHITECTURE.md](../ARCHITECTURE.md) "Future" diagram) but is out of scope until a new ADR supersedes this one.
