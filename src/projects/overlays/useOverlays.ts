"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createOverlay as createOverlayInStorage,
  deleteOverlay as deleteOverlayInStorage,
  listOverlays,
  updateOverlay as updateOverlayInStorage,
} from "@/storage/overlays";
import type { ImageOverlay, NewOverlayInput, UseOverlaysResult } from "./types";

/**
 * Track A body — local useState + optimistic updates after each mock CRUD
 * call resolves (no backend to subscribe to yet). Track B (docs/plans/plan-3.md
 * Task 7) replaces this with a live onSnapshot subscription, mirroring
 * src/projects/annotations/useAnnotations.ts exactly.
 */
export function useOverlays(projectId: string): UseOverlaysResult {
  const [overlays, setOverlays] = useState<ImageOverlay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    listOverlays(projectId).then((loaded) => {
      if (!cancelled) {
        setOverlays(loaded);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const createOverlay = useCallback(async (input: NewOverlayInput) => {
    const created = await createOverlayInStorage(input);
    setOverlays((current) => [...current, created]);
    return created;
  }, []);

  const updateOverlay = useCallback(
    async (id: string, patch: Parameters<UseOverlaysResult["updateOverlay"]>[1]) => {
      await updateOverlayInStorage(projectId, id, patch);
      setOverlays((current) =>
        current.map((o) => (o.id === id ? { ...o, ...patch, updatedAt: new Date().toISOString() } : o)),
      );
    },
    [projectId],
  );

  const deleteOverlay = useCallback(
    async (id: string) => {
      await deleteOverlayInStorage(projectId, id);
      setOverlays((current) => current.filter((o) => o.id !== id));
    },
    [projectId],
  );

  return { overlays, loading, createOverlay, updateOverlay, deleteOverlay };
}
