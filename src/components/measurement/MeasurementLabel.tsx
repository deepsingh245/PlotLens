"use client";

import { useEffect, useState } from "react";
import type { GeoJsonPosition } from "@/gis/coordinates";
import type { MapEngine } from "@/map/MapEngine";

/**
 * Live floating measurement readout — not a modal, per
 * docs/design/MAP_INTERACTIONS.md §Measurement UX. Tracked against the map
 * via engine.getMap().project(), same pattern as OverlayControlBar.tsx.
 */
export function MeasurementLabel({
  engine,
  at,
  text,
}: {
  engine: MapEngine;
  at: GeoJsonPosition;
  text: string;
}) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const map = engine.getMap();

    function reposition() {
      const point = map.project(at);
      setPosition({ x: point.x, y: point.y });
    }

    reposition();
    map.on("move", reposition);
    map.on("zoom", reposition);
    return () => {
      map.off("move", reposition);
      map.off("zoom", reposition);
    };
  }, [engine, at]);

  if (!position) return null;

  return (
    <div
      className="border-border bg-surface-elevated text-text-primary pointer-events-none absolute z-10 rounded-md border px-2 py-1 font-mono text-xs shadow-lg"
      style={{ left: position.x + 12, top: position.y + 12 }}
    >
      {text}
    </div>
  );
}
