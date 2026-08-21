# CLAUDE.md

Claude Code: this project's behavior rules live in [AGENTS.md](AGENTS.md) — read it first, it is the single source of truth for AI-agent behavior on PlotLens.

Product/technical/security truth lives in:

- [docs/PROJECT_SPEC.md](docs/PROJECT_SPEC.md)
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/DATA_SOURCES.md](docs/DATA_SOURCES.md)
- [docs/SECURITY.md](docs/SECURITY.md)

Do not duplicate their content here — if guidance seems missing, add it to `AGENTS.md` or the relevant `docs/` file, not to this file.

Current phase: **pre-development/planning** — see AGENTS.md "Current phase" before writing any implementation code.


# PlotLens — Claude Instructions

## Codebase Knowledge

PlotLens has a Graphify codebase graph in `graphify-out/`.

Before investigating or changing existing code, use the existing Graphify graph when it can answer the question faster or reduce unnecessary repository exploration.

Use:

`graphify query "<question>"`

Use Graphify especially for:
- architecture
- dependencies
- callers/usages
- data flow
- impact analysis
- locating related modules
- unfamiliar parts of the codebase

Then inspect the actual source files identified by Graphify before making changes.

Do NOT regenerate Graphify for every request.

Regenerate only when the graph is materially stale after significant structural changes:

`graphify . --code-only`

then:

`graphify cluster-only .`

The Graphify graph is a navigation aid, not a replacement for source-code verification.

Prefer the existing graph and targeted source inspection over scanning the entire repository.

## Codebase Understanding

PlotLens has a Graphify codebase graph located at:

- `graphify-out/graph.json`
- `graphify-out/GRAPH_REPORT.md`
- `graphify-out/graph.html`

When working on existing architecture, dependencies, or cross-module changes:

1. Use Graphify to understand relationships when useful.
2. Query with:
   `graphify query "<question>"`
3. Use Graphify results to identify relevant files.
4. Inspect the actual source files before making changes.
5. Do not treat Graphify output as a replacement for reading source code.
6. Do not regenerate the graph for every task.
7. Regenerate it when major architectural/code changes make the graph stale.

## Before Changing Code

For non-trivial changes:

1. Understand the existing implementation.
2. Identify affected modules.
3. Check dependencies and callers.
4. Explain the proposed change.
5. Implement the smallest appropriate change.
6. Run relevant tests/lint/build checks.

## Safety

Do not modify `.env`, credentials, secrets, production configuration,
or unrelated files unless explicitly requested.