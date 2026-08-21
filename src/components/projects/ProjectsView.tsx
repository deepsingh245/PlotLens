"use client";

import { ProjectList } from "@/components/projects/ProjectList";
import { NewProjectDialog } from "@/components/projects/NewProjectDialog";
import { useProjects } from "@/projects/useProjects";

export function ProjectsView() {
  const { projects, loading, createProject } = useProjects();

  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-text-primary text-lg font-semibold">PlotLens</h1>
        <NewProjectDialog onCreate={createProject} />
      </div>
      {loading ? (
        <p className="text-text-secondary text-sm">Loading projects…</p>
      ) : (
        <ProjectList projects={projects} />
      )}
    </div>
  );
}
