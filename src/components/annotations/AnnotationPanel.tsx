"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { AnnotationForm } from "./AnnotationForm";
import type { Annotation } from "@/projects/annotations/types";

/**
 * Desktop: real flex sibling Card (not a floating overlay — avoids
 * colliding with MapLibre's top-right NavigationControl). Mobile (<768px):
 * bottom Sheet. See docs/design/MAP_INTERACTIONS.md §Contextual panels over modals.
 */
export function AnnotationPanel({
  annotation,
  autoFocusTitle = false,
  onClose,
  onSave,
  onDelete,
}: {
  annotation: Annotation;
  autoFocusTitle?: boolean;
  onClose: () => void;
  onSave: (patch: Pick<Annotation, "title" | "description" | "tags">) => void;
  onDelete: () => void;
}) {
  const isMobile = useMediaQuery("(max-width: 767px)");

  if (isMobile) {
    return (
      <Sheet open onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>{annotation.title || "Untitled"}</SheetTitle>
          </SheetHeader>
          <AnnotationForm
            key={annotation.id}
            annotation={annotation}
            autoFocusTitle={autoFocusTitle}
            onSave={onSave}
            onDelete={onDelete}
          />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Card className="w-72 shrink-0 overflow-y-auto rounded-none border-y-0 border-r-0">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {annotation.title || "Untitled"}
          <button
            type="button"
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary text-xs"
            aria-label="Close"
          >
            Close
          </button>
        </CardTitle>
      </CardHeader>
      <AnnotationForm annotation={annotation} autoFocusTitle={autoFocusTitle} onSave={onSave} onDelete={onDelete} />
    </Card>
  );
}
