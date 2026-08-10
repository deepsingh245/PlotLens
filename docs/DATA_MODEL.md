# Data Model

Firestore-oriented conceptual schema. Exact field types/validation will firm up during Phase 1–3 implementation — this is the frozen shape, not frozen syntax. All geometry fields use the coordinate convention in [GIS_ARCHITECTURE.md](GIS_ARCHITECTURE.md) (WGS84, `[lng, lat]`).

Ownership: every entity below belongs to exactly one project, and every project belongs to exactly one owner. See enforcement rules in [SECURITY.md](SECURITY.md) §Authorization.

## Project

```text
Project
{
  id,
  ownerId,
  name,
  description,

  map: {
    center: [lng, lat],
    zoom,
    bearing,
    pitch
  },

  layers: [Layer.id],
  overlays: [ImageOverlay.id],
  annotations: [Annotation.id],
  savedViews: [SavedView.id],

  createdAt,
  updatedAt,
  archivedAt | null
}
```

## Annotation (marker / line / polygon / circle / text)

```text
Annotation
{
  id,
  projectId,
  type: "point" | "line" | "polygon" | "circle" | "text",
  geometry,              // GeoJSON geometry, [lng, lat] order
  title,
  description,
  tags: [string],
  attachments: [Attachment.id],
  createdAt,
  updatedAt
}
```

## ImageOverlay

```text
ImageOverlay
{
  id,
  projectId,
  imageUrl,               // Firebase Storage path, private by default

  coordinates: [          // four corners, geographic, clockwise from top-left
    [lng, lat],            // 1: top-left
    [lng, lat],            // 2: top-right
    [lng, lat],            // 3: bottom-right
    [lng, lat]             // 4: bottom-left
  ],

  opacity,                 // 0.0–1.0
  visible: boolean,
  rotation | null,
  blendMode: "normal" | "multiply" | "screen",  // default "normal" — see GIS_ARCHITECTURE.md / design/MAP_INTERACTIONS.md
  locked: boolean,          // default false — prevents drag/corner-handle interaction once alignment is finished
  name,
  sourceMetadata: {        // where this image/map came from — see LICENSES_AND_ATTRIBUTION.md
    description,
    approximateDate | null
  },
  createdAt,
  updatedAt
}
```

## Layer (provider-backed or user data)

```text
Layer
{
  id,
  projectId,
  providerId,              // references Provider.id — see PROVIDER_ARCHITECTURE.md
  datasetId,
  name,
  type: "raster" | "vector" | "wms" | "wmts" | "geojson",
  visible: boolean,
  opacity,
  order,                    // z-index within the project
  sourceMetadata: {         // required for every external layer — see DATA_SOURCES.md
    provider,
    dataset,
    sourceUrl,
    retrievedAt,
    attribution,
    license
  }
}
```

## Attachment

```text
Attachment
{
  id,
  projectId,
  ownerEntityId,            // Annotation.id or Project.id it's attached to
  storagePath,
  originalFilename,
  mimeType,
  sizeBytes,
  uploadedAt
}
```

## SavedView

```text
SavedView
{
  id,
  projectId,
  name,
  map: { center, zoom, bearing, pitch },
  activeLayers: [{ layerId, visible, opacity }],
  selectedFeatureId | null,
  createdAt
}
```

## InvestigationEvent (Phase 8 — investigation timeline)

```text
InvestigationEvent
{
  id,
  projectId,
  timestamp,
  type: string,             // e.g. "property_discovered", "overlay_added", "measurement_taken", "note_added"
  summary,                  // short human-readable description
  relatedEntityId | null
}
```

Simple event logging, not a full audit system — see [PROJECT_SPEC.md](PROJECT_SPEC.md) §25.

## Provider / Dataset (registry — see PROVIDER_ARCHITECTURE.md, DATA_SOURCES.md)

```text
Provider { id, name, type, baseUrl, status: "verified"|"experimental"|"deprecated"|"blocked"|"unknown" }
Dataset  { id, providerId, name, crs, license, attribution, lastVerified }
```

An `unknown`-status provider must never be used in a running project — see [DATA_SOURCES.md](DATA_SOURCES.md).

## Validation rules (apply regardless of Security Rules — see SECURITY.md §36)

- `geometry`: must be valid GeoJSON, coordinate count/nesting bounded (see [SECURITY.md](SECURITY.md) §GeoJSON Security).
- `opacity`: clamp to `[0, 1]`.
- `zoom`: clamp to MapLibre's valid range.
- Every write must re-check that `projectId` belongs to the requesting user — never trust a client-supplied `ownerId`.
