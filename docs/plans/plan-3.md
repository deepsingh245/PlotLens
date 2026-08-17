# Plan 3 — Phase 3: Image Overlay (the centerpiece feature)

**Status:** Track A built (2026-08-17) — geometry helpers, `OverlayManager` (native MapLibre image source + draggable corner `Marker`s), `AddOverlayDialog`/`OverlayControlBar`/`DeleteOverlayDialog`, and the `ToolRail`/`ProjectWorkspace` wiring are all in place, type-checked, lint-clean, and unit-tested (build/lint/tsc/tests all pass). A quick interactive check confirmed the Add Overlay dialog opens correctly with no console errors. **Track B (real Firestore + Storage) is still blocked** on the user creating a Firebase project with Storage enabled — same blocker as Phases 1–2, additionally needing Storage specifically.

**Carried-over risk:** the Phase 2 map-sizing bug (canvas container stuck at `height: 300`) was re-checked during this phase's verification and is **still present** despite the earlier fix attempt — see [plan-2.md](plan-2.md). This directly affects `OverlayControlBar`'s screen-space positioning and the corner-drag math, both of which depend on the map container's real rendered size. Deferred at the user's direction rather than re-debugged live; full interactive corner-dragging/control-bar-tracking verification (this file's own Task 3/manual-verification items) should be treated as **not yet meaningfully checked** until that's resolved.

This is the detailed task breakdown for [../PLANNING.md](../PLANNING.md) Phase 3 / [../PRODUCT_REQUIREMENTS.md](../PRODUCT_REQUIREMENTS.md) Phase 3 ("the most important differentiating feature in the MVP"). It assumes the reader has skimmed [../AGENTS.md](../../AGENTS.md), [plan-1.md](plan-1.md), [plan-2.md](plan-2.md), and the current `src/` tree they produced.

## Objective

By the end of this phase: the user can upload a JPG/PNG, place it on the map, drag each of its four corners independently to align it with real geography, adjust opacity, lock it once aligned, and delete it. Everything persists per-project and survives reload. No spatial-analysis calculations yet (Phase 7), no additional data-import formats (Phase 4).

## Scope

**In scope (frozen MVP, [../PRODUCT_REQUIREMENTS.md](../PRODUCT_REQUIREMENTS.md) §Image overlay):** upload JPG/PNG → add to map as an image source → four adjustable corner handles → opacity → visibility toggle → delete → save/reload with all four corners exactly restored.

**In scope but sequenced after the above (should-have, not a blocker — see "A real technical constraint" below):** blend mode (Normal/Multiply/Screen), lock toggle. Both were validated as worthwhile refinements in [../design/MAP_INTERACTIONS.md](../design/MAP_INTERACTIONS.md) and already have `blendMode`/`locked` fields on `ImageOverlay` ([../DATA_MODEL.md](../DATA_MODEL.md)), but neither is in [../ACCEPTANCE_CRITERIA.md](../ACCEPTANCE_CRITERIA.md)'s frozen exit criteria for this feature — lock is cheap and worth doing alongside the core build; blend mode has a real implementation cost (see below) and should not block the rest.

**Explicitly out of scope (do not build ahead of schedule):** advanced multi-control-point/rubber-sheeting georeferencing ([../GIS_ARCHITECTURE.md](../GIS_ARCHITECTURE.md) §Future — explicitly deferred), any spatial measurement of/against the overlay (Phase 7), GeoTIFF or any format beyond JPG/PNG (later formats per [../PRODUCT_REQUIREMENTS.md](../PRODUCT_REQUIREMENTS.md) §Supported Data Formats).

## A real technical constraint discovered while planning: blend mode has no native MapLibre paint property

MapLibre GL JS's raster layer paint properties are `raster-opacity`, `raster-hue-rotate`, `raster-brightness-min/max`, `raster-saturation`, `raster-contrast`, `raster-resampling`, `raster-fade-duration` — **there is no blend-mode paint property**, and CSS `mix-blend-mode` can't target one layer selectively because MapLibre renders every layer onto a single shared WebGL canvas, not separate DOM elements per layer.

**Resolution:** ship opacity (a native, trivial paint property) as the Track A/MVP control. Blend mode requires a `CustomLayerInterface` (a MapLibre escape hatch for hand-written WebGL rendering with explicit `gl.blendFunc` calls) to actually composite Multiply/Screen against the basemap — meaningfully more work than a paint-property toggle. Sequence it as its own task (Task 8, should-have) after the core four-corner/opacity/lock workflow is solid, not alongside it. This mirrors Phase 2's precedent of discovering a real API gap (Terra Draw's `stop()` semantics) during implementation and adjusting the plan rather than the docs' original assumption.

