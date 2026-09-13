"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createSavedView as createSavedViewInStorage,
  deleteSavedView as deleteSavedViewInStorage,
  subscribeToSavedViews,
} from "@/storage/savedViews";
import type { NewSavedViewInput, SavedView, UseSavedViewsResult } from "./types";

/** Track B — live onSnapshot subscription, mirrors useAnnotations.ts/useOverlays.ts. */
export function useSavedViews(projectId: string): UseSavedViewsResult {
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return subscribeToSavedViews(projectId, (loaded) => {
      setSavedViews(loaded);
      setLoading(false);
    });
  }, [projectId]);

  const createSavedView = useCallback(async (input: NewSavedViewInput) => {
    return createSavedViewInStorage(input);
  }, []);

  const deleteSavedView = useCallback(
    async (id: string) => {
      await deleteSavedViewInStorage(projectId, id);
    },
    [projectId],
  );

  return { savedViews, loading, createSavedView, deleteSavedView };
}
