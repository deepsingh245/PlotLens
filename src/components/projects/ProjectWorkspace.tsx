"use client";

import { useRef, useState } from "react";
import { Marker } from "maplibre-gl";
import { TopBar } from "@/components/shell/TopBar";
import { MapCanvas } from "@/components/map/MapCanvas";
import { fromGeoJsonPosition } from "@/gis/coordinates";
import type { MapEngine } from "@/map/MapEngine";
import type { GeocodeResult } from "@/app/api/geocode/route";
import type { Project } from "@/projects/types";

/**
 * Client-side shell for a single project's map workspace. Search-result
 * selection drops an ephemeral marker only (not persisted) — full
 * pin/marker persistence is Phase 2, see docs/plans/plan-1.md Task 5.
 */
export function ProjectWorkspace({ project }: { project: Project }) {
  const [engine, setEngine] = useState<MapEngine | null>(null);
  const searchMarkerRef = useRef<Marker | null>(null);

  function handleSearchSelect(result: GeocodeResult) {
    if (!engine) return;

    engine.flyTo(result.lngLat);

    searchMarkerRef.current?.remove();
    searchMarkerRef.current = new Marker({ color: "#b8ff52" })
      .setLngLat([result.lngLat.lng, result.lngLat.lat])
      .addTo(engine.getMap());
  }

  return (
    <div className="flex flex-1 flex-col">
      <TopBar projectName={project.name} onSearchSelect={handleSearchSelect} />
      <div className="flex flex-1">
        <MapCanvas
          initialCenter={fromGeoJsonPosition(project.map.center)}
          initialZoom={project.map.zoom}
          onEngineReady={setEngine}
        />
      </div>
    </div>
  );
}
