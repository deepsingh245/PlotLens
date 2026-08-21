import type { StyleSpecification } from "maplibre-gl";

/**
 * Dev-scale OSM raster base map. See docs/DATA_SOURCES.md's OpenStreetMap
 * entry (status: experimental) — this is NOT approved for production/heavy
 * use of the public tile.openstreetmap.org endpoint. Override via
 * NEXT_PUBLIC_MAP_STYLE_URL before scaling beyond personal use.
 */
const OSM_TILE_URL =
  process.env.NEXT_PUBLIC_MAP_STYLE_URL || "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

export const OSM_ATTRIBUTION = "© OpenStreetMap contributors";

export const osmStyle: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: [OSM_TILE_URL],
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
