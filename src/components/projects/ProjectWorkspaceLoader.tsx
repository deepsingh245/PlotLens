"use client";

import { notFound } from "next/navigation";
import { ProjectWorkspace } from "@/components/projects/ProjectWorkspace";
import { useProject } from "@/projects/useProject";

// Track B: looked up via a live Firestore onSnapshot subscription
// (useProject) — see docs/plans/plan-1.md. Client component because there's
// no server-side Firestore access in this app (no firebase-admin usage).
export function ProjectWorkspaceLoader({ projectId }: { projectId: string }) {
  const { project, loading } = useProject(projectId);

  if (loading) {
    return <p className="text-text-secondary p-8 text-sm">Loading project…</p>;
  }

  if (!project) {
    notFound();
  }

  return <ProjectWorkspace project={project} />;
}
