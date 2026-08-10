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
