import Link from "next/link";
import { History } from "lucide-react";
import { SaveStatusIndicator, type SaveStatus } from "./SaveStatusIndicator";
import { ProjectMenu } from "./ProjectMenu";
import { Button } from "@/components/ui/button";
import { LocationSearch } from "@/components/search/LocationSearch";
import type { GeocodeResult } from "@/app/api/geocode/route";
import type { Annotation, NewAnnotationInput } from "@/projects/annotations/types";

/**
 * Exactly 34px — see docs/design/DESIGN_SYSTEM.md §Validated layout dimensions.
 */
export function TopBar({
  projectName,
  saveStatus = "idle",
  onSearchSelect,
  annotations,
  onImportGeoJson,
  onOpenHistory,
}: {
  projectName: string;
  saveStatus?: SaveStatus;
  onSearchSelect?: (result: GeocodeResult) => void;
  annotations: Annotation[];
  onImportGeoJson: (inputs: Omit<NewAnnotationInput, "projectId">[]) => Promise<void>;
  onOpenHistory: () => void;
}) {
  return (
    <div
      className="flex items-center gap-3 border-b border-border bg-surface px-3"
      style={{ height: 34 }}
    >
      <Link href="/" className="text-text-primary text-sm font-medium">
        PlotLens
      </Link>
      <span className="text-text-secondary text-sm">{projectName}</span>
      <div className="flex flex-1 justify-center">
        {onSearchSelect && <LocationSearch onSelect={onSearchSelect} />}
      </div>
      <SaveStatusIndicator status={saveStatus} />
      <Button variant="ghost" size="icon-sm" aria-label="History" onClick={onOpenHistory}>
        <History className="size-4" />
      </Button>
      <ProjectMenu annotations={annotations} projectName={projectName} onImportGeoJson={onImportGeoJson} />
    </div>
  );
}
