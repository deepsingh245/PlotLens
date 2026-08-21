"use client";

import { useEffect, useRef, useState } from "react";
import { toProjectMapState } from "@/gis/mapState";
import { updateProjectMap } from "@/storage/projects";
import type { MapEngine } from "@/map/MapEngine";
import type { SaveStatus } from "@/components/shell/SaveStatusIndicator";

const DEBOUNCE_MS = 800;
const SAVED_FLASH_MS = 2000;

/**
 * Debounced move-end -> real Firestore write of Project.map, driving
 * SaveStatusIndicator. Greenfield (docs/plans/plan-1.md Track B) — Track A
 * only ever built the raw MapEngine.onMoveEnd subscription primitive and
 * toProjectMapState, never the debounce/write/status logic itself.
 */
export function useMapStatePersistence(engine: MapEngine | null, projectId: string): SaveStatus {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!engine) return;
    const currentEngine = engine;

    function scheduleWrite() {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        if (resetRef.current) clearTimeout(resetRef.current);
        setStatus("saving");
        try {
          await updateProjectMap(projectId, toProjectMapState(currentEngine.getMap()));
          setStatus("saved");
        } catch (error) {
          console.error("Failed to save map view:", error);
          setStatus("error");
        }
        resetRef.current = setTimeout(() => setStatus("idle"), SAVED_FLASH_MS);
      }, DEBOUNCE_MS);
    }

    const unsubscribe = currentEngine.onMoveEnd(scheduleWrite);
    return () => {
      unsubscribe();
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (resetRef.current) clearTimeout(resetRef.current);
    };
  }, [engine, projectId]);

  return status;
}
