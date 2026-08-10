# PlotLens — Phase-by-Phase Implementation Planning

This is the single execution-ready plan for building PlotLens: for every phase, what tech stack lands, what UI/fonts/theme apply, which slice of the user journey it serves, how it behaves on mobile vs. desktop web, and which component library each piece should be pulled from. It merges the product roadmap in [PRODUCT_REQUIREMENTS.md](PRODUCT_REQUIREMENTS.md) with the build order in [design/USER_FLOWS.md](design/USER_FLOWS.md) into one numbering — **this file's phase numbers are the authoritative ones for implementation sequencing.**

**Status: planning only.** No `src/` exists yet. This document does not authorize starting implementation by itself — see [AGENTS.md](../AGENTS.md) "Current phase."

## How to use this document

Each phase below is a short overview: **Goal**, **Tech stack**, **UI / fonts / theme**, **Flow path** (the slice of the golden journey it delivers), **Mobile vs. Web**, **Component library map**, and **Exit criteria** (link to [ACCEPTANCE_CRITERIA.md](ACCEPTANCE_CRITERIA.md)). For the detailed, task-by-task execution plan for a given phase, see [plans/](plans/) (`plans/plan-1.md` for Phase 1, etc.) — write a phase's `plan-N.md` when that phase is about to start, not speculatively ahead of time. Do not start a phase's UI work before its predecessor's exit criteria are met — this mirrors the "build incrementally, only the current milestone" rule in [AGENTS.md](../AGENTS.md).

## Platform strategy (applies to every phase)

**One responsive web app, not separate mobile/web codebases.** PlotLens is a Next.js + TypeScript + Tailwind application; mobile-friendliness comes from responsive breakpoints and touch-appropriate interaction patterns (bottom sheets instead of side panels, larger touch targets), not a separate native app or a second frontend. See [design/DESIGN_SYSTEM.md](design/DESIGN_SYSTEM.md) breakpoints (`≥1280px` desktop, `768–1279px` tablet, `<768px` mobile) and [design/UX_SPECIFICATION.md](design/UX_SPECIFICATION.md) §Mobile strategy. A packaged installable PWA is a plausible future nicety, not a committed feature — revisit only after the desktop-web experience is solid.

## Component library strategy (applies to every phase)

Decided in [ADR/0005-ui-component-library.md](ADR/0005-ui-component-library.md):

