import type { GeoJsonPosition } from "@/gis/coordinates";

/** Mirrors docs/DATA_MODEL.md's SavedView schema. */
export interface SavedView {
  id: string;
  projectId: string;
  name: string;
  map: { center: GeoJsonPosition; zoom: number; bearing: number; pitch: number };
  // Layer.id references — always [] until Phase 6 (provider-backed layers) lands.
  activeLayers: { layerId: string; visible: boolean; opacity: number }[];
  selectedFeatureId: string | null;
  createdAt: string;
}

export type NewSavedViewInput = Omit<SavedView, "id" | "createdAt">;

export interface UseSavedViewsResult {
  savedViews: SavedView[];
  loading: boolean;
  createSavedView: (input: NewSavedViewInput) => Promise<SavedView>;
  deleteSavedView: (id: string) => Promise<void>;
}
