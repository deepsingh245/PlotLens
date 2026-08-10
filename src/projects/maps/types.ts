import type { GeoJsonPosition } from "@/gis/coordinates";

/**
 * Mirrors Project.map in docs/DATA_MODEL.md.
 * center is always [lng, lat] — see docs/GIS_ARCHITECTURE.md.
 */
export interface ProjectMapState {
  center: GeoJsonPosition;
  zoom: number;
  bearing: number;
  pitch: number;
}
