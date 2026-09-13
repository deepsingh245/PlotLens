import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
  updateDoc,
  writeBatch,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { validateDrawnFeature } from "@/gis/annotationGeometry";
import type { Annotation, NewAnnotationInput } from "@/projects/annotations/types";

/**
 * Track B — real Firestore CRUD against the `projects/{projectId}/annotations`
 * subcollection (see firestore.rules and docs/DATA_MODEL.md).
 */
function annotationsCollection(projectId: string) {
  return collection(db, "projects", projectId, "annotations");
}

/**
 * Firestore does not support nested arrays, and line/polygon/circle GeoJSON
 * coordinates are exactly that (`[[lng,lat],[lng,lat],…]`). So geometry is
 * stored as a JSON string at the Firestore boundary and rehydrated on read —
 * the rest of the app keeps working with real geometry objects. Point docs
 * written before this change stored an object and are still read correctly
 * (the decode only parses when the stored value is a string).
 */
function decodeGeometry(data: Record<string, unknown>): Record<string, unknown> {
  if (typeof data.geometry === "string") {
    return { ...data, geometry: JSON.parse(data.geometry) as unknown };
  }
  return data;
}

function encodeForFirestore<T extends Record<string, unknown>>(payload: T): T {
  const geometry = payload.geometry;
  if (geometry && typeof geometry === "object" && "type" in geometry && "coordinates" in geometry) {
    return { ...payload, geometry: JSON.stringify(geometry) };
  }
  return payload;
}

function toAnnotation(id: string, data: Record<string, unknown>): Annotation {
  return { id, ...decodeGeometry(data) } as Annotation;
}

function assertValidGeometry(input: Pick<NewAnnotationInput, "type" | "geometry">, fnName: string): void {
  // Re-validating here is the actual security enforcement point (docs/plans/plan-2.md
  // Task 4), not the Firestore rules layer — never trust drawn/imported geometry as
  // pre-sanitized.
  const tool = input.type === "text" ? "point" : input.type;
  const asFeature = { type: "Feature", geometry: input.geometry, properties: {} };
  const { valid, reason } = validateDrawnFeature(tool, asFeature);
  if (!valid) {
    throw new Error(`${fnName}: invalid geometry for type "${input.type}" — ${reason}`);
  }
}

/** setDoc rejects `undefined` values outright — omit rather than send them. */
function withoutUndefined<T extends Record<string, unknown>>(input: T): Partial<T> {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined)) as Partial<T>;
}

/** updateDoc rejects `undefined` too, but here it means "clear this field" — use the sentinel. */
function toUpdatePayload<T extends Record<string, unknown>>(patch: T): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(patch).map(([key, value]) => [key, value === undefined ? deleteField() : value]),
  );
}

export async function listAnnotations(projectId: string): Promise<Annotation[]> {
  const snapshot = await getDocs(annotationsCollection(projectId));
  return snapshot.docs.map((snap) => toAnnotation(snap.id, snap.data()));
}

export function subscribeToAnnotations(
  projectId: string,
  onChange: (annotations: Annotation[]) => void,
): Unsubscribe {
  return onSnapshot(annotationsCollection(projectId), (snapshot) => {
    onChange(snapshot.docs.map((snap) => toAnnotation(snap.id, snap.data())));
  });
}

export async function createAnnotation(input: NewAnnotationInput): Promise<Annotation> {
  assertValidGeometry(input, "createAnnotation");

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const payload = withoutUndefined({ ...input, createdAt: now, updatedAt: now });
  await setDoc(doc(annotationsCollection(input.projectId), id), encodeForFirestore(payload));
  return { id, ...payload } as Annotation;
}

export async function createAnnotations(inputs: NewAnnotationInput[]): Promise<Annotation[]> {
  // Validate every input before writing any — atomic all-or-nothing (docs/plans/plan-4.md).
  for (const input of inputs) assertValidGeometry(input, "createAnnotations");

  const projectIds = new Set(inputs.map((input) => input.projectId));
  if (projectIds.size > 1) {
    throw new Error("createAnnotations: all inputs must belong to the same project");
  }
  if (inputs.length === 0) return [];

  const projectId = inputs[0].projectId;
  const now = new Date().toISOString();
  const batch = writeBatch(db);
  const created = inputs.map((input) => {
    const id = crypto.randomUUID();
    const payload = withoutUndefined({ ...input, createdAt: now, updatedAt: now });
    batch.set(doc(annotationsCollection(projectId), id), encodeForFirestore(payload));
    return { id, ...payload } as Annotation;
  });
  await batch.commit();
  return created;
}

export async function updateAnnotation(
  projectId: string,
  id: string,
  patch: Partial<Pick<Annotation, "title" | "description" | "tags" | "geometry">>,
): Promise<void> {
  await updateDoc(doc(annotationsCollection(projectId), id), {
    ...encodeForFirestore(toUpdatePayload(patch)),
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteAnnotation(projectId: string, id: string): Promise<void> {
  await deleteDoc(doc(annotationsCollection(projectId), id));
}
