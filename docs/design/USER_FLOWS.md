# User Flows

## Golden user journey

The primary workflow every major design/implementation decision should make faster and clearer:

```text
Create project → Choose location → Open map → Enable/add layers →
Import image / old map → Align overlay → Drop pins / draw areas →
Add notes → Measure distance/area → Compare sources →
Save investigation → Export/share
```

This is the same journey exercised by the user-testing task in [UX_SPECIFICATION.md](UX_SPECIFICATION.md) and it should map directly onto the MVP feature list in [../PRODUCT_REQUIREMENTS.md](../PRODUCT_REQUIREMENTS.md).

## MVP UX success definition

The MVP is successful if a user can, without a tutorial: create a project → find a location → navigate the map → enable layers → upload an old image → align it → drop a pin → draw a property area → measure it → add a note → save → reopen → export.

## Prototype-before-coding check

Before writing implementation code for a given phase, walk through its slice of the golden journey as a prototype/sketch (even a rough one). If the journey feels awkward at that stage, fix the flow before writing code — don't implement around an awkward flow and hope polish fixes it later.

## Recommended build order (maps onto the phased roadmap in PRODUCT_REQUIREMENTS.md)

```text
1. Shell        — app shell, navigation, project list, project creation
2. Map          — MapLibre, base map, search, zoom, compass, scale
3. Layers       — layer list, visibility, opacity, ordering, source metadata
4. Drawing      — pin, line, polygon, selection, delete, undo/redo
5. Measurements — distance, area, units, persistence
6. Overlays     — upload, display, opacity, move, corner alignment, lock, persistence
7. Notes        — annotation, photos, metadata, source references
8. External data— government layers, provider adapters, source metadata, attribution
9. Export       — PNG, PDF, GeoJSON, KML/KMZ, project backup
10. Mobile      — responsive map, bottom sheets, mobile tools, photo capture/upload
```

This is a UX/build-order lens on the same phases described architecturally in [../PRODUCT_REQUIREMENTS.md](../PRODUCT_REQUIREMENTS.md) — keep the two in sync; if one changes, check the other.

## Design order principle

Design and build in this order:

```text
User → Workflow → Map → Layers → Tools → Data → Details → Export → Visual polish
```

Not: colors → cards → sidebar → dashboard → "where do we put the map?" The investigation workflow defines the product; visual polish comes last, not first.
