"use client";

import { ProjectList } from "@/components/projects/ProjectList";
import { NewProjectDialog } from "@/components/projects/NewProjectDialog";
import { useProjects } from "@/projects/useProjects";

export function ProjectsView() {
  const { projects, loading, createProject } = useProjects();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-10">
      <header className="flex items-end justify-between gap-4 border-b border-border pb-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="bg-brand-accent size-2.5 rounded-full" aria-hidden />
            <h1 className="text-text-primary text-xl font-semibold tracking-tight">PlotLens</h1>
          </div>
          <p className="text-text-secondary text-sm">
            Your land &amp; property investigations
            {!loading && projects.length > 0 && (
              <span className="text-text-secondary/70">
                {" · "}
                {projects.length} {projects.length === 1 ? "project" : "projects"}
              </span>
            )}
          </p>
        </div>
        <NewProjectDialog onCreate={createProject} />
      </header>

      {loading ? (
        <p className="text-text-secondary text-sm">Loading projects…</p>
      ) : (
        <ProjectList projects={projects} onCreate={createProject} />
      )}
    </div>
  );
}
