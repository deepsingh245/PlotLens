import { EmptyState } from "./EmptyState";
import { ProjectCard } from "./ProjectCard";
import type { NewProjectInput, Project } from "@/projects/types";

export function ProjectList({
  projects,
  onCreate,
}: {
  projects: Project[];
  onCreate: (input: NewProjectInput) => Promise<Project>;
}) {
  if (projects.length === 0) {
    return <EmptyState onCreate={onCreate} />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
