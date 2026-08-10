import type { GeoJsonPosition } from "./coordinates";

/**
 * PlotLens's own minimal structural GeoJSON geometry types, built on
 * GeoJsonPosition (coordinates.ts) rather than the ambient @types/geojson
 * package — same "own the tiny type" precedent coordinates.ts already set.
 * Only the geometry types Phase 2 actually produces (point/line/polygon —
 * circles store as Polygon, see docs/DATA_MODEL.md).
 */
export interface Point {
  type: "Point";
  coordinates: GeoJsonPosition;
}

export interface LineString {
  type: "LineString";
  coordinates: GeoJsonPosition[];
}

export interface Polygon {
  type: "Polygon";
  coordinates: GeoJsonPosition[][];
}

export type AnnotationGeometry = Point | LineString | Polygon;
