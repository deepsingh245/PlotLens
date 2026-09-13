import type { GeoJsonPosition } from "@/gis/coordinates";

/** Formats a [lng, lat] position for display, e.g. "12.9716°N, 77.5946°E". */
export function formatCoordinate([lng, lat]: GeoJsonPosition): string {
  const latHemisphere = lat >= 0 ? "N" : "S";
  const lngHemisphere = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(4)}°${latHemisphere}, ${Math.abs(lng).toFixed(4)}°${lngHemisphere}`;
}

/**
 * Formats an ISO timestamp as a short relative age ("just now", "3h ago",
 * "2d ago"), falling back to an absolute date past a week. Used for the
 * "last edited" metadata on project cards.
 */
export function formatRelativeDate(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffMs = Date.now() - then;
  const min = Math.round(diffMs / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hours = Math.round(min / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}
