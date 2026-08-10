# ADR 0005 — UI Component Library

## Status

Accepted

## Context

PlotLens needs a modular, reusable component base for the application shell around the map (panels, toolbars, sliders, dialogs, dropdowns, tables, etc. — see [../design/DESIGN_SYSTEM.md](../design/DESIGN_SYSTEM.md) component inventory). Building every primitive from scratch is unnecessary work for a solo/personal project; five candidate libraries were evaluated: **Aceternity UI**, **Tailark**, **coss.com/ui**, **ReUI**, and **Skiper UI**.

The visual/interaction direction is already committed in [../design/UX_SPECIFICATION.md](../design/UX_SPECIFICATION.md) and [../design/DESIGN_SYSTEM.md](../design/DESIGN_SYSTEM.md): dark-first, precise, quiet, technical, minimal — explicitly avoiding excessive gradients, glassmorphism, decorative animation, and generic-SaaS-dashboard patterns. Any component library adopted has to fit that direction, not fight it.

## Findings per candidate

| Library | Stack | Focus | Verdict |
|---|---|---|---|
| **Aceternity UI** | React + Tailwind + Framer Motion, shadcn-compatible | Marketing/landing-page components: hero sections, animated backgrounds (aurora, beams, lamp), 3D cards, bento grids, testimonials. Thin on functional app primitives. | Not for the core app — reserve only for a future public marketing/landing page, which is a non-goal today (see [../PRODUCT_REQUIREMENTS.md](../PRODUCT_REQUIREMENTS.md) non-goals). |
| **Tailark** | shadcn/ui + Next.js registry | Marketing-website blocks (hero, pricing, testimonials, CTAs). Explicitly positioned for marketing sites, not dashboards. | Same verdict as Aceternity — not for the core app. |
| **coss.com/ui** | Base UI (unstyled/headless primitives) | Functional app UI: forms (input, select, combobox, date picker), data display (table, pagination, progress), navigation (drawer/sheet, tabs, breadcrumb, accordion), dialogs, context menu, command palette, toolbar. | **Adopted — secondary/complementary.** Headless, so it composes cleanly with PlotLens's own design tokens without fighting a pre-baked visual style. |
| **ReUI** | React + Tailwind + shadcn/ui + Radix Primitives | Large dashboard/app-oriented catalog: full Radix-based primitive set (accordion, dialog, dropdown, slider, tabs, tooltip, switch, popover, etc.) plus advanced patterns (data grid, kanban, gantt, stepper, resizable panels, command menu, file upload). Explicitly "agent-ready" (MCP server for AI coding tools). | **Adopted — primary.** Broadest functional coverage, dashboard/app-grade (not marketing-grade), themeable via Tailwind tokens, and its AI-tooling orientation fits an AI-assisted build process. |
| **Skiper UI** | Tailwind + Next.js + Motion.dev, shadcn-based | Premium, animation-forward "uncommon" components (image reveal, cursor trails, dynamic island, Vercel-style tooltip). Paid ($129 Premium / $549 Exclusive). | **Not adopted as a foundation.** Motion-forward direction conflicts with the "avoid decorative animation" principle; paid tier is hard to justify before the core interaction design is even stable. At most 1–2 individual components may be cherry-picked later for a specific, restrained touch (e.g. a save-status indicator) — evaluated case by case, never adopted wholesale. |

## Decision

- **Primary component base: ReUI** (React + Tailwind + shadcn/ui + Radix Primitives). Every new UI component starts here — accordion/tree-style rows for the layers panel, slider for opacity, switch/toggle for visibility and lock, tabs, dialog, dropdown, tooltip, command menu (for search/quick actions), stepper (for the investigation timeline), resizable-panel primitives for the collapsible sidebars.
- **Secondary/complementary: coss.com/ui** (Base UI headless primitives), used when a needed primitive isn't in ReUI's catalog, or when full unstyled control is actually needed to match a specific PlotLens-only interaction (e.g. the floating overlay control bar's exact layout in [../design/wireframes/](../design/wireframes/)) rather than adapting a pre-styled component.
- **Aceternity UI and Tailark are not installed as dependencies of the core application.** They remain candidates only if/when a public marketing/landing page is built — explicitly out of scope for v0.1 and not currently planned (see [../PRODUCT_REQUIREMENTS.md](../PRODUCT_REQUIREMENTS.md) non-goals).
- **Skiper UI is not adopted as a foundation.** Individual components may be considered later, one at a time, only after the MVP interaction design (Phases 1–6 in [../PLANNING.md](../PLANNING.md)) is stable, and only if the specific paid component is worth its cost for a personal project.

## Reasons

- ReUI's Radix-Primitives foundation gives accessible-by-default behavior (focus management, keyboard nav, ARIA) for free, directly supporting the accessibility bar in [../design/DESIGN_SYSTEM.md](../design/DESIGN_SYSTEM.md) without extra work.
- Both ReUI and coss.com/ui are themeable via Tailwind tokens rather than shipping their own opinionated visual language — critical, since Aceternity/Tailark/Skiper's visual identity (animated, decorative, marketing-forward) would otherwise leak into an app that explicitly wants the opposite.
- Splitting "primary + complementary" rather than picking one library avoids being blocked when ReUI doesn't have a needed primitive, without adopting a third library wholesale.

## Consequences

- `package.json` will depend on ReUI's component set (via shadcn CLI-style copy-in, consistent with how shadcn/ui and its derivatives are typically consumed — components are copied into the repo, not installed as an opaque npm package) plus Base UI (`@base-ui-components/react` or equivalent) for the coss.com/ui primitives actually used.
- Components copied in from either library must be re-themed to PlotLens's tokens (colors, radius, spacing from [../design/DESIGN_SYSTEM.md](../design/DESIGN_SYSTEM.md)) at copy-in time, not left in their default visual style.
- If a marketing/landing page is ever built, revisit this ADR before installing Aceternity/Tailark rather than assuming this decision covers that case.
