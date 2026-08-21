import { ProjectsView } from "@/components/projects/ProjectsView";

// This page is behind AuthGate and depends on the Firebase client SDK
// (useProjects), which can't be statically prerendered without real
// .env.local credentials at build time — force-dynamic skips that.
export const dynamic = "force-dynamic";

export default function ProjectsPage() {
  return <ProjectsView />;
}
