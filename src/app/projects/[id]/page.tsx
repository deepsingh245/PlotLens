import { notFound } from "next/navigation";
import { ProjectWorkspace } from "@/components/projects/ProjectWorkspace";
import { mockProjects } from "@/projects/mockProjects";

// Track A: looked up from mock data. Track B replaces this with a real
// Firestore getProject() call — see docs/plans/plan-1.md.
export default async function ProjectWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = mockProjects.find((candidate) => candidate.id === id);

  if (!project) {
    notFound();
  }

  return <ProjectWorkspace project={project} />;
}
