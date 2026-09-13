import turfArea from "@turf/area";
import turfBooleanPointInPolygon from "@turf/boolean-point-in-polygon";
import turfDistance from "@turf/distance";
import turfIntersect from "@turf/intersect";
import turfPointToLineDistance from "@turf/point-to-line-distance";
import type { GeoJsonPosition } from "./coordinates";
import type { AnnotationGeometry, LineString, Polygon } from "./geojson";
import { squareMetersToAreaResult, type AreaResult, type DistanceResult } from "./measurement";

/**
 * Nearest-feature and polygon-overlap analysis over the project's own
 * annotations — see docs/GIS_ARCHITECTURE.md §Measurement and
 * docs/plans/plan-7.md's scope note. Every result is a real Turf calculation
 * against the actual geometry involved (point-to-line / point-to-polygon /
 * polygon-polygon intersection), never a representative-point-to-point
 * shortcut on both ends.
 *
 * Buffer/radius is intentionally not here — docs/design/MAP_INTERACTIONS.md
 * lists it under "Future — do not build before the MVP workflow is stable."
 * Road-impact-style analysis against external layers (e.g. "nearest road")
 * is also not here — there's no such dataset until Phase 6 (Bhuvan) unblocks.
 */

function ringAsLineString(polygon: Polygon): LineString {
  return { type: "LineString", coordinates: polygon.coordinates[0] };
}

/**
 * Real distance from a point to the nearest point of any annotation geometry
 * — 0 if the point falls inside a polygon. LineString/Polygon-boundary cases
 * use Turf's actual point-to-line distance, not a vertex- or centroid-based
 * shortcut.
 */
export function distanceFromPointToGeometry(from: GeoJsonPosition, geometry: AnnotationGeometry): DistanceResult {
  let kilometers: number;
  if (geometry.type === "Point") {
    kilometers = turfDistance(from, geometry.coordinates, { units: "kilometers" });
  } else if (geometry.type === "LineString") {
    kilometers = turfPointToLineDistance(from, geometry, { units: "kilometers" });
  } else if (turfBooleanPointInPolygon(from, geometry)) {
    kilometers = 0;
  } else {
    kilometers = turfPointToLineDistance(from, ringAsLineString(geometry), { units: "kilometers" });
  }
  return { kilometers, meters: kilometers * 1000 };
}

export interface NearestAnnotationResult<T> {
  annotation: T;
  distance: DistanceResult;
}

/**
 * Nearest-feature analysis, scoped to a Point origin — matches the product
 * question this answers ("how far is this pin from the nearest other
 * feature?"). A Line/Polygon origin would need a genuine geometry-to-geometry
 * closest-point search, a different, unbuilt feature — see plan-7.md.
 */
export function findNearestAnnotation<T extends { geometry: AnnotationGeometry }>(
  from: GeoJsonPosition,
  candidates: T[],
): NearestAnnotationResult<T> | null {
  let best: NearestAnnotationResult<T> | null = null;
  for (const candidate of candidates) {
    const distance = distanceFromPointToGeometry(from, candidate.geometry);
    if (!best || distance.kilometers < best.distance.kilometers) {
      best = { annotation: candidate, distance };
    }
  }
  return best;
}

export interface PolygonOverlapResult<T> {
  annotation: T;
  overlapArea: AreaResult;
}

/**
 * Real polygon-polygon intersection area (via Turf's set-theoretic
 * intersect), never a boolean-only "do they touch" — matches
 * docs/GIS_ARCHITECTURE.md's "never an approximated/eyeballed count" rule.
 * Non-Polygon candidates (Point/LineString) are skipped, not coerced.
 */
export function findPolygonOverlaps<T extends { geometry: AnnotationGeometry }>(
  target: Polygon,
  candidates: T[],
): PolygonOverlapResult<T>[] {
  const targetFeature = { type: "Feature" as const, geometry: target, properties: {} };
  const results: PolygonOverlapResult<T>[] = [];

  for (const candidate of candidates) {
    if (candidate.geometry.type !== "Polygon") continue;
    const candidateFeature = { type: "Feature" as const, geometry: candidate.geometry, properties: {} };
    const intersection = turfIntersect({
      type: "FeatureCollection",
      features: [targetFeature, candidateFeature],
    });
    if (!intersection) continue;
    results.push({ annotation: candidate, overlapArea: squareMetersToAreaResult(turfArea(intersection)) });
  }

  return results;
}
