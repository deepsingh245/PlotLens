import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import type { Project } from "@/projects/types";
import type { ProjectMapState } from "@/projects/maps/types";

/**
 * Track B — real Firestore CRUD against the `projects/{projectId}`
 * collection (see firestore.rules and docs/DATA_MODEL.md). The
 * `layers`/`overlays`/`annotations`/`savedViews` ID arrays are only ever
 * written empty at create time (required by firestore.rules) and are not
 * kept in sync afterward — subcollection queries (Phase 2/3/7/8 Track B) are
 * the real source of truth, not these arrays.
 */
const projectsCollection = collection(db, "projects");

function toProject(id: string, data: Record<string, unknown>): Project {
  return { id, ...data } as Project;
}

export async function listProjects(ownerId: string): Promise<Project[]> {
  const snapshot = await getDocs(query(projectsCollection, where("ownerId", "==", ownerId)));
  return snapshot.docs.map((snap) => toProject(snap.id, snap.data()));
}

export function subscribeToProjects(ownerId: string, onChange: (projects: Project[]) => void): Unsubscribe {
  const projectsQuery = query(projectsCollection, where("ownerId", "==", ownerId));
  return onSnapshot(projectsQuery, (snapshot) => {
    onChange(snapshot.docs.map((snap) => toProject(snap.id, snap.data())));
  });
}

export function subscribeToProject(id: string, onChange: (project: Project | null) => void): Unsubscribe {
  return onSnapshot(doc(db, "projects", id), (snapshot) => {
    onChange(snapshot.exists() ? toProject(snapshot.id, snapshot.data()) : null);
  });
}

export async function getProject(id: string): Promise<Project | null> {
  const snapshot = await getDoc(doc(db, "projects", id));
  return snapshot.exists() ? toProject(snapshot.id, snapshot.data()) : null;
}

export async function createProject(input: {
  ownerId: string;
  name: string;
  description?: string;
  map: ProjectMapState;
}): Promise<Project> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  // firestore.rules requires all seven keys present and the four arrays empty on create.
  const payload: Omit<Project, "id"> = {
    ownerId: input.ownerId,
    name: input.name,
    ...(input.description ? { description: input.description } : {}),
    map: input.map,
    layers: [],
    overlays: [],
    annotations: [],
    savedViews: [],
    createdAt: now,
    updatedAt: now,
    archivedAt: null,
  };
  await setDoc(doc(db, "projects", id), payload);
  return { id, ...payload };
}

export async function updateProjectMap(id: string, map: ProjectMapState): Promise<void> {
  await updateDoc(doc(db, "projects", id), { map, updatedAt: new Date().toISOString() });
}

/** Hard delete, not archivedAt — see ProjectMenu.tsx and docs/DATA_RETENTION.md. */
export async function deleteProject(id: string): Promise<void> {
  await deleteDoc(doc(db, "projects", id));
}
