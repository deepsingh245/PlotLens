# Acceptance Criteria

Every MVP feature needs explicit given/when/then criteria before it can be marked done. This prevents "the UI exists" from being reported as "the feature is complete." Add a new section here for every feature before or as it's implemented — do not implement a feature that has no entry here.

## Project system

**Given** no existing project, **when** the user creates and names a project, **then** it appears in the project list, persists across a reload, and can be reopened with its saved map center/zoom restored.

**Given** an existing project, **when** the user deletes/archives it, **then** it no longer appears in the active project list and its data is not silently retained in a way that contradicts [DATA_RETENTION.md](DATA_RETENTION.md).

## Drawing (marker / line / polygon / circle / text annotation)

**Given** an open project, **when** the user draws a marker/line/polygon/circle/text annotation, **then** it renders at the correct geographic location, persists on save, survives reload, and can be edited or deleted afterward.

## Image overlay (the centerpiece feature)

**Given** an existing project and a valid JPG/PNG, **when** the user uploads it, places it on the map, adjusts all four corners, changes opacity, and saves the project, **then**:

- the overlay remains geographically aligned (all four corners in their adjusted positions) after a full reload,
- opacity value persists exactly,
- visibility state persists,
- image metadata (name, upload date) persists,
- deleting the overlay removes it from the project's data, not just from the current view.

See [GIS_ARCHITECTURE.md](GIS_ARCHITECTURE.md) for how corner coordinates are represented and why lng/lat ordering must be verified in tests here.

## GeoJSON import/export

**Given** a valid GeoJSON file, **when** the user imports it, **then** every feature renders at the correct location (verified against known coordinates, not just "looks right on screen") and round-trips losslessly through export.

**Given** a malformed or oversized GeoJSON file, **when** the user attempts to import it, **then** the import is rejected with a clear error and nothing partial is written — see validation rules in [SECURITY.md](SECURITY.md) §GeoJSON Security.

## Layer manager (v0.2+)

**Given** multiple layers active, **when** the user toggles visibility, adjusts opacity, or reorders a layer, **then** the map reflects the change immediately and the state persists with the project/saved view.

## Government layer (Bhuvan or other provider, v0.2+)

**Given** a configured provider layer, **when** the provider is unreachable or returns an error, **then** the UI shows "Layer unavailable — last verified: <date>" rather than silently rendering nothing or stale/incorrect data — see [DATA_SOURCES.md](DATA_SOURCES.md) §Failure handling.

## Measurements (v0.2+)

**Given** two points or a drawn polygon, **when** the user requests distance/area, **then** the calculated value matches an independently-verified reference calculation (Turf.js output cross-checked against a known test fixture), not just "a number appears."

## Saved views + investigation timeline

**Given** an open project, **when** the user saves the current view, **then** its map state (center/zoom/bearing/pitch) and selected feature are captured under a name, appear in a list of saved views, and restore the map to that exact state when reopened later.

**Given** an ongoing investigation, **when** an annotation is created, an overlay is added, or a measurement is taken, **then** a corresponding entry appears in the project's investigation timeline in the order it happened, without the user having to log it manually — see [DATA_MODEL.md](DATA_MODEL.md) `InvestigationEvent`.

## Security acceptance criteria (apply across all features)

- User A can never read, edit, or delete User B's project, layer, overlay, or attachment (IDOR check — see [SECURITY_TEST_PLAN.md](SECURITY_TEST_PLAN.md)).
- No feature ships with Firestore/Storage rules in an open (`allow read, write: if true`) state.
- No feature that accepts a URL (WMS, image source, import link) fetches it server-side without going through the domain allowlist in [SECURITY.md](SECURITY.md) §SSRF.
