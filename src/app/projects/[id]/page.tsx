import { ProjectWorkspaceLoader } from "@/components/projects/ProjectWorkspaceLoader";

// Depends on the Firebase client SDK (useProject) — can't be statically
// prerendered without real .env.local credentials at build time.
export const dynamic = "force-dynamic";

export default async function ProjectWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProjectWorkspaceLoader projectId={id} />;
}
