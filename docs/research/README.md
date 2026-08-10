# Research (Raw Input Material)

The three documents in this folder are the original AI-assisted research/spec-drafting output that PlotLens's canonical documentation (in `docs/`) was distilled from:

- `project-specification-raw.md` — original full product specification and AI-context brief.
- `predevelopment-readiness-checklist-raw.md` — original pre-development readiness checklist (file structure, provider checklists, AI-team workflow, etc.).
- `security-privacy-compliance-checklist-raw.md` — original security/privacy/compliance/legal checklist.
- `ui-ux-design-workflow-raw.md` — original UI/UX design workflow (design pipeline, screen sketches, design system direction, review checklists).
- `ai-design-prompt-pack-raw.md` — reusable prompt pack for designing/prototyping PlotLens with external AI design tools (Figma Make, Google Stitch, Claude Artifacts). Process/tooling guidance, not product decisions — treat prompts as optional workflow aids, not requirements.

## Status

These are **historical/reference input**, not the current source of truth. They were used to produce the canonical docs at `docs/` root and `docs/design/` (`PROJECT_SPEC.md`, `PRODUCT_REQUIREMENTS.md`, `ARCHITECTURE.md`, `SECURITY.md`, `design/UX_SPECIFICATION.md`, etc.) — see [../README.md](../README.md) for the map.

If something in a canonical doc conflicts with these files, **the canonical doc wins**. These files contain more exhaustive checklists and reasoning than the canonical docs and are worth reading for depth, but should not be edited to reflect new decisions — update the canonical doc instead, and note here if a section has been fully superseded.

Some content in these files includes citation markers (e.g. `citeturn1search1`) from the original research pass — those referenced external sources (government data-license pages, Firebase docs, OWASP, etc.) but the raw citation IDs are not resolvable outside that original session. Treat factual/legal claims in these files as needing re-verification against current primary sources before being relied upon (see [../DATA_SOURCES.md](../DATA_SOURCES.md) and [../COMPLIANCE.md](../COMPLIANCE.md) verification workflow).
