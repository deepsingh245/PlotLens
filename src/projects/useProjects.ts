"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createProject as createProjectInStorage,
  deleteProject as deleteProjectInStorage,
  subscribeToProjects,
} from "@/storage/projects";
import { useAuth } from "@/lib/auth/AuthProvider";
import type { NewProjectInput, Project, UseProjectsResult } from "./types";

/**
 * Track B — live onSnapshot subscription, scoped to the signed-in owner.
 * Only ever mounted behind AuthGate, but still handles a momentarily-null
 * user defensively rather than assuming it.
 */
export function useProjects(): UseProjectsResult {
  const { user } = useAuth();
  const ownerId = user?.uid ?? null;
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // No synchronous setLoading(true)/setProjects([]) here for a null ownerId — this hook is
    // only ever mounted behind AuthGate, so ownerId is already resolved by the time it mounts
    // (loading already starts true, matching useAnnotations.ts's same convention).
    if (!ownerId) return;
    return subscribeToProjects(ownerId, (loaded) => {
      setProjects(loaded);
      setLoading(false);
    });
  }, [ownerId]);

  const createProject = useCallback(async (input: NewProjectInput) => {
    return createProjectInStorage(input);
  }, []);

  const deleteProject = useCallback(async (id: string) => {
    await deleteProjectInStorage(id);
  }, []);

  return { projects, loading, createProject, deleteProject };
}
