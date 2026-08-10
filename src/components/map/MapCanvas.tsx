"use client";

import { useEffect } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import "@/map/map-controls.css";
import { useMapEngine } from "@/map/useMapEngine";
import type { MapEngine } from "@/map/MapEngine";
import type { LngLat } from "@/gis/coordinates";

/**
 * Renders the map. Initial center/zoom can be passed in (e.g. from a
 * project's last-saved state) but nothing is persisted back yet — real
 * per-project persistence lands in Track B via
 * src/projects/maps/useMapStatePersistence.ts.
 *
 * onEngineReady exposes the underlying MapEngine so a parent (e.g. the
 * TopBar's LocationSearch) can call flyTo() — kept as a callback rather
 * than lifting the engine's creation itself, so MapCanvas stays the only
 * thing that owns the map's lifecycle (see docs/ARCHITECTURE.md rule 2).
 */
export function MapCanvas({
  initialCenter,
  initialZoom,
  onEngineReady,
}: {
  initialCenter?: LngLat;
  initialZoom?: number;
  onEngineReady?: (engine: MapEngine | null) => void;
}) {
  const { containerRef, engine } = useMapEngine({ center: initialCenter, zoom: initialZoom });

  useEffect(() => {
    onEngineReady?.(engine);
  }, [engine, onEngineReady]);

  return <div ref={containerRef} className="h-full w-full" />;
}
