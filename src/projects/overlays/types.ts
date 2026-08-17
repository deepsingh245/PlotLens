import type { OverlayCorners } from "@/gis/imageOverlayGeometry";

export type BlendMode = "normal" | "multiply" | "screen";

/** Mirrors docs/DATA_MODEL.md's ImageOverlay schema. */
export interface ImageOverlay {
  id: string;
  projectId: string;
  imageUrl: string; // Firebase Storage path (Track B) or an ephemeral blob: URL (Track A) — see storage/overlays.ts
  coordinates: OverlayCorners;
  opacity: number; // 0.0–1.0
  visible: boolean;
  rotation: number | null; // always null this phase — derived, never persisted, see docs/GIS_ARCHITECTURE.md
  blendMode: BlendMode; // always "normal" until the custom-layer work lands (docs/plans/plan-3.md Task 8)
  locked: boolean;
  name: string;
  sourceMetadata: {
    description: string;
    approximateDate: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export type NewOverlayInput = Omit<ImageOverlay, "id" | "createdAt" | "updatedAt">;

export interface UseOverlaysResult {
  overlays: ImageOverlay[];
  loading: boolean;
  createOverlay: (input: NewOverlayInput) => Promise<ImageOverlay>;
  updateOverlay: (
    id: string,
    patch: Partial<Pick<ImageOverlay, "coordinates" | "opacity" | "visible" | "locked" | "name">>,
  ) => Promise<void>;
  deleteOverlay: (id: string) => Promise<void>;
}
