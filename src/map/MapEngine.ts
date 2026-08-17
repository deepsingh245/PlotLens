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

export interface MapViewState {
  center: LngLat;
  zoom: number;
  bearing: number;
  pitch: number;
}

/**
 * Thin wrapper around a vanilla maplibre-gl Map instance — see
 * docs/ADR/0001-map-engine.md and docs/PLANNING.md Phase 1 (vanilla over
 * react-map-gl, chosen for Phase 3's imperative corner-handle needs).
 * Keeps MapLibre's imperative API out of React components directly.
 */
export class MapEngine {
  private map: MapLibreMap;
  private resizeObserver: ResizeObserver;

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

    // MapLibre measures the container's size once at construction time, which can race
    // ahead of the flex layout settling (a well-known React+MapLibre pitfall) — the canvas
    // silently ends up stuck at a stale/fallback size. A ResizeObserver keeps it correct
    // on the initial layout pass and on any later container resize (panel open/close, etc).
    this.resizeObserver = new ResizeObserver(() => this.map.resize());
    this.resizeObserver.observe(container);

    // Belt-and-suspenders: force one more resize once the browser has definitely committed
    // a layout pass, in case the very first ResizeObserver callback still raced construction.
    requestAnimationFrame(() => this.map.resize());
  }

  getMap(): MapLibreMap {
    return this.map;
  }

  flyTo(center: LngLat, options?: { zoom?: number; bearing?: number; pitch?: number }): void {
    this.map.flyTo({ center: [center.lng, center.lat], ...options });
  }

  /** Snapshot of the current view — see docs/DATA_MODEL.md SavedView.map. */
  getViewState(): MapViewState {
    const center = this.map.getCenter();
    return {
      center: { lng: center.lng, lat: center.lat },
      zoom: this.map.getZoom(),
      bearing: this.map.getBearing(),
      pitch: this.map.getPitch(),
    };
  }

  onMoveEnd(callback: () => void): () => void {
    this.map.on("moveend", callback);
    return () => this.map.off("moveend", callback);
  }

  destroy(): void {
    this.resizeObserver.disconnect();
    this.map.remove();
  }
}
