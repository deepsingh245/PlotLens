"use client";

import { useEffect, useState } from "react";
import { subscribeToProject } from "@/storage/projects";
import type { Project, UseProjectResult } from "./types";

/** Track B — live onSnapshot subscription for a single project by id. */
export function useProject(id: string): UseProjectResult {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // No synchronous setLoading(true) here — loading already starts true, matching
    // useAnnotations.ts's same convention (the workspace page isn't navigated between
    // two different project ids without an intervening full mount).
    return subscribeToProject(id, (loaded) => {
      setProject(loaded);
      setLoading(false);
    });
  }, [id]);

  return { project, loading };
}
