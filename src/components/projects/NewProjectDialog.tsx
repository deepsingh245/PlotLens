"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { toGeoJsonPosition } from "@/gis/coordinates";
import { useAuth } from "@/lib/auth/AuthProvider";
import type { GeocodeResult } from "@/app/api/geocode/route";
import type { NewProjectInput, Project } from "@/projects/types";

export function NewProjectDialog({
  onCreate,
}: {
  onCreate: (input: NewProjectInput) => Promise<Project>;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState<GeocodeResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!user || !location) return;

    setSubmitting(true);
    try {
      const created = await onCreate({
        ownerId: user.uid,
        name,
        ...(description ? { description } : {}),
        map: { center: toGeoJsonPosition(location.lngLat), zoom: 14, bearing: 0, pitch: 0 },
      });
      setOpen(false);
      setName("");
      setDescription("");
      setLocation(null);
      router.push(`/projects/${created.id}`);
    } catch (error) {
      console.error("Failed to create project:", error);
      setSubmitting(false);
    }
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
              <Input
                id="project-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="What are you investigating?"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!name || !location || submitting}>
              {submitting ? "Creating…" : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
