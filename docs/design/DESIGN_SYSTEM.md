# Design System

Visual language, tokens, and component inventory. Source depth: [../research/ui-ux-design-workflow-raw.md](../research/ui-ux-design-workflow-raw.md) §32–40. Treat the palette/typography below as a starting direction to validate once real screens are built, not an immutable brand spec — but don't drift from it silently; update this file if it changes.

## Visual direction

Dark-first, map-centric, minimal, professional, high contrast, subtle borders, soft rounded surfaces, one bright accent color, very little visual noise. The map must remain visually dominant — never cover it with oversized UI panels (see [UX_SPECIFICATION.md](UX_SPECIFICATION.md) Map Workspace layout).

## Starting palette (direction, to be validated against real content and accessibility contrast checks before lock-in)

```text
Background       #0B0D0F
Surface           #11151A
Surface Elevated  #171C22
Border            #252B33
Text Primary      #F5F7FA
Text Secondary    #A7AFBA
Accent            #B8FF52
```

Run actual contrast checks (WCAG AA at minimum) against this palette once real UI exists — see [Accessibility](#accessibility) below.

## Typography

**Decided:** **Inter** (variable font, loaded via `next/font/google` so it's self-hosted rather than a runtime Google Fonts request) as the primary UI font. For coordinates, opacity/rotation/scale readouts, measurement values, and layer/source metadata, use a **monospace stack** (`ui-monospace, "SF Mono", Menlo, monospace` — a system stack, no extra font download) — this was validated in the wireframe exploration (see [wireframes/](wireframes/)), where numeric/technical readouts in monospace read as more precise and "instrument-like" against the rest of the UI. Don't add a second webfont (e.g. JetBrains Mono) unless the system stack proves visually insufficient once real screens exist — an extra font load isn't worth it preemptively.

Hierarchy: page title, section title, tool title, body, metadata, caption. Avoid excessive font-size variation — the map, not the type scale, should carry visual weight.

## Design tokens (create before implementation, not ad hoc per-component)

```text
colors
spacing        (space-1 … space-8)
radius         (radius-sm, radius-md, radius-lg)
shadows
typography
icon sizes
control heights
z-index
animation duration
```

## Validated layout dimensions (from wireframe exploration)

The wireframe pass in [wireframes/](wireframes/) (open `PlotLens Wireframes.dc.html` in a browser) converged on specific chrome dimensions that keep the map dominant while the sidebars stay usable. Treat these as the starting values, not immutable:

```text
Top bar height        34px
Left layers panel      176px (expanded) / 34px (collapsed to an edge stub)
Right tool rail         34px
Borders                 1px hairlines, not heavy dividers
```

With both panels collapsed, the map occupies roughly 97% of the viewport — this is the "map is the primary workspace" principle (see [UX_SPECIFICATION.md](UX_SPECIFICATION.md)) expressed as an actual number to build against, not just a stated intention.

## Component library

**Decided:** ReUI (primary) + coss.com/ui (complementary, for headless/unstyled primitives) — see [../ADR/0005-ui-component-library.md](../ADR/0005-ui-component-library.md) for the full evaluation and reasoning. Aceternity UI and Tailark are explicitly not used in the core app (marketing-focused); Skiper UI is not adopted as a foundation. Every component below should be sourced from ReUI first, falling back to coss.com/ui only when ReUI lacks the primitive or full unstyled control is genuinely needed.

## Component inventory

General:

```text
Button, IconButton, Tooltip, Search, Panel, Drawer, BottomSheet,
LayerRow, LayerGroup, MapTool, AnnotationCard, SourceCard, PropertyCard,
MeasurementCard, Slider, Toggle, Tabs, Dropdown, CommandMenu, Toast,
Dialog, FileUploader
```

Map-specific:

```text
MapToolbar, LayerControl, OverlayControl, CoordinateDisplay,
ScaleBar, Compass, ZoomControl, SelectionPanel, MeasurementOverlay,
AnnotationPopup
```

Build these as reusable primitives once Phase 1 scaffolding begins — don't let individual screens invent one-off variants of the same control.

## Responsive breakpoints

```text
Desktop   ≥ 1280px
Tablet    768px – 1279px
Mobile    < 768px
```

Each breakpoint gets its own interaction strategy (see [UX_SPECIFICATION.md](UX_SPECIFICATION.md) §Mobile strategy) — do not simply shrink the desktop layout.

## Accessibility

Minimum bar: keyboard navigation, visible focus states, visible labels, ARIA labels on icon-only buttons, readable contrast, tooltips, screen-reader names, reduced-motion support. Never rely on color alone to communicate state — pair it with an icon and/or label (e.g. not just "green = enabled", but a visible toggle + icon + label).

## Animation

Use sparingly. Good: panel open/close, selection feedback, tool activation, toast, bottom sheet. Avoid: constant map animation, large decorative transitions, slow navigation. The app should feel fast — animation duration tokens should default short.

## Figma / handoff (only relevant once a design tool is actually adopted)

If Figma (or another design tool) is used, keep component naming consistent with this file's inventory (e.g. `Button/Primary`, `Layer/Active`) so Figma and code stay in sync. This project has not yet committed to a specific design-tool workflow — treat §39–41, §47 of [../research/ui-ux-design-workflow-raw.md](../research/ui-ux-design-workflow-raw.md) as optional tooling guidance, not a requirement.
