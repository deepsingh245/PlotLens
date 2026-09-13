import { Map } from "lucide-react";
import { NewProjectDialog } from "./NewProjectDialog";
import type { NewProjectInput, Project } from "@/projects/types";

export function EmptyState({
  onCreate,
}: {
  onCreate: (input: NewProjectInput) => Promise<Project>;
}) {
  return (
    <div className="border-border flex flex-1 flex-col items-center justify-center gap-4 rounded-xl border border-dashed py-20 text-center">
      <div className="bg-surface-elevated text-brand-accent flex size-12 items-center justify-center rounded-full">
        <Map className="size-6" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-text-primary text-sm font-medium">No projects yet</p>
        <p className="text-text-secondary max-w-xs text-sm">
          Start an investigation — pick a location and build your map from there.
        </p>
      </div>
      <NewProjectDialog onCreate={onCreate} />
    </div>
  );
}
