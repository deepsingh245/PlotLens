import type { GeoJsonPosition } from "./coordinates";

/**
 * Four corners, geographic, clockwise from top-left — see docs/DATA_MODEL.md's
 * ImageOverlay.coordinates. The untrusted-input boundary for anything a corner
 * drag/upload produces, mirroring src/gis/annotationGeometry.ts's role — kept
 * independent (no cross-import) rather than sharing helpers with that module.
 */
export type OverlayCorners = [GeoJsonPosition, GeoJsonPosition, GeoJsonPosition, GeoJsonPosition];

export interface GeometryValidationResult {
  valid: boolean;
  /** Dev-facing only — never rendered raw to the end user. */
  reason?: string;
}

const COORD_BOUNDS = { minLng: -180, maxLng: 180, minLat: -90, maxLat: 90 };

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

/** Planar mean of the 4 corners — display/rotation-pivot approximation, not an area-weighted centroid. */
export function centroidOf(corners: OverlayCorners): GeoJsonPosition {
  const sum = corners.reduce<[number, number]>(([sumLng, sumLat], [lng, lat]) => [sumLng + lng, sumLat + lat], [0, 0]);
  return [sum[0] / corners.length, sum[1] / corners.length];
}

/**
 * Rotates all 4 corners by `degrees` around their centroid. Planar rotation on
 * the raw [lng, lat] plane — a simplification the rest of the app already makes
 * for a small quad, not a geodesic transform. Rotation itself is never persisted
 * (see docs/GIS_ARCHITECTURE.md) — only the resulting corners are.
 */
export function rotateCorners(corners: OverlayCorners, degrees: number): OverlayCorners {
  const [cLng, cLat] = centroidOf(corners);
  const radians = (degrees * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  return corners.map(([lng, lat]) => {
    const dx = lng - cLng;
    const dy = lat - cLat;
    return [cLng + dx * cos - dy * sin, cLat + dx * sin + dy * cos];
  }) as OverlayCorners;
}

/** Scales all 4 corners by `factor` around their centroid. factor === 1 is an exact no-op. */
export function scaleCorners(corners: OverlayCorners, factor: number): OverlayCorners {
  if (factor === 1) return corners;
  const [cLng, cLat] = centroidOf(corners);
  return corners.map(([lng, lat]) => [cLng + (lng - cLng) * factor, cLat + (lat - cLat) * factor]) as OverlayCorners;
}

/** Twice the signed area of the quad via the shoelace formula — used to reject degenerate/collinear corners. */
function shoelaceArea(corners: OverlayCorners): number {
  let sum = 0;
  for (let i = 0; i < corners.length; i++) {
    const [x1, y1] = corners[i];
    const [x2, y2] = corners[(i + 1) % corners.length];
    sum += x1 * y2 - x2 * y1;
  }
  return sum;
}

const MIN_QUAD_AREA = 1e-12; // degenerate/collinear guard, not a real-world size limit

export function validateOverlayCorners(corners: unknown): GeometryValidationResult {
  if (!Array.isArray(corners) || corners.length !== 4) {
    return { valid: false, reason: "expected exactly 4 corners" };
  }
  if (!corners.every(isFiniteCoordinate)) {
    return { valid: false, reason: "a corner is missing, non-finite, or out of bounds" };
  }

  const area = Math.abs(shoelaceArea(corners as OverlayCorners));
  if (area < MIN_QUAD_AREA) {
    return { valid: false, reason: "corners are degenerate or collinear" };
  }

  return { valid: true };
}
