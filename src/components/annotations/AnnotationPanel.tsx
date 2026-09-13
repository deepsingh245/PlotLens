"use client";

import { X } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
        <CardTitle className="flex items-center justify-between gap-2">
          <span className="truncate">{annotation.title || "Untitled"}</span>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0"
          >
            <X className="size-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <AnnotationForm annotation={annotation} autoFocusTitle={autoFocusTitle} onSave={onSave} onDelete={onDelete} />
    </Card>
  );
}
