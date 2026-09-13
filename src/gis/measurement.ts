import turfArea from "@turf/area";
import turfLength from "@turf/length";
import type { LineString, Polygon } from "./geojson";

/**
 * Turf.js measurement wrappers — see docs/GIS_ARCHITECTURE.md §Measurement.
 * Return raw base units only; unit selection for display (m vs km, m² vs
 * hectares) happens in the formatters below, never by storing multiple unit
 * variants of the same measurement.
 */

const SQUARE_METERS_PER_HECTARE = 10_000;

export interface DistanceResult {
  meters: number;
  kilometers: number;
}

export interface AreaResult {
  squareMeters: number;
  hectares: number;
}

/** Path length along the line, not straight-line point-to-point distance. */
export function measureDistance(geometry: LineString): DistanceResult {
  const feature = { type: "Feature" as const, geometry, properties: {} };
  const kilometers = turfLength(feature, { units: "kilometers" });
  return { meters: kilometers * 1000, kilometers };
}

/** Geodesic area — accounts for Earth's curvature, not a flat/planar shoelace calculation. */
export function measureArea(geometry: Polygon): AreaResult {
  const feature = { type: "Feature" as const, geometry, properties: {} };
  return squareMetersToAreaResult(turfArea(feature));
}

/** Shared by measureArea and spatialAnalysis.ts's polygon-overlap area — same unit split, one constant. */
export function squareMetersToAreaResult(squareMeters: number): AreaResult {
  return { squareMeters, hectares: squareMeters / SQUARE_METERS_PER_HECTARE };
}

export function formatDistance(result: DistanceResult): string {
  if (result.kilometers >= 1) {
    return `${result.kilometers.toLocaleString(undefined, { maximumFractionDigits: 2 })} km`;
  }
  return `${Math.round(result.meters).toLocaleString()} m`;
}

export function formatArea(result: AreaResult): string {
  const squareMeters = Math.round(result.squareMeters).toLocaleString();
  const hectares = result.hectares.toLocaleString(undefined, { maximumFractionDigits: 2 });
  return `${squareMeters} m² / ${hectares} ha`;
}
