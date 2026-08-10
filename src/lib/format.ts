import type { GeoJsonPosition } from "@/gis/coordinates";

/** Formats a [lng, lat] position for display, e.g. "12.9716°N, 77.5946°E". */
export function formatCoordinate([lng, lat]: GeoJsonPosition): string {
  const latHemisphere = lat >= 0 ? "N" : "S";
  const lngHemisphere = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(4)}°${latHemisphere}, ${Math.abs(lng).toFixed(4)}°${lngHemisphere}`;
}
