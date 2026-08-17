"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validateImageFile } from "@/lib/fileValidation";
import type { OverlayCorners } from "@/gis/imageOverlayGeometry";
import type { NewOverlayInput } from "@/projects/overlays/types";

const MAX_IMAGE_DIMENSION_PX = 8000;

/**
 * File-picker dialog for the "Image overlay" tool — externally controlled
 * (open/onOpenChange) rather than owning its own DialogTrigger, since it's
 * opened from ToolRail's one-shot "image" action, not a click on this
 * component. defaultCorners is computed by the caller (needs engine.getMap())
 * right before opening — see docs/plans/plan-3.md.
 */
export function AddOverlayDialog({
  open,
  onOpenChange,
  defaultCorners,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultCorners: OverlayCorners;
  onConfirm: (input: Omit<NewOverlayInput, "projectId">) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [approximateDate, setApproximateDate] = useState("");

  function reset() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setError(null);
    setName("");
    setDescription("");
    setApproximateDate("");
  }

  async function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    if (!selected) return;

    const validation = await validateImageFile(selected);
    if (!validation.valid) {
      setError(validation.reason ?? "invalid file");
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    const bitmap = await createImageBitmap(selected);
    if (bitmap.width > MAX_IMAGE_DIMENSION_PX || bitmap.height > MAX_IMAGE_DIMENSION_PX) {
      setError(`image dimensions exceed ${MAX_IMAGE_DIMENSION_PX}px`);
      return;
    }

    setError(null);
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setName(selected.name.replace(/\.[^/.]+$/, ""));
  }

  function handleConfirm(event: React.FormEvent) {
    event.preventDefault();
    if (!file || !previewUrl) return;

    onConfirm({
      imageUrl: previewUrl, // Track A: an ephemeral blob: URL — see src/storage/overlays.ts
      coordinates: defaultCorners,
      opacity: 1,
      visible: true,
      rotation: null,
      blendMode: "normal",
      locked: false,
      name: name || file.name,
      sourceMetadata: { description, approximateDate: approximateDate || null },
    });
    // Deliberately do not revoke previewUrl here — it's now the overlay's live imageUrl.
    setFile(null);
    setPreviewUrl(null);
    onOpenChange(false);
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
        <form onSubmit={handleConfirm}>
          <DialogHeader>
            <DialogTitle>Add image overlay</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="overlay-file">Image (JPEG or PNG)</Label>
              <input
                id="overlay-file"
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleFileSelected}
                className="border-border bg-background rounded-md border px-3 py-2 text-sm"
              />
              {error && <p className="text-destructive text-xs">{error}</p>}
              {previewUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- a local blob: preview, not an optimizable remote image
                <img src={previewUrl} alt="" className="max-h-40 rounded-md border border-border object-contain" />
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="overlay-name">Name</Label>
              <Input id="overlay-name" value={name} onChange={(event) => setName(event.target.value)} />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="overlay-description">Description</Label>
              <Input
                id="overlay-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Where this map/photo came from"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="overlay-date">Approximate date (optional)</Label>
              <Input
                id="overlay-date"
                value={approximateDate}
                onChange={(event) => setApproximateDate(event.target.value)}
                placeholder="e.g. 1995"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!file}>
              Add overlay
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
