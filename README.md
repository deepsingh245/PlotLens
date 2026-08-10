# PlotLens

> Investigate the land. See what surrounds it.

PlotLens is a personal GIS investigation workspace for property, land, and infrastructure research. It lets you place properties on a map, layer in government/open GIS data, upload and georeference old maps or scanned documents over current satellite imagery, draw and measure, and keep a record of what you found and why.

PlotLens is **not** a property marketplace, not a listings site, and not a legal title-verification tool. See [docs/PROJECT_SPEC.md](docs/PROJECT_SPEC.md) §4 for the legal/data principle this project is built around.

**Status: pre-development / planning.** No application code has been written yet. This repository currently exists to establish product, architecture, data-source, and security decisions before the first line of code is written.

## Start here

| If you want to... | Read |
|---|---|
| Understand what PlotLens is and why | [docs/PROJECT_SPEC.md](docs/PROJECT_SPEC.md) |
| See the MVP feature list and non-goals | [docs/PRODUCT_REQUIREMENTS.md](docs/PRODUCT_REQUIREMENTS.md) |
| Understand the technical architecture | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| Work with maps/GIS/coordinates correctly | [docs/GIS_ARCHITECTURE.md](docs/GIS_ARCHITECTURE.md) |
| Know what external data is allowed and how | [docs/DATA_SOURCES.md](docs/DATA_SOURCES.md) |
| Understand security/privacy requirements | [docs/SECURITY.md](docs/SECURITY.md), [docs/PRIVACY.md](docs/PRIVACY.md) |
| Understand the UX/design direction | [docs/design/UX_SPECIFICATION.md](docs/design/UX_SPECIFICATION.md) |
| See the phase-by-phase build plan (stack, UI, flow, mobile/web, components) | [docs/PLANNING.md](docs/PLANNING.md) |
| See the full docs map | [docs/README.md](docs/README.md) |
| Act as an AI coding agent on this repo | [AGENTS.md](AGENTS.md) |

## Tech stack (decided, not yet implemented)

Next.js + TypeScript + React · MapLibre GL JS · Turf.js · Firebase (Firestore + Storage)

See [docs/ADR/](docs/ADR/) for the reasoning behind each choice.

## Repository layout

```text
PlotLens/
├── README.md            this file
├── AGENTS.md            universal AI-agent instructions
├── CLAUDE.md             Claude-specific pointer
├── GEMINI.md             Gemini-specific pointer
├── CHANGELOG.md
├── .env.example
├── docs/                 canonical project documentation (see docs/README.md)
│   ├── ADR/               architecture decision records
│   ├── design/            UX/design canonical docs
│   └── research/          raw research/spec material that fed the canonical docs
├── src/                   (not yet created)
├── tests/                 (not yet created)
└── public/                (not yet created)
```

## Contributing / working on this project

This is currently a solo/personal project built with AI coding assistance. Read [AGENTS.md](AGENTS.md) before making any change, and follow the workflow in [docs/research/predevelopment-readiness-checklist-raw.md](docs/research/predevelopment-readiness-checklist-raw.md) §68: research → verify → document → implement → test → review.
