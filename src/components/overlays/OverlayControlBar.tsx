"use client";

import { useEffect, useState } from "react";
import { Lock, Minus, Plus, RotateCcw, RotateCw, Trash2, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Toggle } from "@/components/ui/toggle";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { centroidOf, rotateCorners, scaleCorners } from "@/gis/imageOverlayGeometry";
import { DeleteOverlayDialog } from "./DeleteOverlayDialog";
import type { OverlayCorners } from "@/gis/imageOverlayGeometry";
import type { MapEngine } from "@/map/MapEngine";
import type { ImageOverlay } from "@/projects/overlays/types";

const ROTATE_STEP_DEGREES = 5;
const SCALE_STEP_FACTOR = 1.05;

/**
 * Floating contextual control bar for the selected overlay — not a flex
 * sibling, tracked against the map via engine.getMap().project() on every
 * move/zoom, per the validated wireframe layout (docs/design/wireframes/
 * turn 3a) and docs/plans/plan-3.md. Rendered with key={overlay.id} by the
 * caller so cumulative rotation/scale readouts reset on selection change,
 * mirroring AnnotationForm.tsx's remount-not-resync trick.
 */
export function OverlayControlBar({
  overlay,
  engine,
  onOpacityChange,
  onLockChange,
  onCornersChange,
  onDelete,
  onClose,
}: {
  overlay: ImageOverlay;
  engine: MapEngine;
  onOpacityChange: (opacity: number) => void;
  onLockChange: (locked: boolean) => void;
  onCornersChange: (corners: OverlayCorners) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [cumulativeRotation, setCumulativeRotation] = useState(0);
  const [cumulativeScalePercent, setCumulativeScalePercent] = useState(100);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    if (isMobile) return; // mobile uses the Sheet below, no floating position needed
    const map = engine.getMap();

    function reposition() {
      const [lng, lat] = centroidOf(overlay.coordinates);
      const point = map.project([lng, lat]);
      setPosition({ x: point.x, y: point.y });
    }

    reposition();
    map.on("move", reposition);
    map.on("zoom", reposition);
    return () => {
      map.off("move", reposition);
      map.off("zoom", reposition);
    };
  }, [engine, isMobile, overlay.coordinates]);

  function handleRotate(deltaDegrees: number) {
    setCumulativeRotation((current) => ((current + deltaDegrees) % 360 + 360) % 360);
    onCornersChange(rotateCorners(overlay.coordinates, deltaDegrees));
  }

  function handleScale(factor: number) {
    setCumulativeScalePercent((current) => current * factor);
    onCornersChange(scaleCorners(overlay.coordinates, factor));
  }

  const content = (
    <div className="flex items-center gap-0 overflow-hidden rounded-md border border-border bg-surface-elevated text-xs shadow-lg">
      <div className="flex h-[30px] items-center gap-1.5 border-r border-border px-2.5">
        <span className="text-text-secondary font-mono text-[10px] tracking-wider uppercase">Opacity</span>
        <Slider
          value={[overlay.opacity]}
          min={0}
          max={1}
          step={0.01}
          className="w-20"
          onValueChange={(value) => onOpacityChange(Array.isArray(value) ? value[0] : value)}
        />
        <span className="text-text-primary w-9 text-right font-mono">{Math.round(overlay.opacity * 100)}%</span>
      </div>

      <div className="flex h-[30px] items-center gap-1 border-r border-border px-2">
        <Button variant="ghost" size="icon-sm" aria-label="Rotate left" onClick={() => handleRotate(-ROTATE_STEP_DEGREES)}>
          <RotateCcw className="size-3.5" />
        </Button>
        <span className="text-text-secondary w-14 text-center font-mono">
          {cumulativeRotation > 180 ? (cumulativeRotation - 360).toFixed(1) : cumulativeRotation.toFixed(1)}°
        </span>
        <Button variant="ghost" size="icon-sm" aria-label="Rotate right" onClick={() => handleRotate(ROTATE_STEP_DEGREES)}>
          <RotateCw className="size-3.5" />
        </Button>
      </div>

      <div className="flex h-[30px] items-center gap-1 border-r border-border px-2">
        <Button variant="ghost" size="icon-sm" aria-label="Scale down" onClick={() => handleScale(1 / SCALE_STEP_FACTOR)}>
          <Minus className="size-3.5" />
        </Button>
        <span className="text-text-secondary w-12 text-center font-mono">{cumulativeScalePercent.toFixed(0)}%</span>
        <Button variant="ghost" size="icon-sm" aria-label="Scale up" onClick={() => handleScale(SCALE_STEP_FACTOR)}>
          <Plus className="size-3.5" />
        </Button>
      </div>

      <div className="flex h-[30px] items-center px-2">
        <Toggle
          pressed={overlay.locked}
          onPressedChange={onLockChange}
          size="sm"
          aria-label={overlay.locked ? "Unlock overlay" : "Lock overlay"}
        >
          {overlay.locked ? <Lock className="size-3.5" /> : <Unlock className="size-3.5" />}
        </Toggle>
        <Button variant="ghost" size="icon-sm" aria-label="Delete overlay" onClick={() => setConfirmingDelete(true)}>
          <Trash2 className="size-3.5" />
        </Button>
      </div>

      <DeleteOverlayDialog
        open={confirmingDelete}
        onOpenChange={setConfirmingDelete}
        onConfirm={onDelete}
        overlayName={overlay.name}
      />
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>{overlay.name || "Untitled overlay"}</SheetTitle>
          </SheetHeader>
          <div className="p-4">{content}</div>
        </SheetContent>
      </Sheet>
    );
  }

  if (!position) return null;

  return (
    <div
      className="absolute z-10"
      style={{ left: position.x, top: position.y, transform: "translate(-50%, -140%)" }}
    >
      {content}
    </div>
  );
}
