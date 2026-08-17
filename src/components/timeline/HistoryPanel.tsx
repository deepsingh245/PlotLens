"use client";

import { useState } from "react";
import { Bookmark, ImagePlus, MapPin, Ruler, Save, StickyNote, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SaveViewDialog } from "./SaveViewDialog";
import type { SavedView } from "@/projects/savedViews/types";
import type { InvestigationEvent, InvestigationEventType } from "@/projects/investigationEvents/types";

const EVENT_ICON: Record<InvestigationEventType, typeof MapPin> = {
  annotation_created: MapPin,
  overlay_added: ImagePlus,
  measurement_taken: Ruler,
  note_added: StickyNote,
};

/**
 * Project-level history — saved views + the investigation timeline. Not a
 * per-object contextual panel like AnnotationPanel/OverlayControlBar, so it's
 * a slide-over Sheet (side="right", the shadcn default) rather than a docked
 * panel — works the same on desktop and mobile without a separate branch.
 * See docs/plans/plan-8.md.
 */
export function HistoryPanel({
  open,
  onOpenChange,
  savedViews,
  events,
  onSaveView,
  onRestoreView,
  onDeleteView,
  onAddNote,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  savedViews: SavedView[];
  events: InvestigationEvent[];
  onSaveView: (name: string) => void;
  onRestoreView: (view: SavedView) => void;
  onDeleteView: (id: string) => void;
  onAddNote: (text: string) => void;
}) {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [noteText, setNoteText] = useState("");

  const sortedEvents = [...events].sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  function handleAddNote(event: React.FormEvent) {
    event.preventDefault();
    if (!noteText.trim()) return;
    onAddNote(noteText.trim());
    setNoteText("");
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>History</SheetTitle>
          </SheetHeader>

          <div className="flex flex-col gap-6 overflow-y-auto p-4 pt-0">
            <section className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h3 className="text-text-secondary text-xs font-medium tracking-wide uppercase">Saved views</h3>
                <Button variant="ghost" size="icon-sm" aria-label="Save current view" onClick={() => setSaveDialogOpen(true)}>
                  <Save className="size-4" />
                </Button>
              </div>
              {savedViews.length === 0 ? (
                <p className="text-text-secondary text-xs">No saved views yet.</p>
              ) : (
                <ul className="flex flex-col gap-1">
                  {savedViews.map((view) => (
                    <li key={view.id} className="group flex items-center gap-2 rounded-md px-1 py-1 hover:bg-surface-elevated">
                      <button
                        type="button"
                        onClick={() => onRestoreView(view)}
                        className="flex flex-1 items-center gap-2 text-left text-sm text-text-primary"
                      >
                        <Bookmark className="size-3.5 text-text-secondary" />
                        {view.name}
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete saved view "${view.name}"`}
                        onClick={() => onDeleteView(view.id)}
                        className="text-text-secondary opacity-0 hover:text-destructive group-hover:opacity-100"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="flex flex-col gap-2">
              <h3 className="text-text-secondary text-xs font-medium tracking-wide uppercase">Timeline</h3>
              <form onSubmit={handleAddNote} className="flex gap-2">
                <Input
                  value={noteText}
                  onChange={(event) => setNoteText(event.target.value)}
                  placeholder="Add a note…"
                  className="text-sm"
                />
                <Button type="submit" size="sm" disabled={!noteText.trim()}>
                  Add
                </Button>
              </form>
              {sortedEvents.length === 0 ? (
                <p className="text-text-secondary text-xs">Nothing logged yet — annotations, overlays, and measurements appear here as you work.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {sortedEvents.map((event) => {
                    const Icon = EVENT_ICON[event.type];
                    return (
                      <li key={event.id} className="flex items-start gap-2 text-sm">
                        <Icon className="text-text-secondary mt-0.5 size-3.5 shrink-0" />
                        <div className="flex flex-col">
                          <span className="text-text-primary">{event.summary}</span>
                          <span className="text-text-secondary font-mono text-[10px]">
                            {new Date(event.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>
        </SheetContent>
      </Sheet>

      <SaveViewDialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen} onConfirm={onSaveView} />
    </>
  );
}
