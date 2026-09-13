"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createAnnotation as createAnnotationInStorage,
  createAnnotations as createAnnotationsInStorage,
  deleteAnnotation as deleteAnnotationInStorage,
  subscribeToAnnotations,
  updateAnnotation as updateAnnotationInStorage,
} from "@/storage/annotations";
import type { Annotation, NewAnnotationInput, UseAnnotationsResult } from "./types";

/**
 * Track B — live onSnapshot subscription. Firestore's local cache applies
 * writes optimistically and re-fires the listener immediately, so there's no
 * separate optimistic-patch step here (Track A's local setState-after-write
 * approach is dropped entirely, per this file's own long-standing comment).
 */
export function useAnnotations(projectId: string): UseAnnotationsResult {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // No synchronous setLoading(true) here — loading already starts true, matching
    // useProjects.ts/useProject.ts's same convention.
    return subscribeToAnnotations(projectId, (loaded) => {
      setAnnotations(loaded);
      setLoading(false);
    });
  }, [projectId]);

  const createAnnotation = useCallback(async (input: NewAnnotationInput) => {
    return createAnnotationInStorage(input);
  }, []);

  const createAnnotations = useCallback(async (inputs: NewAnnotationInput[]) => {
    return createAnnotationsInStorage(inputs);
  }, []);

  const updateAnnotation = useCallback(
    async (id: string, patch: Parameters<UseAnnotationsResult["updateAnnotation"]>[1]) => {
      await updateAnnotationInStorage(projectId, id, patch);
    },
    [projectId],
  );

  const deleteAnnotation = useCallback(
    async (id: string) => {
      await deleteAnnotationInStorage(projectId, id);
    },
    [projectId],
  );

  return { annotations, loading, createAnnotation, createAnnotations, updateAnnotation, deleteAnnotation };
}
