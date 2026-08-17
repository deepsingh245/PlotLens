import { validateOverlayCorners } from "@/gis/imageOverlayGeometry";
import { mockOverlays } from "@/projects/overlays/mockOverlays";
import type { ImageOverlay, NewOverlayInput } from "@/projects/overlays/types";

/**
 * Track A body — in-memory only, seeded from mockOverlays.ts. Exported
 * signatures below are the contract the rest of the app depends on; this
 * body gets wholesale-replaced with real Firestore + Storage calls in
 * Track B (docs/plans/plan-3.md Task 7) without changing any call site.
 */
const store = new Map<string, ImageOverlay[]>();

function seedIfNeeded(projectId: string): ImageOverlay[] {
  if (!store.has(projectId)) {
    store.set(
      projectId,
      mockOverlays.filter((overlay) => overlay.projectId === projectId).map((o) => ({ ...o })),
    );
  }
  return store.get(projectId)!;
}

function nextId(): string {
  return crypto.randomUUID();
}

function clampOpacity(opacity: number): number {
  return Math.min(1, Math.max(0, opacity));
}

export async function listOverlays(projectId: string): Promise<ImageOverlay[]> {
  return [...seedIfNeeded(projectId)];
}

export async function createOverlay(input: NewOverlayInput): Promise<ImageOverlay> {
  // Re-validating here is the actual security enforcement point (same pattern as
  // storage/annotations.ts's createAnnotation) — never trust drag/upload output
  // as pre-sanitized just because it already passed a client-side fast-fail check.
  const { valid, reason } = validateOverlayCorners(input.coordinates);
  if (!valid) {
    throw new Error(`createOverlay: invalid corners — ${reason}`);
  }

  const now = new Date().toISOString();
  const overlay: ImageOverlay = { ...input, opacity: clampOpacity(input.opacity), id: nextId(), createdAt: now, updatedAt: now };
  seedIfNeeded(input.projectId).push(overlay);
  return overlay;
}

export async function updateOverlay(
  projectId: string,
  id: string,
  patch: Partial<Pick<ImageOverlay, "coordinates" | "opacity" | "visible" | "locked" | "name">>,
): Promise<void> {
  const overlays = seedIfNeeded(projectId);
  const index = overlays.findIndex((o) => o.id === id);
  if (index === -1) throw new Error(`updateOverlay: no overlay ${id} in project ${projectId}`);

  if (patch.coordinates) {
    const { valid, reason } = validateOverlayCorners(patch.coordinates);
    if (!valid) throw new Error(`updateOverlay: invalid corners — ${reason}`);
  }

  const nextOpacity = patch.opacity === undefined ? undefined : clampOpacity(patch.opacity);
  overlays[index] = {
    ...overlays[index],
    ...patch,
    ...(nextOpacity !== undefined ? { opacity: nextOpacity } : {}),
    updatedAt: new Date().toISOString(),
  };
}

export async function deleteOverlay(projectId: string, id: string): Promise<void> {
  const overlays = seedIfNeeded(projectId);
  store.set(projectId, overlays.filter((o) => o.id !== id));
}
