"use client";

import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ImportGeoJsonDialog } from "@/components/projects/ImportGeoJsonDialog";
import { DeleteProjectDialog } from "./DeleteProjectDialog";
import { exportAnnotationsToGeoJson } from "@/gis/geojsonImportExport";
import type { Annotation, NewAnnotationInput } from "@/projects/annotations/types";

/** Hard delete, not archivedAt — see docs/plans/plan-1.md and docs/DATA_RETENTION.md. */
export function ProjectMenu({
  annotations,
  projectName,
  onImportGeoJson,
  onDeleteProject,
}: {
  annotations: Annotation[];
  projectName: string;
  onImportGeoJson: (inputs: Omit<NewAnnotationInput, "projectId">[]) => Promise<void>;
  onDeleteProject: () => void;
}) {
  const [importOpen, setImportOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  function handleExport() {
    const json = exportAnnotationsToGeoJson(annotations);
    const blob = new Blob([json], { type: "application/geo+json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${projectName}.geojson`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Project menu" />}>
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setImportOpen(true)}>Import GeoJSON…</DropdownMenuItem>
          <Tooltip>
            <TooltipTrigger
              render={<DropdownMenuItem disabled={annotations.length === 0} onClick={handleExport} />}
            >
              Export GeoJSON
            </TooltipTrigger>
            <TooltipContent side="left">
              {annotations.length === 0 ? "Add an annotation before exporting" : "Download this project's annotations as GeoJSON"}
            </TooltipContent>
          </Tooltip>
          <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
            Delete Project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ImportGeoJsonDialog open={importOpen} onOpenChange={setImportOpen} onImport={onImportGeoJson} />
      <DeleteProjectDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={onDeleteProject}
        projectName={projectName}
      />
    </>
  );
}
