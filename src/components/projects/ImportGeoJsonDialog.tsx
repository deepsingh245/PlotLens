"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { parseGeoJsonImport } from "@/gis/geojsonImportExport";
import type { NewAnnotationInput } from "@/projects/annotations/types";

/**
 * Externally controlled (open/onOpenChange) rather than owning a DialogTrigger —
 * opened from ProjectMenu's dropdown item, not a click on this component. See
 * docs/plans/plan-4.md.
 */
export function ImportGeoJsonDialog({
  open,
  onOpenChange,
  onImport,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (inputs: Omit<NewAnnotationInput, "projectId">[]) => Promise<void>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [featureCount, setFeatureCount] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);

  function reset() {
    setError(null);
    setFeatureCount(null);
    setProcessing(false);
  }

  async function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    event.target.value = ""; // allow re-selecting the same filename after an error
    if (!selected) return;

    setError(null);
    setFeatureCount(null);
    setProcessing(true);
    try {
      const text = await selected.text();
      const result = parseGeoJsonImport(text);
      if (!result.valid || !result.annotations) {
        setError(result.reason ?? "invalid GeoJSON file");
        return;
      }
      setFeatureCount(result.annotations.length);
      await onImport(result.annotations);
      onOpenChange(false);
    } catch {
      setError("failed to import — the file may be too large or not valid GeoJSON");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import GeoJSON</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="geojson-file">GeoJSON file (.geojson or .json)</Label>
            <input
              id="geojson-file"
              type="file"
              accept=".geojson,.json,application/geo+json,application/json"
              onChange={handleFileSelected}
              disabled={processing}
              className="border-border bg-background rounded-md border px-3 py-2 text-sm"
            />
          </div>
          {processing && (
            <p className="text-text-secondary text-xs">
              {featureCount !== null ? (
                <>
                  Processing <span className="font-mono">{featureCount.toLocaleString()}</span> features…
                </>
              ) : (
                "Processing file…"
              )}
            </p>
          )}
          {error && <p className="text-destructive text-xs">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={processing}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
