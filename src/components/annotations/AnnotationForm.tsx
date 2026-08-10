"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DeleteAnnotationDialog } from "./DeleteAnnotationDialog";
import { locationSummary } from "@/gis/annotationGeometry";
import { formatCoordinate } from "@/lib/format";
import type { Annotation } from "@/projects/annotations/types";

/**
 * Shared title/description/tags/location/edit fields — no panel chrome
 * (desktop Card vs. mobile Sheet wraps this, see AnnotationPanel.tsx).
 *
 * Local state is only ever initialized from `annotation`, never re-synced
 * to it — the parent (AnnotationPanel) renders this with `key={annotation.id}`
 * so switching the selected annotation remounts the form instead of needing
 * a "sync local state to a changing prop" effect.
 */
export function AnnotationForm({
  annotation,
  autoFocusTitle = false,
  onSave,
  onDelete,
}: {
  annotation: Annotation;
  autoFocusTitle?: boolean;
  onSave: (patch: Pick<Annotation, "title" | "description" | "tags">) => void;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState(annotation.title);
  const [description, setDescription] = useState(annotation.description ?? "");
  const [tagsText, setTagsText] = useState(annotation.tags.join(", "));
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  function handleBlurSave() {
    const tags = tagsText
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    onSave({ title, description: description || undefined, tags });
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="annotation-title">Title</Label>
        <Input
          id="annotation-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onBlur={handleBlurSave}
          autoFocus={autoFocusTitle}
          placeholder="Untitled"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="annotation-description">Description</Label>
        <textarea
          id="annotation-description"
          className="border-border bg-background min-h-20 rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          onBlur={handleBlurSave}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="annotation-tags">Tags (comma-separated)</Label>
        <Input
          id="annotation-tags"
          value={tagsText}
          onChange={(event) => setTagsText(event.target.value)}
          onBlur={handleBlurSave}
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label>Location</Label>
        <p className="text-text-secondary font-mono text-xs">
          {formatCoordinate(locationSummary(annotation.geometry))}
        </p>
      </div>

      <Button variant="destructive" onClick={() => setConfirmingDelete(true)}>
        Delete
      </Button>

      <DeleteAnnotationDialog
        open={confirmingDelete}
        onOpenChange={setConfirmingDelete}
        onConfirm={onDelete}
        annotationTitle={title}
      />
    </div>
  );
}
