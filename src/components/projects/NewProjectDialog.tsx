"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LocationSearch } from "@/components/search/LocationSearch";
import type { GeocodeResult } from "@/app/api/geocode/route";

/**
 * Track A: submit is stubbed (no Firestore yet). Track B replaces onCreate
 * with a real createProject() call — see docs/plans/plan-1.md. The chosen
 * location resolves Project.map.center; no separate place-name field exists
 * on the Project schema (docs/DATA_MODEL.md is frozen shape).
 */
export function NewProjectDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [location, setLocation] = useState<GeocodeResult | null>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    // TODO(Track B): call createProject({ name, ownerId, map: { center: toGeoJsonPosition(location.lngLat), ... } })
    // then router.push to the new project.
    setOpen(false);
    setName("");
    setLocation(null);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>+ New Map</Button>} />
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New Project</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="project-name">Project name</Label>
              <Input
                id="project-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Agra Ring Road Investigation"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Location</Label>
              <LocationSearch onSelect={setLocation} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="project-description">Description (optional)</Label>
              <Input id="project-description" placeholder="What are you investigating?" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!name || !location}>
              Create Project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
