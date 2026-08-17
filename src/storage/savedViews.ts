import { mockSavedViews } from "@/projects/savedViews/mockSavedViews";
import type { NewSavedViewInput, SavedView } from "@/projects/savedViews/types";

/**
 * Track A body — in-memory only, seeded from mockSavedViews.ts. Same
 * "wholesale-replaced in Track B without changing call sites" contract as
 * storage/annotations.ts / storage/overlays.ts.
 */
const store = new Map<string, SavedView[]>();

function seedIfNeeded(projectId: string): SavedView[] {
  if (!store.has(projectId)) {
    store.set(
      projectId,
      mockSavedViews.filter((view) => view.projectId === projectId).map((v) => ({ ...v })),
    );
  }
  return store.get(projectId)!;
}

function nextId(): string {
  return crypto.randomUUID();
}

export async function listSavedViews(projectId: string): Promise<SavedView[]> {
  return [...seedIfNeeded(projectId)];
}

export async function createSavedView(input: NewSavedViewInput): Promise<SavedView> {
  const savedView: SavedView = { ...input, id: nextId(), createdAt: new Date().toISOString() };
  seedIfNeeded(input.projectId).push(savedView);
  return savedView;
}

export async function deleteSavedView(projectId: string, id: string): Promise<void> {
  const views = seedIfNeeded(projectId);
  store.set(projectId, views.filter((v) => v.id !== id));
}
