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
 *
 * Positioned `absolute`/`inset:0` against a `position: relative` parent
 * (see ProjectWorkspace.tsx's wrapper) so it resolves against the real
 * layout size regardless of flexbox's height-as-used-value quirk (a flex
 * item's flex-grow-derived height isn't a spec-"explicitly specified"
 * height, so a percentage-height child like `h-full` can silently resolve
 * to 0 nested inside one).
 *
 * The root cause of a real bug this positioning alone doesn't fix: MapLibre
 * itself adds a `maplibregl-map` class to this exact container element
 * (`_setupContainer()`), and `maplibre-gl.css`'s `.maplibregl-map` rule sets
 * `position: relative` — same specificity as Tailwind's `.absolute` utility,
 * so whichever stylesheet loads later in the build wins the cascade tie,
 * silently canceling the `absolute` positioning `inset-0` depends on
 * (verified via computed styles: clientHeight was genuinely 0, not just
 * racing ahead of layout, so no ResizeObserver could fix it). Position is
 * therefore set inline instead of via className — an inline `style`
 * attribute always outranks any class-selector rule in the cascade,
 * regardless of stylesheet load order, so it can't lose to maplibre-gl.css.
 * Caller must wrap this in a `relative` container with a size.
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

  return <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />;
}
