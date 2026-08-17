"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createAnnotation as createAnnotationInStorage,
  createAnnotations as createAnnotationsInStorage,
  deleteAnnotation as deleteAnnotationInStorage,
  listAnnotations,
  updateAnnotation as updateAnnotationInStorage,
} from "@/storage/annotations";
import type { Annotation, NewAnnotationInput, UseAnnotationsResult } from "./types";

/**
 * Track A body — local useState + optimistic updates after each mock CRUD
 * call resolves (no backend to subscribe to yet). Track B (docs/plans/plan-2.md
 * Task 11) replaces this with a live onSnapshot subscription and drops the
 * local-state approach entirely.
 */
export function useAnnotations(projectId: string): UseAnnotationsResult {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // No synchronous setLoading(true) here — `loading` already starts true, and this
    // effect runs once per projectId (the workspace remounts on project change anyway).
    listAnnotations(projectId).then((loaded) => {
      if (!cancelled) {
        setAnnotations(loaded);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const createAnnotation = useCallback(
    async (input: NewAnnotationInput) => {
      const created = await createAnnotationInStorage(input);
      setAnnotations((current) => [...current, created]);
      return created;
    },
    [],
  );

  const createAnnotations = useCallback(
    async (inputs: NewAnnotationInput[]) => {
      const created = await createAnnotationsInStorage(inputs);
      setAnnotations((current) => [...current, ...created]);
      return created;
    },
    [],
  );

  const updateAnnotation = useCallback(
    async (id: string, patch: Parameters<UseAnnotationsResult["updateAnnotation"]>[1]) => {
      await updateAnnotationInStorage(projectId, id, patch);
      setAnnotations((current) =>
        current.map((a) => (a.id === id ? { ...a, ...patch, updatedAt: new Date().toISOString() } : a)),
      );
    },
    [projectId],
  );

  const deleteAnnotation = useCallback(
    async (id: string) => {
      await deleteAnnotationInStorage(projectId, id);
      setAnnotations((current) => current.filter((a) => a.id !== id));
    },
    [projectId],
  );

  return { annotations, loading, createAnnotation, createAnnotations, updateAnnotation, deleteAnnotation };
}
