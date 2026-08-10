import { ProjectList } from "@/components/projects/ProjectList";
import { NewProjectDialog } from "@/components/projects/NewProjectDialog";
import { mockProjects } from "@/projects/mockProjects";

export default function ProjectsPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-text-primary text-lg font-semibold">PlotLens</h1>
        <NewProjectDialog />
      </div>
      <ProjectList projects={mockProjects} />
    </div>
  );
}