## Technical approach for the four corners: native MapLibre image source, not a hand-rolled quad-warp

The reason MapLibre was chosen at all ([ADR/0001-map-engine.md](../ADR/0001-map-engine.md)) is that its `image` source type natively accepts four independent geographic corners and does the arbitrary-quadrilateral perspective warp in WebGL — reimplementing that ourselves (e.g. via CSS `transform: matrix3d` on a plain `<img>`, which only does affine transforms, not true 4-point perspective) would be redundant and error-prone. `src/map/OverlayManager.ts` wraps `map.addSource(id, {type:"image", url, coordinates})` + `map.addLayer({type:"raster", source:id})`, mirroring how `MapEngine`/`DrawingManager` wrap their respective MapLibre/Terra Draw APIs.

**Corner dragging is not a Terra Draw concern** — Terra Draw models annotation geometry (points/lines/polygons), not "drag four independent handles that reshape an image quad." The four corner handles are four plain `maplibregl.Marker({draggable: true})` instances; each marker's `drag`/`dragend` event updates that corner's `[lng, lat]` and calls `map.getSource(id).setCoordinates(allFourCorners)` to reflow the image live during drag. This is a simpler, more directly-fitting primitive than adapting Terra Draw for a job it wasn't designed for.

**Rotation/scale are derived transforms, not stored fields** ([../GIS_ARCHITECTURE.md](../GIS_ARCHITECTURE.md): "to avoid two sources of truth"). The floating control bar's rotation ± / scale ± buttons recompute all four corners around the quad's centroid via pure functions in `src/gis/imageOverlayGeometry.ts` — never a separately-persisted angle/scale value.

## Task breakdown

### 1. Geometry helpers (`src/gis/`)
- `src/gis/imageOverlayGeometry.ts`: `type OverlayCorners = [GeoJsonPosition, GeoJsonPosition, GeoJsonPosition, GeoJsonPosition]` (clockwise from top-left, per [../DATA_MODEL.md](../DATA_MODEL.md)); `centroidOf(corners)`; `rotateCorners(corners, degrees)`; `scaleCorners(corners, factor)`; `validateOverlayCorners(corners)` (exactly 4 points, each finite/in-bounds, not degenerate/collinear — same untrusted-input-boundary pattern as `annotationGeometry.ts`).
- Unit tests: rotate-then-rotate-back returns to the original corners (within floating-point tolerance); scale by 1 is a no-op; degenerate/collinear corners rejected; out-of-bounds coordinates rejected.

