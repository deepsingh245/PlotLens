import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import type { NewSavedViewInput, SavedView } from "@/projects/savedViews/types";

/**
 * Track B — real Firestore CRUD against `projects/{projectId}/savedViews`
 * (see firestore.rules). Create/delete only — no update, matching
 * UseSavedViewsResult's existing shape.
 */
function savedViewsCollection(projectId: string) {
  return collection(db, "projects", projectId, "savedViews");
}

function toSavedView(id: string, data: Record<string, unknown>): SavedView {
  return { id, ...data } as SavedView;
}

export async function listSavedViews(projectId: string): Promise<SavedView[]> {
  const snapshot = await getDocs(savedViewsCollection(projectId));
  return snapshot.docs.map((snap) => toSavedView(snap.id, snap.data()));
}

export function subscribeToSavedViews(projectId: string, onChange: (savedViews: SavedView[]) => void): Unsubscribe {
  return onSnapshot(savedViewsCollection(projectId), (snapshot) => {
    onChange(snapshot.docs.map((snap) => toSavedView(snap.id, snap.data())));
  });
}

export async function createSavedView(input: NewSavedViewInput): Promise<SavedView> {
  const id = crypto.randomUUID();
  const payload = { ...input, createdAt: new Date().toISOString() };
  await setDoc(doc(savedViewsCollection(input.projectId), id), payload);
  return { id, ...payload };
}

export async function deleteSavedView(projectId: string, id: string): Promise<void> {
  await deleteDoc(doc(savedViewsCollection(projectId), id));
}
