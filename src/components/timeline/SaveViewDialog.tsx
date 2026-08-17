"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Externally controlled (open/onOpenChange) — opened from HistoryPanel's
 * "Save current view" button, not a self-contained trigger. Mirrors
 * AddOverlayDialog.tsx's conventions.
 */
export function SaveViewDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (name: string) => void;
}) {
  const [name, setName] = useState("");

  function reset() {
    setName("");
  }

  function handleConfirm(event: React.FormEvent) {
    event.preventDefault();
    onConfirm(name.trim() || "Untitled view");
    setName("");
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
            <DialogTitle>Save current view</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-4">
            <Label htmlFor="saved-view-name">Name</Label>
            <Input
              id="saved-view-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Before the ring road proposal"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button type="submit">Save view</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
