import type { Map as MapLibreMap } from "maplibre-gl";
import { toGeoJsonPosition } from "./coordinates";
import type { ProjectMapState } from "@/projects/maps/types";

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Wraps a bearing in degrees to the [0, 360) range. */
export function normalizeBearing(bearing: number): number {
  return ((bearing % 360) + 360) % 360;
}

export const MIN_ZOOM = 0;
export const MAX_ZOOM = 22;
export const MIN_PITCH = 0;
export const MAX_PITCH = 60;

/**
 * Reads the live state off a MapLibre map instance and converts it into the
 * shape stored on Project.map (docs/DATA_MODEL.md). This is the only place
 * that should read map.getCenter()/getZoom()/etc. for persistence purposes —
 * see docs/ARCHITECTURE.md rule 2 (GIS logic stays out of components).
 */
export function toProjectMapState(map: MapLibreMap): ProjectMapState {
  return {
    center: toGeoJsonPosition(map.getCenter()),
    zoom: clamp(map.getZoom(), MIN_ZOOM, MAX_ZOOM),
    bearing: normalizeBearing(map.getBearing()),
    pitch: clamp(map.getPitch(), MIN_PITCH, MAX_PITCH),
  };
}
