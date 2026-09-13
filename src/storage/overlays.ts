import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
  updateDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "@/lib/firebaseClient";
import { validateOverlayCorners } from "@/gis/imageOverlayGeometry";
import type { ImageOverlay, NewOverlayInput } from "@/projects/overlays/types";

/**
 * Track B — real Firestore CRUD against `projects/{projectId}/overlays`
 * (see firestore.rules) plus real Firebase Storage upload (see storage.rules,
 * docs/plans/plan-3.md Task 7).
 */
function overlaysCollection(projectId: string) {
  return collection(db, "projects", projectId, "overlays");
}

/**
 * Firestore does not support nested arrays, and an overlay's `coordinates` is
 * four `[lng,lat]` corners — a nested array. Storing it as a JSON string would
 * defeat the `coordinates.size() == 4` backstop in firestore.rules, so instead
 * each corner is stored as a `{lng,lat}` object: an array of 4 objects is
 * Firestore-native (not a nested array) AND keeps `.size() == 4` meaningful.
 * Converted back to `[lng,lat]` positions on read so the rest of the app is
 * unchanged.
 */
type CornerObject = { lng: number; lat: number };

function decodeCoordinates(data: Record<string, unknown>): Record<string, unknown> {
  const coords = data.coordinates;
  if (Array.isArray(coords) && coords.length > 0 && coords[0] !== null && typeof coords[0] === "object" && !Array.isArray(coords[0])) {
    return { ...data, coordinates: (coords as CornerObject[]).map(({ lng, lat }) => [lng, lat]) };
  }
  return data;
}

function encodeForFirestore<T extends Record<string, unknown>>(payload: T): T {
  const coords = payload.coordinates;
  if (Array.isArray(coords) && Array.isArray(coords[0])) {
    const asObjects = (coords as [number, number][]).map(([lng, lat]) => ({ lng, lat }));
    return { ...payload, coordinates: asObjects };
  }
  return payload;
}

function toOverlay(id: string, data: Record<string, unknown>): ImageOverlay {
  return { id, ...decodeCoordinates(data) } as ImageOverlay;
}

function clampOpacity(opacity: number): number {
  return Math.min(1, Math.max(0, opacity));
}

function extensionForContentType(contentType: string): string {
  return contentType === "image/png" ? "png" : "jpg";
}

/**
 * AddOverlayDialog only ever hands us a `blob:` object URL (see its own
 * comment) — fetch() on a same-page blob URL resolves the original Blob from
 * memory, no network call. Uploading it and returning the real download URL
 * lets every call site above (AddOverlayDialog, ProjectWorkspace) stay
 * unchanged, matching this file's long-standing "same signatures, real body"
 * contract.
 */
async function uploadOverlayImage(projectId: string, overlayId: string, blobUrl: string): Promise<string> {
  const blob = await (await fetch(blobUrl)).blob();
  URL.revokeObjectURL(blobUrl); // its only remaining purpose was to hand us this Blob
  const path = `projects/${projectId}/overlays/${overlayId}/image.${extensionForContentType(blob.type)}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, blob, { contentType: blob.type });
  return getDownloadURL(storageRef);
}

export async function listOverlays(projectId: string): Promise<ImageOverlay[]> {
  const snapshot = await getDocs(overlaysCollection(projectId));
  return snapshot.docs.map((snap) => toOverlay(snap.id, snap.data()));
}

export function subscribeToOverlays(projectId: string, onChange: (overlays: ImageOverlay[]) => void): Unsubscribe {
  return onSnapshot(overlaysCollection(projectId), (snapshot) => {
    onChange(snapshot.docs.map((snap) => toOverlay(snap.id, snap.data())));
  });
}

export async function createOverlay(input: NewOverlayInput): Promise<ImageOverlay> {
  // Re-validating here is the actual security enforcement point (same pattern as
  // storage/annotations.ts's createAnnotation) — never trust drag/upload output
  // as pre-sanitized just because it already passed a client-side fast-fail check.
  const { valid, reason } = validateOverlayCorners(input.coordinates);
  if (!valid) {
    throw new Error(`createOverlay: invalid corners — ${reason}`);
  }

  const id = crypto.randomUUID();
  const imageUrl = await uploadOverlayImage(input.projectId, id, input.imageUrl);
  const now = new Date().toISOString();
  const payload = { ...input, imageUrl, opacity: clampOpacity(input.opacity), createdAt: now, updatedAt: now };
  await setDoc(doc(overlaysCollection(input.projectId), id), encodeForFirestore(payload));
  return { id, ...payload };
}

export async function updateOverlay(
  projectId: string,
  id: string,
  patch: Partial<Pick<ImageOverlay, "coordinates" | "opacity" | "visible" | "locked" | "name">>,
): Promise<void> {
  if (patch.coordinates) {
    const { valid, reason } = validateOverlayCorners(patch.coordinates);
    if (!valid) throw new Error(`updateOverlay: invalid corners — ${reason}`);
  }

  await updateDoc(doc(overlaysCollection(projectId), id), {
    ...encodeForFirestore({
      ...patch,
      ...(patch.opacity !== undefined ? { opacity: clampOpacity(patch.opacity) } : {}),
    }),
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteOverlay(projectId: string, id: string): Promise<void> {
  const overlayRef = doc(overlaysCollection(projectId), id);
  const snapshot = await getDoc(overlayRef);
  const imageUrl = snapshot.data()?.imageUrl as string | undefined;

  await deleteDoc(overlayRef);

  // Best-effort — the Firestore doc is already gone either way; a failure here just
  // leaks one orphaned Storage object rather than leaving a doc pointing at a deleted image.
  if (imageUrl) {
    try {
      await deleteObject(ref(storage, imageUrl));
    } catch (error) {
      console.error("Failed to delete overlay image from Storage:", error);
    }
  }
}
