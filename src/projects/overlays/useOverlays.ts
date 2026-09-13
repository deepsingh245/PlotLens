"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createOverlay as createOverlayInStorage,
  deleteOverlay as deleteOverlayInStorage,
  subscribeToOverlays,
  updateOverlay as updateOverlayInStorage,
} from "@/storage/overlays";
import type { ImageOverlay, NewOverlayInput, UseOverlaysResult } from "./types";

/**
 * Track B — live onSnapshot subscription, mirroring
 * src/projects/annotations/useAnnotations.ts exactly.
 */
export function useOverlays(projectId: string): UseOverlaysResult {
  const [overlays, setOverlays] = useState<ImageOverlay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return subscribeToOverlays(projectId, (loaded) => {
      setOverlays(loaded);
      setLoading(false);
    });
  }, [projectId]);

  const createOverlay = useCallback(async (input: NewOverlayInput) => {
    return createOverlayInStorage(input);
  }, []);

  const updateOverlay = useCallback(
    async (id: string, patch: Parameters<UseOverlaysResult["updateOverlay"]>[1]) => {
      await updateOverlayInStorage(projectId, id, patch);
    },
    [projectId],
  );

  const deleteOverlay = useCallback(
    async (id: string) => {
      await deleteOverlayInStorage(projectId, id);
    },
    [projectId],
  );

  return { overlays, loading, createOverlay, updateOverlay, deleteOverlay };
}