- **Primary: [ReUI](https://reui.io)** (React + Tailwind + shadcn/ui + Radix Primitives) — accordion, dialog, dropdown, slider, switch, tabs, tooltip, popover, command menu, stepper, data grid, resizable-panel primitives.
- **Secondary: [coss.com/ui](https://coss.com/ui)** (Base UI headless primitives) — used only when ReUI lacks a primitive or a fully unstyled base is genuinely needed (e.g. the floating overlay control bar's exact layout).
- **Not used in the core app:** Aceternity UI and Tailark (marketing/landing-page focused — see ADR-0005) and Skiper UI (paid, motion-forward, conflicts with the "avoid decoration" principle; at most a single cherry-picked component post-MVP).
- Every component copied in from ReUI/coss.com/ui gets re-themed to PlotLens's own tokens (below) — never shipped in its default visual style.

## Fonts & theme (applies to every phase)

| Token | Value | Notes |
|---|---|---|
| UI font | **Inter** (variable, via `next/font/google`, self-hosted) | see [design/DESIGN_SYSTEM.md](design/DESIGN_SYSTEM.md) §Typography |
| Monospace (coordinates/metrics/opacity%) | `ui-monospace, "SF Mono", Menlo, monospace` (system stack) | validated in [design/wireframes/](design/wireframes/) |
| Background | `#0B0D0F` | |
| Surface | `#11151A` | |
| Surface elevated | `#171C22` | |
| Border | `#252B33` | 1px hairlines |
| Text primary | `#F5F7FA` | |
| Text secondary | `#A7AFBA` | |
| Accent | `#B8FF52` | active/selected states and primary actions only — never a background fill |

Full rationale and component/spacing/radius tokens: [design/DESIGN_SYSTEM.md](design/DESIGN_SYSTEM.md).

---

## Phase 0 — Foundations & tooling

**Goal:** an empty, themed, deployable shell — no product features yet.

**Tech stack:** Git init (`main` + `feature/*`) · Next.js (App Router) + TypeScript + React · Tailwind CSS configured with the token table above · shadcn/ui CLI set up (needed to pull in ReUI/coss.com/ui components) · ESLint/Prettier · `.env.local` created from [.env.example](../.env.example).

**UI / fonts / theme:** Wire Inter via `next/font/google`; set the monospace stack as a Tailwind `font-mono` override; encode the color table above as Tailwind theme tokens (not hardcoded hex in components).

**Flow path:** none yet — this phase has no user-facing journey step.

**Mobile vs. Web:** confirm the Tailwind breakpoint config matches [design/DESIGN_SYSTEM.md](design/DESIGN_SYSTEM.md) before any screen is built, so every subsequent phase inherits correct breakpoints automatically.

**Component library map:** install the shadcn CLI; do not yet copy in feature components — only the base theme/utility setup.

**Exit criteria:** app boots, shows an empty themed page in the correct font, dark background — nothing else. No entry in [ACCEPTANCE_CRITERIA.md](ACCEPTANCE_CRITERIA.md) needed for this phase (it has no observable feature).

**Status: done** (2026-08-10) — see [plans/plan-1.md](plans/plan-1.md) implementation notes for what changed along the way (e.g. Tailwind v4 CSS-first theming, MapLibre v6 has no default export).

---

## Phase 1 — Core map

**Goal:** a stable personal map workspace with project persistence — see [PRODUCT_REQUIREMENTS.md](PRODUCT_REQUIREMENTS.md) Phase 1.

**Tech stack:** MapLibre GL JS ([ADR/0001-map-engine.md](ADR/0001-map-engine.md)) · OSM base tiles for dev ([DATA_SOURCES.md](DATA_SOURCES.md) OSM entry) · Firebase Auth (single owner) + Firestore `Project` collection ([DATA_MODEL.md](DATA_MODEL.md), [ADR/0002-storage.md](ADR/0002-storage.md)) · a location-search provider (needs its own [DATA_SOURCES.md](DATA_SOURCES.md) entry before wiring — do not hardcode an undocumented geocoding endpoint).

**UI / fonts / theme:** Top bar at the validated **34px** height ([design/DESIGN_SYSTEM.md](design/DESIGN_SYSTEM.md) §Validated layout dimensions) holding logo, project name, search, save status. Zoom/compass/scale controls per [design/MAP_INTERACTIONS.md](design/MAP_INTERACTIONS.md) — visually quiet, never competing with the map.

**Flow path:** *Create project → choose location → open map → navigate* (golden journey steps 1–3, [design/USER_FLOWS.md](design/USER_FLOWS.md)).

**Mobile vs. Web:** map is full-screen by default on mobile (`<768px`); on web the map sits inside the shell alongside sidebars introduced in later phases. Search input becomes a full-width overlay on mobile rather than a fixed-width top-bar field.

**Component library map:** ReUI `Input`/`Command` for search-with-suggestions; ReUI `Button`/`Card` for the Projects list and New Project dialog; ReUI `Dialog` for project creation. No map-chrome primitive exists in either library — `ZoomControl`/`Compass`/`ScaleBar` are custom, MapLibre-driven components styled to the token table.

**Exit criteria:** [ACCEPTANCE_CRITERIA.md](ACCEPTANCE_CRITERIA.md) §Project system.

**Detailed task plan:** [plans/plan-1.md](plans/plan-1.md). **Status: Track A complete, Track B blocked** on the user creating a real Firebase project — see that file's "Open questions / blockers".

---

## Phase 2 — Drawing

**Goal:** the user can investigate a location manually — marker, line, polygon, circle, text annotation; create/edit/delete/persist. See [PRODUCT_REQUIREMENTS.md](PRODUCT_REQUIREMENTS.md) Phase 2.

**Tech stack:** drawing state lives in `gis/` per [ARCHITECTURE.md](ARCHITECTURE.md) rule 2 (no spatial math inside React components); `Annotation` Firestore writes per [DATA_MODEL.md](DATA_MODEL.md).

**UI / fonts / theme:** right tool rail at the validated **34px** width, compact icon buttons with tooltips, accent-colored active state — see [design/MAP_INTERACTIONS.md](design/MAP_INTERACTIONS.md) §Map tool set. Annotation click opens a contextual side panel (never a separate page), showing location/notes/photos per [design/MAP_INTERACTIONS.md](design/MAP_INTERACTIONS.md) §Annotation UX.

**Flow path:** *drop pin / draw line-polygon / add note* (golden journey steps "drop pins, draw areas, add notes").

**Mobile vs. Web:** tool rail collapses into the bottom toolbar (`Pin · Draw · Measure · Layers · More`) below `768px`; the annotation contextual panel becomes a bottom sheet instead of a side panel.

**Component library map:** ReUI `Tooltip` on every icon button; ReUI `Toggle`/button active-state styling for the selected tool; coss.com/ui `Sheet` for the mobile annotation bottom sheet; ReUI `Popover`/`Card` for the desktop contextual panel.

**Exit criteria:** [ACCEPTANCE_CRITERIA.md](ACCEPTANCE_CRITERIA.md) §Drawing.

**Detailed task plan:** [plans/plan-2.md](plans/plan-2.md). **Status: Track A complete, Track B blocked** on the same Firebase prerequisite as Phase 1 — see that file's "Open questions / blockers". Drawing library: Terra Draw, confirmed and adopted — see [ADR/0006-drawing-library.md](ADR/0006-drawing-library.md).

---

## Phase 3 — Image overlay (the centerpiece)

**Goal:** upload an old map/photo, align it against the real map with four adjustable corners, adjust opacity, save/reload correctly. See [PRODUCT_REQUIREMENTS.md](PRODUCT_REQUIREMENTS.md) Phase 3, [GIS_ARCHITECTURE.md](GIS_ARCHITECTURE.md) §Image overlay.

**Tech stack:** Firebase Storage for the uploaded image ([SECURITY.md](SECURITY.md) §File upload security — allowlist, signature validation, size limits) · `ImageOverlay` Firestore record including the newly-added `blendMode` and `locked` fields ([DATA_MODEL.md](DATA_MODEL.md)).

**UI / fonts / theme:** a **floating contextual control bar** (not a side panel), validated in [design/wireframes/](design/wireframes/) turn 3a — opacity slider, rotation +/−, scale +/−, blend-mode selector (Normal/Multiply/Screen), lock toggle — plus draggable corner handles with a rotate affordance above the overlay. Numeric readouts (`−7.0° · 118%`) in the monospace font. See [design/MAP_INTERACTIONS.md](design/MAP_INTERACTIONS.md) §Image overlay UX for the full control rationale.

**Flow path:** *import image/old map → align overlay → adjust opacity → lock* (golden journey's signature step).

**Mobile vs. Web:** the floating control bar collapses into a bottom sheet on mobile; corner-handle dragging still works via touch, but precision alignment is explicitly a desktop-primary task per [design/UX_SPECIFICATION.md](design/UX_SPECIFICATION.md) §Mobile strategy — don't over-invest in a mobile-optimized alignment UX before the desktop one is proven.

**Component library map:** ReUI `Slider` (opacity, scale), ReUI `Toggle` (lock, visibility), ReUI `Select` (blend mode), ReUI `Popover`/`Toolbar`-style container for the floating bar shell; if ReUI's popover doesn't give enough layout control for the exact floating-bar shape in the wireframe, fall back to a coss.com/ui `Toolbar` primitive (unstyled) per [ADR/0005-ui-component-library.md](ADR/0005-ui-component-library.md).

**Exit criteria:** [ACCEPTANCE_CRITERIA.md](ACCEPTANCE_CRITERIA.md) §Image overlay.

---

## Phase 4 — Data import/export

**Goal:** GeoJSON import/export. See [PRODUCT_REQUIREMENTS.md](PRODUCT_REQUIREMENTS.md) Phase 4.

**Tech stack:** GeoJSON validation per [SECURITY.md](SECURITY.md) §GeoJSON Security (geometry type, coordinate ranges, feature/coordinate count, nesting depth) before anything is written to Firestore.

**UI / fonts / theme:** upload control with a clear supported-format hint (see [design/UX_SPECIFICATION.md](design/UX_SPECIFICATION.md) loading-state guidance — "Processing 1,248 features…" style feedback, not a bare spinner).

**Flow path:** supports the "compare sources" / "export" ends of the golden journey, not a standalone step most users notice.

**Mobile vs. Web:** file picking works the same via the browser's native file input on both; no mobile-specific redesign needed here.

**Component library map:** ReUI `FileUpload` + progress state.

**Exit criteria:** [ACCEPTANCE_CRITERIA.md](ACCEPTANCE_CRITERIA.md) §GeoJSON import/export.

---

## Phase 5 — Layer manager

**Goal:** multiple datasets coexist cleanly — visibility, opacity, order, source metadata. See [PRODUCT_REQUIREMENTS.md](PRODUCT_REQUIREMENTS.md) Phase 5.

**Scope note:** v0.1 (Phases 1–4) only ever needs a base-map toggle (Streets/Satellite) — the full grouped panel (Base Map / Government / My Data / Overlays) described in [design/MAP_INTERACTIONS.md](design/MAP_INTERACTIONS.md) §Layers UX is v0.2+ scope and belongs here in Phase 5, once government layers (Phase 6) exist to populate the "Government" group. Building the full multi-group panel before Phase 6 would mean designing empty groups — sequence it after Phase 6 starts, not before.

**Tech stack:** `Layer` Firestore records per [DATA_MODEL.md](DATA_MODEL.md).

**UI / fonts / theme:** left layers panel at the validated **176px** expanded width, collapsible to a **34px** edge stub ([design/DESIGN_SYSTEM.md](design/DESIGN_SYSTEM.md) §Validated layout dimensions). One row expands on selection to reveal opacity/source controls rather than every row being permanently "heavy" — validated in [design/wireframes/](design/wireframes/) turn 3c.

**Flow path:** *enable/add layers* (golden journey step).

**Mobile vs. Web:** bottom sheet on mobile instead of a side panel — see [design/MAP_INTERACTIONS.md](design/MAP_INTERACTIONS.md) §Layers UX.

**Component library map:** ReUI `Accordion` (grouped stack) + `Slider` (per-layer opacity) + `Switch` (visibility) + drag-handle for reordering; coss.com/ui `Sheet` for the mobile variant.

**Exit criteria:** [ACCEPTANCE_CRITERIA.md](ACCEPTANCE_CRITERIA.md) §Layer manager.

---

## Phase 6 — Government GIS

**Goal:** Bhuvan first, then data.gov.in / Survey of India / state GIS. See [PRODUCT_REQUIREMENTS.md](PRODUCT_REQUIREMENTS.md) Phase 6.

**Hard gate:** no UI work starts until the relevant [DATA_SOURCES.md](DATA_SOURCES.md) entry reaches `verified` status (endpoint, license, CRS, attribution all confirmed against the current primary source) — see [PROVIDER_ARCHITECTURE.md](PROVIDER_ARCHITECTURE.md). This phase is currently blocked on that research, not on UI/frontend work.

**Tech stack:** provider adapter per [PROVIDER_ARCHITECTURE.md](PROVIDER_ARCHITECTURE.md) contract, SSRF domain allowlist per [SECURITY.md](SECURITY.md) §SSRF.

**UI / fonts / theme:** Source Details panel — source/dataset/published/last-checked/license fields per [design/MAP_INTERACTIONS.md](design/MAP_INTERACTIONS.md) §Source-aware UX; "Layer unavailable — last verified: `<date>`" failure state per [design/UX_SPECIFICATION.md](design/UX_SPECIFICATION.md) §Error states.

**Flow path:** *enable government/project layer, inspect source*.

**Mobile vs. Web:** identical information, presented in a bottom sheet on mobile.

**Component library map:** ReUI `Card`/description-list pattern for source details; ReUI `Alert`/`Toast` for the unavailable-layer state.

**Exit criteria:** [ACCEPTANCE_CRITERIA.md](ACCEPTANCE_CRITERIA.md) §Government layer.

---

## Phase 7 — Spatial analysis (measurements)

**Goal:** distance, area, buffer/radius, nearest-feature, intersection, road-impact analysis. See [PRODUCT_REQUIREMENTS.md](PRODUCT_REQUIREMENTS.md) Phase 7.

**Tech stack:** Turf.js for all calculations ([GIS_ARCHITECTURE.md](GIS_ARCHITECTURE.md) §Measurement) — every result traceable to the geometry that produced it.

**UI / fonts / theme:** live floating measurement label while drawing (not a modal) — `12,345 m² / 1.23 hectares` in the monospace font, per [design/MAP_INTERACTIONS.md](design/MAP_INTERACTIONS.md) §Measurement UX.

**Flow path:** *measure distance/area* (golden journey step).

**Mobile vs. Web:** same floating-label pattern works at touch scale; ensure the label doesn't sit under a finger while dragging.

**Component library map:** the floating label is a small custom component (no dialog/modal primitive needed) — optionally built on a coss.com/ui `Toolbar` shell for consistent positioning logic with the Phase 3 overlay control bar.

**Exit criteria:** [ACCEPTANCE_CRITERIA.md](ACCEPTANCE_CRITERIA.md) §Measurements.

---

## Phase 8 — Saved views + investigation timeline

**Goal:** preserve the reasoning behind an investigation. See [PRODUCT_REQUIREMENTS.md](PRODUCT_REQUIREMENTS.md) Phase 8.

**Tech stack:** `SavedView` and `InvestigationEvent` Firestore records per [DATA_MODEL.md](DATA_MODEL.md).

**UI / fonts / theme:** simple event-log timeline, not an audit-system UI — see [PROJECT_SPEC.md](PROJECT_SPEC.md) §25.

**Flow path:** *save investigation* / *revisit why a property was interesting*.

**Mobile vs. Web:** timeline list is naturally responsive (single column either way); no special mobile treatment needed.

**Component library map:** ReUI `Timeline`/`Stepper` component for the investigation history list; ReUI `Card` for a saved-view thumbnail/entry.

**Exit criteria:** add a §Saved views entry to [ACCEPTANCE_CRITERIA.md](ACCEPTANCE_CRITERIA.md) before this phase starts — it doesn't have one yet.

---

## Phase 9 — AI (deferred, not committed)

**Goal:** natural-language spatial queries and investigation summaries, operating only on structured application data. See [PRODUCT_REQUIREMENTS.md](PRODUCT_REQUIREMENTS.md) Phase 9 and [PROJECT_SPEC.md](PROJECT_SPEC.md) §26.

This phase is explicitly gated on Phases 1–8 working reliably first — nothing here is scheduled or designed in detail yet. When it starts: review [PRIVACY.md](PRIVACY.md) §AI and privacy and §Prompt injection, and [COMPLIANCE.md](COMPLIANCE.md) §OWASP LLMSVS 2.0 before writing any AI-facing code.

---

## Mobile-vs-web summary (cross-phase)

| Element | Desktop web | Mobile web |
|---|---|---|
| Layers panel | left side panel, 176px, collapsible | bottom sheet |
| Tool rail | right side panel, 34px | bottom toolbar (Pin/Draw/Measure/Layers/More) |
| Annotation details | contextual side/floating panel | bottom sheet |
| Overlay controls | floating contextual bar | bottom sheet |
| Image alignment precision | primary target | supported, not optimized first |
| Map | ~70–97% of viewport depending on panel state | full-screen by default |

This is the same information as [design/UX_SPECIFICATION.md](design/UX_SPECIFICATION.md) §Mobile strategy and [design/DESIGN_SYSTEM.md](design/DESIGN_SYSTEM.md) breakpoints, collected here as a single reference while implementing.

## What's still genuinely unresolved (do not guess these — verify or ask)

- Location-search/geocoding provider for Phase 1 — not yet in [DATA_SOURCES.md](DATA_SOURCES.md).
- Bhuvan (and every other government provider) endpoint/license verification — blocks all of Phase 6.
- Firebase project creation and `.env.local` values — see [README.md](../README.md) §Contributing; deferred until Phase 0 actually starts.
- Whether a PWA/installable mobile experience is wanted — not committed, mentioned only as a possible future nicety above.
