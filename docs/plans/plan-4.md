# Plan 4 — Phase 4: Data Import/Export

**Status:** Track A built (2026-08-17) — GeoJSON import (Point/LineString/Polygon → annotations, atomic, capped, `plotlensType`-aware) and export (annotations → downloadable `.geojson`, lossless round-trip) via `src/gis/geojsonImportExport.ts`, wired into `ProjectMenu.tsx`'s dropdown. Build/lint/tsc clean; 26 new unit tests pass (74 total). Interactive (headless-Chromium) verification confirmed: import of a small fixture succeeds with no console errors, export downloads valid GeoJSON containing the imported + pre-existing annotations, and a malformed file is rejected with a specific reason while the dialog stays open. Also fixed a latent bug found while touching `ProjectWorkspace.tsx`'s annotation-seeding effect (it gated on `annotations.length === 0` instead of the hook's real `loading` flag, which would have double-seeded annotations on a brand-new project's first import). No new server route or dependency, per this plan's own resolved decision. **Carried-over risk:** the Phase 2 map-sizing bug (canvas stuck at `height: 300`, see [plan-2.md](plan-2.md), [plan-3.md](plan-3.md)) is still present and limited how much of the on-map result could be visually confirmed — the import/export data path itself is verified independent of it. Track B (Firestore) remains blocked on Firebase project creation, same as Phases 1–3.

This is the detailed task breakdown for [../PLANNING.md](../PLANNING.md) Phase 4 / [../PRODUCT_REQUIREMENTS.md](../PRODUCT_REQUIREMENTS.md) Phase 4 ("bring external spatial data into a project"). It assumes the reader has skimmed [../AGENTS.md](../../AGENTS.md), [plan-2.md](plan-2.md) (annotations, which this phase imports/exports), and the current `src/` tree.

## Objective

By the end of this phase: the user can import a `.geojson` file and have its Point/LineString/Polygon features appear as annotations on the map, and export the project's current annotations back out as a valid GeoJSON file. A file exported by PlotLens and re-imported produces the same annotations (lossless round-trip). No KML, no Shapefile, no other formats — those are later ([../PRODUCT_REQUIREMENTS.md](../PRODUCT_REQUIREMENTS.md) §Supported Data Formats).

## Scope

**In scope:** GeoJSON import (Point/LineString/Polygon → point/line/polygon annotations), GeoJSON export (annotations → a downloadable `.geojson` file), the malformed/oversized-file rejection behavior in [../ACCEPTANCE_CRITERIA.md](../ACCEPTANCE_CRITERIA.md) §GeoJSON import/export.

**Explicitly out of scope:** KML/KMZ/CSV import (v0.2+, later), Shapefile/GeoTIFF (later still), image overlays in the export (this phase is about *vector* annotation data — see [../GIS_ARCHITECTURE.md](../GIS_ARCHITECTURE.md) §Raster vs. vector; overlays are raster and have their own persistence, not a GeoJSON concern), partial/best-effort import of a file where some features are valid and others aren't (see "atomic import" decision below).

## A few technical decisions this plan resolves

**No new server-side endpoint, despite [../API_CONTRACTS.md](../API_CONTRACTS.md)'s original sketch.** That file's "expected shape" section lists `POST /api/import/geojson` and `GET /api/export/geojson/:projectId` as planned routes. GeoJSON is plain JSON — no native parser, no XML/zip complexity like KML — so parsing happens entirely client-side, and import writes annotations the same way drawing already does: through `createAnnotation` (Phase 2), which already goes through Firestore Security Rules for ownership once Track B lands. Export is a client-side `Blob` + temporary `<a download>` click, no server round-trip needed. `API_CONTRACTS.md` should be updated to mark those two routes as *not needed* rather than *not yet built*, in the same change that implements this.

**Reuses `src/gis/annotationGeometry.ts`'s validation, doesn't duplicate it.** Each imported GeoJSON feature's `geometry.type` maps directly to an existing `DrawTool` (`Point`→`"point"`, `LineString`→`"line"`, `Polygon`→`"polygon"` — never `"circle"`, since an arbitrary uploaded polygon can't be known to have started as a circle), then goes through the exact same `validateDrawnFeature`/`toAnnotationGeometry` pipeline Phase 2's drawing tools already use. `MultiPoint`/`MultiLineString`/`MultiPolygon`/`GeometryCollection` are rejected outright — not decomposed into multiple annotations — keeping the geometry model as simple as Phase 2 left it.