### 2. Domain type + Track A data layer (`src/projects/overlays/`, `src/storage/`)
- `src/projects/overlays/types.ts` — `ImageOverlay` mirroring [../DATA_MODEL.md](../DATA_MODEL.md) exactly (id, projectId, imageUrl, coordinates, opacity, visible, rotation, blendMode, locked, name, sourceMetadata, createdAt, updatedAt).
- `src/storage/overlays.ts` — `createOverlay`/`updateOverlay`/`deleteOverlay`/`listOverlays(projectId)`, Track A body using `URL.createObjectURL(file)` for an ephemeral local preview (no real Storage yet) — same "body gets wholesale-replaced in Track B, signatures don't change" pattern as `storage/annotations.ts`.
- `src/projects/overlays/useOverlays.ts` — Track A local-state hook, mirroring `useAnnotations.ts`.
- Client-side upload validation even in Track A (good practice, not deferred): allowlisted MIME types (JPG/JPEG/PNG only for this phase — WEBP/PDF/GeoJSON/KML from [../SECURITY.md](../SECURITY.md)'s broader allowlist aren't relevant to an image overlay), a size cap, and a magic-byte sniff (check the file's actual header bytes, not just its `Content-Type`/extension) before ever calling `URL.createObjectURL` or (later) uploading.

### 3. OverlayManager (`src/map/`)
- `src/map/OverlayManager.ts` — wraps the native MapLibre image source/layer: `add(id, imageUrl, corners, opacity, visible)`, `updateCorners(id, corners)`, `updateOpacity(id, value)`, `setVisible(id, visible)`, `remove(id)`, `destroy()`. No Terra Draw involvement — see "Technical approach" above.
- `src/map/useOverlayManager.ts` — lifecycle hook, same shape as `useDrawingManager.ts`.
- Four draggable corner `Marker`s per selected overlay, built directly in `ProjectWorkspace.tsx` (or a small dedicated `src/components/map/OverlayCornerHandles.tsx` if the marker-management code gets unwieldy inline) — each `dragend` calls `validateOverlayCorners` then `OverlayManager.updateCorners` + persists via `updateOverlay`.
- Corner handles only render for the **currently selected** overlay, not all overlays at once — matches the "select an annotation to edit it" precedent from Phase 2, and avoids handle-click ambiguity when multiple overlays exist.

### 4. Upload UI (`src/components/overlays/`)
- `AddOverlayDialog.tsx` — file picker (JPG/PNG only, enforced via the `accept` attribute *and* the real validation from Task 2 — never trust `accept` alone, it's a UX hint, not a security boundary), shows a preview, on confirm calls `createOverlay` and places the new overlay at a sensible default quad (e.g. centered on the current map view, sized to roughly a fixed fraction of the viewport) so the user immediately has something to drag into place rather than starting from nothing.
- Wired to the Image Overlay tool button — this is the 6th entry the [../design/MAP_INTERACTIONS.md](../design/MAP_INTERACTIONS.md) tool set always listed alongside Pin/Line/Polygon/Circle/Note but that Phase 2's `ToolRail` didn't yet implement (upload has a file-picker step, unlike the click-to-draw tools) — add it as the rail's 6th button now.

### 5. Floating contextual control bar (`src/components/overlays/`)
- `OverlayControlBar.tsx` — opacity slider, lock toggle, delete — floating (not a side panel), repositioned on every `move`/`zoom` map event by projecting the overlay's centroid to screen space via `map.project()`, per the validated wireframe layout ([../design/wireframes/](../design/wireframes/) turn 3a) and [../design/MAP_INTERACTIONS.md](../design/MAP_INTERACTIONS.md) §Image overlay UX. Rotation ± / scale ± buttons call the Task 1 geometry helpers and push the result through `OverlayManager.updateCorners`. Numeric readouts (`−7.0° · 118%`) in the monospace font per [../PLANNING.md](../PLANNING.md) §Fonts & theme.
- Blend-mode selector is **not** in this bar yet — see Task 8.
- Delete requires confirmation, reusing the `Dialog`-based pattern from Phase 2's `DeleteAnnotationDialog`.

### 6. Firestore rules + Emulator tests for overlays (Track B)
- [ ] **Blocked on Firebase (same prerequisite as Phases 1–2).** Extend `firestore.rules` with an `overlays` subcollection under `projects/{projectId}`, same `parentOwnerId()` pattern Phase 2 established for `annotations` — owner-only via the parent project, coordinate/opacity bounds validated at the rules layer as a coarse backstop (authoritative validation stays app-side in `storage/overlays.ts`, via `validateOverlayCorners`).
- [ ] `tests/integration/overlays-rules.test.ts` — same IDOR-matrix shape as `annotations-rules.test.ts`.

### 7. Firebase Storage + real upload (Track B)
- [ ] **Blocked on Firebase Storage specifically** (Phases 1–2 only needed Firestore + Auth) — an additional user action beyond what [plan-1.md](plan-1.md)'s Track B already listed: enable Storage in the Firebase console.
- [ ] `storage.rules` (new file, doesn't exist yet) — deny-by-default, owner-only paths (e.g. `projects/{projectId}/overlays/{overlayId}/{fileName}`, checking the requester owns the parent project the same way Firestore rules do), `request.resource.contentType` allowlisted to `image/jpeg`/`image/png`, `request.resource.size` capped. This is the **real** enforcement boundary for file type/size — Task 2's client-side magic-byte check is a UX nicety (fail fast, better error message), never the trust boundary, per [../SECURITY.md](../SECURITY.md) "never trust client input."
- [ ] `firebase.json` updated to point at `storage.rules`; Storage emulator added to `npm run emulators`/`test:rules`.
- [ ] `src/lib/firebaseClient.ts` (if not already created by Phase 1/2's Track B) exports a Storage instance alongside Firestore/Auth.
- [ ] `src/storage/overlays.ts` body replaced: real `uploadBytes`/`getDownloadURL`/`deleteObject` against Storage, Firestore `ImageOverlay` doc CRUD alongside it.

### 8. Blend mode (should-have, sequenced after Tasks 1–7 work)
- [ ] A `CustomLayerInterface` MapLibre layer rendering the overlay's texture with an explicit WebGL blend function for Multiply/Screen, replacing the plain `raster` layer only when `blendMode !== "normal"`. This is real, separate rendering-pipeline work — don't start it until the native-raster-layer path (opacity, corners, lock, persistence) is fully working and manually verified.
- [ ] Blend-mode `Select` added to `OverlayControlBar` once the rendering side exists.

## Tech stack for this phase

No new npm dependency required — MapLibre's own `image`/`raster` source-and-layer types and `Marker` cover everything in Tasks 1–5; Firebase Storage (Track B) is already an implied part of the stack from [ADR/0002-storage.md](../ADR/0002-storage.md), just not yet turned on. Blend mode (Task 8) uses MapLibre's `CustomLayerInterface`, also no new dependency.

## UI / fonts / theme

No new theme decisions. Reuses existing tokens; monospace font for the rotation/scale numeric readouts, same as Phase 1/2's coordinate displays. Accent color for the lock toggle's active state, sparingly, per [../PLANNING.md](../PLANNING.md) §Fonts & theme.

## Flow path delivered

`import image/old map → align overlay (drag corners) → adjust opacity → lock` — the golden journey's signature step ([../design/USER_FLOWS.md](../design/USER_FLOWS.md)), continuing directly from Phase 2's drawing tools.

## Mobile vs. web

The floating control bar collapses into a bottom sheet on mobile (same `Sheet` primitive Phase 2 already added for `AnnotationPanel`). Corner-handle dragging needs to work via touch (MapLibre `Marker`'s drag handling is touch-capable by default, but verify — this is exactly the kind of thing Phase 2's interactive-verification pass caught a real bug in, so don't assume). Precision alignment is explicitly a desktop-primary task per [../design/UX_SPECIFICATION.md](../design/UX_SPECIFICATION.md) §Mobile strategy — don't over-invest in mobile-optimized alignment before the desktop path is proven end-to-end.

## Component library map

Following Phases 1–2's precedent (default shadcn registry, not ReUI's paywalled hosted one):

| UI element | Source |
|---|---|
| Opacity slider, scale readout | shadcn `Slider` (not yet added — `npx shadcn@latest add slider`) |
| Lock toggle, visibility toggle | shadcn `Toggle` (not yet added — `npx shadcn@latest add toggle`) |
| Blend-mode selector (Task 8 only) | shadcn `Select` (not yet added, deferred to Task 8) |
| Floating control-bar shell | custom (screen-space positioned via `map.project()`, not a `Popover` — an anchored popover isn't the right primitive for something that must track a moving map, per the wireframe's literal floating-bar layout) |
| Upload dialog | shadcn `Dialog` (already added) |
| Delete confirmation | shadcn `Dialog` (already added) |

## Security checklist for this phase (see ../SECURITY_TEST_PLAN.md)

- [ ] Client-side MIME/magic-byte/size validation before any file is accepted, even in Track A (UX-only boundary, not the trust boundary).
- [ ] **(Track B)** `storage.rules` allowlists `image/jpeg`/`image/png` content-type and caps file size — the actual enforcement point.
- [ ] **(Track B)** Owner-only Storage paths, mirroring Firestore's `parentOwnerId()` pattern.
- [ ] **(Track B)** Unauthenticated Firestore read on any `overlays` subcollection → denied; cross-user IDOR matrix → denied.
- [ ] No `allow read, write: if true` anywhere in the updated `firestore.rules`/`storage.rules`.
- [ ] Corner coordinates validated (finite, in-bounds, non-degenerate) before being written — never trust raw drag-event output, same principle Phase 2 applied to Terra Draw's output.

## Exit criteria

[../ACCEPTANCE_CRITERIA.md](../ACCEPTANCE_CRITERIA.md) §Image overlay, in full: upload → place → adjust all four corners → change opacity → save → the overlay remains geographically aligned (all four corners exactly restored) after a full reload; opacity and visibility persist exactly; image metadata persists; deleting removes it from the project's data, not just the current view.

## Open questions / blockers

- **Firebase project + Storage specifically** — Track B needs Storage enabled in the console in addition to whatever Phase 1/2 already required for Firestore/Auth.
- **Blend mode's real implementation cost** (custom WebGL layer) — flagged above; explicitly sequenced last (Task 8) rather than blocking the frozen MVP scope.
- **Touch/mobile corner-dragging** — unverified; Phase 2's experience suggests assuming desktop-only correctness without checking mobile is exactly how a real bug (the map-sizing issue) went unnoticed for two phases. Budget real verification time here, not just a code-review assumption.
- Default placement quad for a freshly-uploaded image (Task 4) — not fully specified; a reasonable default (centered, some fraction of the current viewport) needs to be picked during implementation, not over-designed now.

## Next

[plan-4.md](plan-4.md) (Phase 4 — Data import/export) — not yet written; write it once this phase is underway, not speculatively now.
