import { Map as MapLibreMap, NavigationControl, ScaleControl } from "maplibre-gl";
import { osmStyle } from "./osmStyle";
import type { LngLat } from "@/gis/coordinates";

export const DEFAULT_CENTER: LngLat = { lng: 78.9629, lat: 20.5937 }; // center of India
export const DEFAULT_ZOOM = 4;

export interface MapEngineOptions {
  container: HTMLElement;
  center?: LngLat;
  zoom?: number;
  bearing?: number;
  pitch?: number;
}

/**
 * Thin wrapper around a vanilla maplibre-gl Map instance — see
 * docs/ADR/0001-map-engine.md and docs/PLANNING.md Phase 1 (vanilla over
 * react-map-gl, chosen for Phase 3's imperative corner-handle needs).
 * Keeps MapLibre's imperative API out of React components directly.
 */
export class MapEngine {
  private map: MapLibreMap;

  constructor(options: MapEngineOptions) {
    const { container, center = DEFAULT_CENTER, zoom = DEFAULT_ZOOM, bearing = 0, pitch = 0 } = options;

    this.map = new MapLibreMap({
      container,
      style: osmStyle,
      center: [center.lng, center.lat],
      zoom,
      bearing,
      pitch,
      attributionControl: { compact: true },
    });

    this.map.addControl(new NavigationControl({ visualizePitch: true }), "top-right");
    this.map.addControl(new ScaleControl({ unit: "metric" }), "bottom-left");
  }

  getMap(): MapLibreMap {
    return this.map;
  }

  flyTo(center: LngLat, zoom?: number): void {
    this.map.flyTo({ center: [center.lng, center.lat], zoom });
  }

  onMoveEnd(callback: () => void): () => void {
    this.map.on("moveend", callback);
    return () => this.map.off("moveend", callback);
  }

  destroy(): void {
    this.map.remove();
  }
}