**Round-trip fidelity needs a PlotLens-specific GeoJSON property, since plain GeoJSON can't distinguish everything the app needs to.** A `"circle"` annotation and a plain `"polygon"` both serialize as a `Polygon` geometry; a `"text"` note and a plain `"point"` both serialize as a `Point`. Export writes `properties.plotlensType` (the actual `AnnotationType`) alongside the human-meaningful `properties.name`/`description`/`tags`. Import prefers `properties.plotlensType` when present and valid (this is what makes a PlotLens-exported-then-reimported file lossless); falls back to inferring from `geometry.type` for GeoJSON from anywhere else (never inferring `"circle"` or `"text"` in that fallback path, per the paragraph above).

**Import is atomic (all-or-nothing), not partial/best-effort.** If any single feature in the file fails validation, the whole import is rejected with nothing written — matching [../ACCEPTANCE_CRITERIA.md](../ACCEPTANCE_CRITERIA.md)'s "malformed... rejected... nothing partial written" language extended to the natural per-feature case, and matching [../SECURITY.md](../SECURITY.md) §GeoJSON Security's "reject malformed/absurd data rather than trying to fix it silently." A future phase could add partial-import-with-a-report if that turns out to matter in practice — not built now.

## Task breakdown

### 1. `src/gis/geojsonImportExport.ts` (+ tests)
- `parseGeoJsonImport(text: string): { valid: boolean; reason?: string; annotations?: Omit<NewAnnotationInput, "projectId">[] }` — `JSON.parse` (catch and reject malformed JSON), validate top-level shape (`FeatureCollection` with a `features` array, or a bare `Feature`/array of `Feature`s — accept the common variants), enforce a feature-count cap (~2000) and a raw text size cap (~5MB) before doing any per-feature work, then per feature: map geometry type → `DrawTool`, reject unsupported types (`Multi*`, `GeometryCollection`, missing/null geometry) with a specific reason, run `validateDrawnFeature`/`toAnnotationGeometry` from `annotationGeometry.ts`, extract `title`/`description`/`tags` from `properties` (with a string-length cap per property, per [../SECURITY.md](../SECURITY.md) §GeoJSON Security's "property-value sizes"), resolve the annotation type via `properties.plotlensType` (validated against the known `AnnotationType` union) or fall back to the geometry-type mapping.
- `exportAnnotationsToGeoJson(annotations: Annotation[]): string` — maps each `Annotation` to a `Feature` (`geometry` as-is, `properties: { name: title, description, tags, plotlensType: type }`), wraps in a `FeatureCollection`, `JSON.stringify`.
- Tests in `tests/unit/gis/geojsonImportExport.test.ts`: valid FeatureCollection with one of each supported type imports correctly; malformed JSON rejected; oversized feature count rejected; `MultiPolygon`/`GeometryCollection` rejected with a specific reason; a feature exceeding `annotationGeometry.ts`'s existing per-type coordinate-count caps rejected (proving the reuse actually applies); an absurdly long property string rejected; **round-trip**: export a set of annotations (including a `circle` and a `text` one) → import the resulting string → resulting annotations match the originals (minus `id`/timestamps) exactly, proving `plotlensType` does its job.

### 2. Import UI
- `src/components/projects/ImportGeoJsonDialog.tsx` — file input restricted to `.geojson,.json` / `application/geo+json,application/json`, reads the file as text, calls `parseGeoJsonImport`, shows a specific processing message while parsing large files ("Processing 1,248 features…", per [../design/UX_SPECIFICATION.md](../design/UX_SPECIFICATION.md) loading-state guidance — not a bare spinner) and a clear rejection reason on failure (never a generic "Error"). On success, bulk-creates annotations (see Task 3) and closes.
- Wired as a new "Import GeoJSON…" item in `src/components/shell/ProjectMenu.tsx`'s dropdown (already exists, currently only has a disabled "Delete Project" stub) — not a `ToolRail` button; this isn't a drawing tool, it fits the existing "project-level action" menu better, consistent with [../PLANNING.md](../PLANNING.md)'s framing of this phase as supporting the journey's edges, "not a standalone step most users notice."

### 3. Bulk annotation creation (`src/storage/annotations.ts`, `src/projects/annotations/useAnnotations.ts`)
- Add `createAnnotations(inputs: NewAnnotationInput[]): Promise<Annotation[]>` to `storage/annotations.ts` — same validation-before-accept pattern as the existing single `createAnnotation`, but as one batch (Track A: push all into the in-memory array in one go; Track B, later: a single Firestore batched write rather than N individual `addDoc` calls, so this signature is worth getting right now even though Track B is blocked).
- Add the equivalent bulk method to `useAnnotations.ts`'s returned interface, appending all results to local state in one `setAnnotations` call (not N re-renders).
- After a successful import, feed each created annotation into `DrawingManager.addExistingFeature` / the text-marker path (`ProjectWorkspace.tsx`) the same way the existing "seed already-persisted annotations" effect already does — reuse that logic rather than duplicating a second seeding path.

### 4. Export UI
- `src/components/projects/ExportGeoJsonButton.tsx` (or a plain menu item, no dedicated component needed if it's this thin — decide at implementation time) — calls `exportAnnotationsToGeoJson(annotations)`, wraps the string in a `Blob({type: "application/geo+json"})`, creates an object URL, clicks a temporary `<a download="{project name}.geojson">`, revokes the URL immediately after.
- Second new item in `ProjectMenu.tsx`'s dropdown: "Export GeoJSON".
- If the project has zero annotations, the export item is disabled with a tooltip-style hint rather than producing an empty-but-technically-valid file silently.

### 5. `docs/API_CONTRACTS.md` update (same change)
- Remove `POST /api/import/geojson` / `GET /api/export/geojson/:projectId` from the "Expected shape (planned)" list, replacing with a short note: both are client-side-only for GeoJSON (no server round-trip needed) — see this file's "technical decisions" section above. Keeps the doc from describing routes nobody intends to build.

## Tech stack for this phase

No new npm dependency — `JSON.parse`/`Blob`/the DOM `<a download>` pattern cover everything; the geometry validation is entirely reused from Phase 2's `annotationGeometry.ts`.

## UI / fonts / theme

No new theme decisions. The "Processing N features…" loading copy and rejection-reason text use the existing type scale; monospace font for the feature-count readout while processing (`1,248 features`), consistent with how numeric/technical readouts are styled elsewhere ([../PLANNING.md](../PLANNING.md) §Fonts & theme).

## Flow path delivered

Supports the "compare sources" and "export" ends of the golden journey ([../design/USER_FLOWS.md](../design/USER_FLOWS.md)) — bringing in an existing survey's point/line/polygon data, or taking a project's annotations elsewhere. Not a step most users notice on every investigation, per [../PLANNING.md](../PLANNING.md)'s own framing.

## Mobile vs. web

File picking and downloading both work identically via native browser APIs on mobile and desktop — no mobile-specific redesign needed, per [../PLANNING.md](../PLANNING.md) Phase 4's own note. The processing-message dialog reuses the same `Dialog`/`Sheet` responsive pattern already established for other project-level actions.

## Component library map

| UI element | Source |
|---|---|
| Import file picker + processing state | shadcn `Dialog` (already added) + plain `<input type="file">` (same pattern as `AddOverlayDialog.tsx`) |
| Menu items (Import/Export) | shadcn `DropdownMenuItem` (already added, used by `ProjectMenu.tsx`) |
| Export trigger | plain `Button`/`DropdownMenuItem`, no new primitive |

## Security checklist for this phase (see ../SECURITY_TEST_PLAN.md)

- [ ] Malformed JSON rejected before any parsing of "features" is attempted.
- [ ] Feature-count and file-size caps enforced before per-feature validation (cheap rejection first).
- [ ] Every feature's geometry re-validated via `validateDrawnFeature` — never trust an uploaded file's geometry as pre-sanitized just because it parsed as valid JSON.
- [ ] `Multi*`/`GeometryCollection`/holed-polygon inputs rejected, not silently flattened or "fixed."
- [ ] Property value string lengths capped — an absurdly large `properties.description` doesn't get written as-is.
- [ ] Import is atomic — a batch with one invalid feature writes nothing, per the "atomic import" decision above.
- [ ] Export only ever includes the current project's own annotations (no cross-project leakage) — trivially true since it reads from the already-scoped `useAnnotations(project.id)`, but worth a test asserting it explicitly once Track B's real Firestore data exists.

## Exit criteria

[../ACCEPTANCE_CRITERIA.md](../ACCEPTANCE_CRITERIA.md) §GeoJSON import/export, in full: a valid file imports every feature at the correct location and round-trips losslessly through export; a malformed or oversized file is rejected with a clear error and nothing partial is written.

## Open questions / blockers

- None specific to this phase — it builds entirely on Phase 2's already-built annotation pipeline and needs no new external dependency, API route, or Firebase capability beyond what annotations already require (still blocked on the same Firebase project prerequisite as Phases 1–3 for **real persistence**, but the parsing/validation/UI work itself is fully buildable against Track A mock data, same as every prior phase).
- The still-open Phase 2/3 map-sizing bug (see plan-2.md/plan-3.md) doesn't block this phase — nothing here depends on the map container's rendered size.

## Next

[plan-5.md](plan-5.md) (Phase 5 — Layer manager) — not yet written; write it once this phase is underway, not speculatively now.
