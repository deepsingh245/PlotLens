import type { GeoJsonPosition } from "./coordinates";
import type { AnnotationGeometry, LineString, Point, Polygon } from "./geojson";

/**
 * The untrusted-input boundary for everything Terra Draw produces — see
 * docs/GIS_ARCHITECTURE.md and docs/SECURITY.md §GeoJSON Security. Terra
 * Draw's raw output is `unknown` here, never assumed pre-sanitized.
 */
export type DrawTool = "point" | "line" | "polygon" | "circle";

export const COORD_BOUNDS = { minLng: -180, maxLng: 180, minLat: -90, maxLat: 90 };
export const MIN_LINE_VERTICES = 2;
export const MAX_LINE_VERTICES = 500;
export const MIN_POLYGON_RING_VERTICES = 4; // triangle + closing vertex
export const MAX_POLYGON_RING_VERTICES = 500;
export const MIN_CIRCLE_RING_VERTICES = 8;
export const MAX_CIRCLE_RING_VERTICES = 128;

const GEOMETRY_TYPE_FOR_TOOL: Record<DrawTool, AnnotationGeometry["type"]> = {
  point: "Point",
  line: "LineString",
  polygon: "Polygon",
  circle: "Polygon",
};

export interface GeometryValidationResult {
  valid: boolean;
  /** Dev-facing only — never rendered raw to the end user. */
  reason?: string;
}

function isFiniteCoordinate(position: unknown): position is GeoJsonPosition {
  if (!Array.isArray(position) || position.length !== 2) return false;
  const [lng, lat] = position;
  return (
    typeof lng === "number" &&
    typeof lat === "number" &&
    Number.isFinite(lng) &&
    Number.isFinite(lat) &&
    lng >= COORD_BOUNDS.minLng &&
    lng <= COORD_BOUNDS.maxLng &&
    lat >= COORD_BOUNDS.minLat &&
    lat <= COORD_BOUNDS.maxLat
  );
}

function extractGeometry(rawFeature: unknown): { type?: unknown; coordinates?: unknown } | null {
  if (typeof rawFeature !== "object" || rawFeature === null) return null;
  const geometry = (rawFeature as { geometry?: unknown }).geometry;
  if (typeof geometry !== "object" || geometry === null) return null;
  return geometry as { type?: unknown; coordinates?: unknown };
}

function ringsClosedAndSized(
  coordinates: unknown,
  minVertices: number,
  maxVertices: number,
): boolean {
  if (!Array.isArray(coordinates) || coordinates.length !== 1) return false; // single ring only — no holes in MVP
  const ring = coordinates[0];
  if (!Array.isArray(ring)) return false;
  if (ring.length < minVertices || ring.length > maxVertices) return false;
  if (!ring.every(isFiniteCoordinate)) return false;
  const [first] = ring;
  const last = ring[ring.length - 1];
  return first[0] === last[0] && first[1] === last[1];
}

export function validateDrawnFeature(tool: DrawTool, rawFeature: unknown): GeometryValidationResult {
  const geometry = extractGeometry(rawFeature);
  if (!geometry) return { valid: false, reason: "missing geometry" };

  const expectedType = GEOMETRY_TYPE_FOR_TOOL[tool];
  if (geometry.type !== expectedType) {
    return { valid: false, reason: `expected geometry.type "${expectedType}", got "${String(geometry.type)}"` };
  }

  if (tool === "point") {
    if (!isFiniteCoordinate(geometry.coordinates)) {
      return { valid: false, reason: "point coordinate out of bounds or non-finite" };
    }
    return { valid: true };
  }

  if (tool === "line") {
    const coords = geometry.coordinates;
    if (!Array.isArray(coords) || coords.length < MIN_LINE_VERTICES || coords.length > MAX_LINE_VERTICES) {
      return { valid: false, reason: "line vertex count out of bounds" };
    }
    if (!coords.every(isFiniteCoordinate)) {
      return { valid: false, reason: "line contains an out-of-bounds or non-finite coordinate" };
    }
    return { valid: true };
  }

  // polygon or circle — both stored as Polygon geometry.
  const [minVertices, maxVertices] =
    tool === "circle"
      ? [MIN_CIRCLE_RING_VERTICES, MAX_CIRCLE_RING_VERTICES]
      : [MIN_POLYGON_RING_VERTICES, MAX_POLYGON_RING_VERTICES];

  if (!ringsClosedAndSized(geometry.coordinates, minVertices, maxVertices)) {
    return { valid: false, reason: "polygon ring is unclosed, has holes, or has an invalid vertex count" };
  }

  return { valid: true };
}

/** Only call after validateDrawnFeature returns valid:true. */
export function toAnnotationGeometry(tool: DrawTool, rawFeature: unknown): AnnotationGeometry {
  const geometry = extractGeometry(rawFeature);
  if (!geometry) {
    throw new Error("toAnnotationGeometry called on a feature with no geometry — validate first");
  }

  if (tool === "point") {
    return { type: "Point", coordinates: geometry.coordinates as GeoJsonPosition } satisfies Point;
  }
  if (tool === "line") {
    return { type: "LineString", coordinates: geometry.coordinates as GeoJsonPosition[] } satisfies LineString;
  }
  return { type: "Polygon", coordinates: geometry.coordinates as GeoJsonPosition[][] } satisfies Polygon;
}

/** circle -> "circle" tag even though geometry.type stays "Polygon" — see docs/DATA_MODEL.md. */
export function annotationTypeForTool(tool: DrawTool): DrawTool {
  return tool;
}

/**
 * Display-only representative point for the annotation panel's location
 * readout — a planar mean, not a precise area-weighted centroid (that's
 * Turf's job in Phase 7, not installed here).
 */
export function locationSummary(geometry: AnnotationGeometry): GeoJsonPosition {
  if (geometry.type === "Point") return geometry.coordinates;
  if (geometry.type === "LineString") return geometry.coordinates[0];

  const ring = geometry.coordinates[0];
  const verticesExcludingClosingPoint = ring.slice(0, -1);
  const sum = verticesExcludingClosingPoint.reduce<[number, number]>(
    ([sumLng, sumLat], [lng, lat]) => [sumLng + lng, sumLat + lat],
    [0, 0],
  );
  const count = verticesExcludingClosingPoint.length;
  return [sum[0] / count, sum[1] / count];
}
