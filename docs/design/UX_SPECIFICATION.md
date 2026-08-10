# UX Specification

Design source of truth for PlotLens. Full-length original reasoning, screen sketches, and review checklists: [../research/ui-ux-design-workflow-raw.md](../research/ui-ux-design-workflow-raw.md). This file (plus [MAP_INTERACTIONS.md](MAP_INTERACTIONS.md), [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md), [USER_FLOWS.md](USER_FLOWS.md)) is the canonical version to keep current.

## Product design principle

> A lightweight professional GIS investigation workspace designed for property research.

It should **not** feel like a generic admin dashboard, a spreadsheet, a social application, a form-heavy property CRM, or a generic AI chat application. The map is the primary workspace — the interface supports the map, it does not compete with it. This mirrors [../PROJECT_SPEC.md](../PROJECT_SPEC.md) §2 and [../ARCHITECTURE.md](../ARCHITECTURE.md) rule 1.

## Core UX principles (permanent)

1. Map first.
2. Clarity over decoration.
3. Fewer clicks.
4. Contextual controls over modals.
5. Private by default (matches [../PRIVACY.md](../PRIVACY.md)).
6. Source-aware information — every external layer shows where it came from (see [../DATA_SOURCES.md](../DATA_SOURCES.md)).
7. Clear visual hierarchy.
8. Desktop-first for serious GIS work.
9. Mobile-friendly for field/reference use, not full parity.
10. Every action reversible where practical (undo/redo).
11. Never hide important map information behind unnecessary modals.
12. Never make uncertain GIS data look legally authoritative — this is a UX expression of [../PROJECT_SPEC.md](../PROJECT_SPEC.md) §4.

## Primary persona: Property Investigator

**Goals:** find land, inspect nearby roads, compare old/new maps, check government projects, mark candidate properties, measure land, save notes, compare multiple sources, export findings.

**Frustrations today:** too many separate map websites/tools, fragmented data sources, hard-to-align old maps, poor satellite/map comparison, manual measurement, no single investigation workspace. Design primarily for this persona — this matches the primary user in [../PROJECT_SPEC.md](../PROJECT_SPEC.md) §3.

## Information architecture

```text
PlotLens
├── Projects
├── Project
│   ├── Map
│   ├── Layers
│   ├── Overlays
│   ├── Annotations
│   ├── Measurements
│   ├── Sources
│   └── Export
└── Settings
```

The user should spend most of their time inside **Project → Map**. Everything else exists to support that screen.

## Primary screens (design/build these first — see [USER_FLOWS.md](USER_FLOWS.md) for build order)

1. Projects (list/resume)
2. New Project
3. Map Workspace (the most important screen)
4. Layers Panel
5. Add Image Overlay
6. Align Image Overlay
7. Annotation panel
8. Measurement
9. Source Details
10. Export
11. Project Settings

Do not design or build dozens of secondary screens before this core set works end-to-end.

## Screen: Projects

Purpose: quickly resume or create an investigation. Keep it simple — no analytics dashboard, no unnecessary metadata beyond name and a lightweight summary (e.g. layer count).

## Screen: New Project

Minimum fields: project name, location, optional description. Do not make project creation feel like a government form. Target: create project → map opens, immediately.

## Screen: Map Workspace

```text
┌──────────────────────────────────────────────────────────┐
│ PlotLens   Search location...            Share  Export   │
├──────────────┬───────────────────────────────┬───────────┤
│              │                               │           │
│ PROJECT      │                               │   TOOLS   │
│ Layers       │                               │   Pin     │
│ Base Map     │             MAP               │   Line    │
│ Roads        │                               │   Polygon │
│ Govt data    │                               │   Measure │
│ Overlays     │                               │   Note    │
│ Old map      │                               │   Overlay │
└──────────────┴───────────────────────────────┴───────────┘
```

**Critical rule:** both sidebars must be collapsible, and the map must be able to go nearly full-screen. Matches [../PROJECT_SPEC.md](../PROJECT_SPEC.md) §33's UX principle.

## Empty states (every major area needs one, intentionally designed — never a blank panel)

- No projects yet → "Create your first investigation"
- No overlays → "Add an old map or survey image"
- No annotations → "Drop a pin or draw an area"
- No layers → "Add a data source"

## Loading states

Show meaningful, specific status, not a generic spinner: "Loading map…", "Loading Proposed Roads…", "Preparing image…", "Processing 1,248 features…".

## Error states

Explain what happened, why (if known), and what the user can do. Bad: `Error 500`. Better: *"This government layer is temporarily unavailable. Your project is safe. Try again later or hide this layer."* This directly implements the failure-handling requirement in [../PROVIDER_ARCHITECTURE.md](../PROVIDER_ARCHITECTURE.md) and [../ACCEPTANCE_CRITERIA.md](../ACCEPTANCE_CRITERIA.md).

## Project state persistence

A project remembers: map center, zoom, rotation, active layers, layer opacity, selected overlay, annotations, measurements, and last-selected tool — see [../DATA_MODEL.md](../DATA_MODEL.md) `Project.map` and `SavedView`. Reopening a project should return the user to where they left off.

## Mobile strategy

Desktop is the primary serious-GIS experience. Mobile supports a reduced set: view map, open projects, toggle layers, drop pins, draw, measure, add notes, take/upload photos, inspect annotations. Do not force desktop-level layer management onto mobile — use bottom sheets, not permanent sidebars. See breakpoints in [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md).

## Review checklists (must pass before a feature is considered UX-complete)

**UX:** Can a new user understand the map within 30 seconds? Create a project without instructions? Find layer controls? Add/adjust/move an image overlay? Drop a pin? Measure land? Find a layer's source? Undo a mistake? Reopen their previous investigation? Export it? Use the map with both sidebars collapsed?

**Security (UX-facing):** no private information exposed by default; sharing clearly disabled/default-private; upload UX communicates supported file types; sensitive-document warnings where needed (see [../PRIVACY.md](../PRIVACY.md) §Data minimization); external-source information visible; public/private states explicit.

**Compliance (UX-facing):** source attribution has a UI location; dataset license/date can be displayed; user-generated boundaries are visually distinguishable from official ones (see [../PROJECT_SPEC.md](../PROJECT_SPEC.md) §4); public sharing (when it exists) never auto-exposes private attachments; export includes source metadata where appropriate.

**GIS (UX-facing):** coordinate display, scale bar, north/compass, zoom controls, layer ordering, opacity, drawing, measurement, overlay alignment, and CRS information where relevant are all visible/accessible — see [MAP_INTERACTIONS.md](MAP_INTERACTIONS.md).

## User testing task (run before considering the MVP UX validated)

Give a first-time user only this instruction, unexplained: *"Find a property area, add an old image/map, align it with the current map, mark a candidate area, measure it, add a note, and save the project."* Observe where they hesitate, what they click, what they misunderstand, what they expect, what they miss — then redesign around the friction found, don't just note it and move on.
