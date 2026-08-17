"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createSavedView as createSavedViewInStorage,
  deleteSavedView as deleteSavedViewInStorage,
  listSavedViews,
} from "@/storage/savedViews";
import type { NewSavedViewInput, SavedView, UseSavedViewsResult } from "./types";

/** Track A body — local useState, mirrors useAnnotations.ts/useOverlays.ts exactly. */
export function useSavedViews(projectId: string): UseSavedViewsResult {
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    listSavedViews(projectId).then((loaded) => {
      if (!cancelled) {
        setSavedViews(loaded);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const createSavedView = useCallback(async (input: NewSavedViewInput) => {
    const created = await createSavedViewInStorage(input);
    setSavedViews((current) => [...current, created]);
    return created;
  }, []);

  const deleteSavedView = useCallback(
    async (id: string) => {
      await deleteSavedViewInStorage(projectId, id);
      setSavedViews((current) => current.filter((v) => v.id !== id));
    },
    [projectId],
  );

  return { savedViews, loading, createSavedView, deleteSavedView };
}
