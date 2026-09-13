import type { StyleSpecification } from "maplibre-gl";

/**
 * Dev-scale OSM raster base map — the no-configuration FALLBACK only. The public
 * tile.openstreetmap.org endpoint is rate-limited (returns 503 under active use)
 * and is NOT approved for production/heavy use — see docs/DATA_SOURCES.md's
 * OpenStreetMap entry. For a stable base map, configure a real provider via
 * NEXT_PUBLIC_MAP_STYLE_URL (see resolveMapStyle below and docs/DATA_SOURCES.md).
 */
export const OSM_ATTRIBUTION = "© OpenStreetMap contributors";

export const osmStyle: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      // tile.openstreetmap.org's standard raster tiles stop at z19 — without this,
      // MapLibre keeps requesting tiles past that (e.g. z22), which the server
      // rejects with a 400 that has no CORS header, surfacing in devtools as a
      // misleading "CORS policy" error rather than the real "zoomed in too far"
      // cause. Capping here makes MapLibre oversample the z19 tile instead.
      maxzoom: 19,
      attribution: OSM_ATTRIBUTION,
    },
  },
  layers: [
    {
      id: "osm",
      type: "raster",
      source: "osm",
    },
  ],
};

/**
 * Resolves the base-map style MapEngine should use.
 *
 * - If `NEXT_PUBLIC_MAP_STYLE_URL` is set, it is treated as a full MapLibre GL
 *   style JSON URL (e.g. a MapTiler/Stadia style; the provider's API key is
 *   embedded in that URL as the provider documents). MapLibre fetches it and
 *   pulls glyphs/sprites/tiles + attribution from it. This is the path for a
 *   reliable, non-rate-limited base map — the provider MUST have a verified
 *   entry in docs/DATA_SOURCES.md (license, attribution, allowed use) first.
 * - Otherwise falls back to the OSM raster above (dev only, rate-limited).
 *
 * The style URL is browser-exposed by nature (NEXT_PUBLIC_*), so the key in it
 * must be domain-restricted at the provider — see docs/SECURITY.md §API Key Security.
 */
export function resolveMapStyle(): StyleSpecification | string {
  const styleUrl = process.env.NEXT_PUBLIC_MAP_STYLE_URL?.trim();
  return styleUrl ? styleUrl : osmStyle;
}
