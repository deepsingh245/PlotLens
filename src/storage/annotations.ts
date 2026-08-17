import { validateDrawnFeature } from "@/gis/annotationGeometry";
import { mockAnnotations } from "@/projects/annotations/mockAnnotations";
import type { Annotation, NewAnnotationInput } from "@/projects/annotations/types";

/**
 * Track A body — in-memory only, seeded from mockAnnotations.ts. Exported
 * signatures below are the contract the rest of the app depends on; this
 * body gets wholesale-replaced with real Firestore calls in Track B
 * (docs/plans/plan-2.md Task 11) without changing any call site.
 */
const store = new Map<string, Annotation[]>();

function seedIfNeeded(projectId: string): Annotation[] {
  if (!store.has(projectId)) {
    store.set(
      projectId,
      mockAnnotations.filter((annotation) => annotation.projectId === projectId).map((a) => ({ ...a })),
    );
  }
  return store.get(projectId)!;
}

function nextId(): string {
  return crypto.randomUUID();
}

export async function listAnnotations(projectId: string): Promise<Annotation[]> {
  return [...seedIfNeeded(projectId)];
}

export async function createAnnotation(input: NewAnnotationInput): Promise<Annotation> {
  // Geometry.type here has already passed through toAnnotationGeometry (see DrawingManager's
  // create handler) — re-validating the tool<->geometry-type pairing here is the actual security
  // enforcement point (docs/plans/plan-2.md Task 4), not the Firestore rules layer.
  const tool = input.type === "text" ? "point" : input.type;
  const asFeature = { type: "Feature", geometry: input.geometry, properties: {} };
  const { valid, reason } = validateDrawnFeature(tool, asFeature);
  if (!valid) {
    throw new Error(`createAnnotation: invalid geometry for type "${input.type}" — ${reason}`);
  }

  const now = new Date().toISOString();
  const annotation: Annotation = { ...input, id: nextId(), createdAt: now, updatedAt: now };
  seedIfNeeded(input.projectId).push(annotation);
  return annotation;
}

export async function createAnnotations(inputs: NewAnnotationInput[]): Promise<Annotation[]> {
  // Validate every input before writing any — atomic all-or-nothing (docs/plans/plan-4.md).
  for (const input of inputs) {
    const tool = input.type === "text" ? "point" : input.type;
    const asFeature = { type: "Feature", geometry: input.geometry, properties: {} };
    const { valid, reason } = validateDrawnFeature(tool, asFeature);
    if (!valid) {
      throw new Error(`createAnnotations: invalid geometry for type "${input.type}" — ${reason}`);
    }
  }

  const projectIds = new Set(inputs.map((input) => input.projectId));
  if (projectIds.size > 1) {
    throw new Error("createAnnotations: all inputs must belong to the same project");
  }

  const now = new Date().toISOString();
  const created = inputs.map((input) => ({ ...input, id: nextId(), createdAt: now, updatedAt: now }));
  if (created.length > 0) {
    seedIfNeeded(inputs[0].projectId).push(...created);
  }
  return created;
}

export async function updateAnnotation(
  projectId: string,
  id: string,
  patch: Partial<Pick<Annotation, "title" | "description" | "tags" | "geometry">>,
): Promise<void> {
  const annotations = seedIfNeeded(projectId);
  const index = annotations.findIndex((a) => a.id === id);
  if (index === -1) throw new Error(`updateAnnotation: no annotation ${id} in project ${projectId}`);

  annotations[index] = { ...annotations[index], ...patch, updatedAt: new Date().toISOString() };
}

export async function deleteAnnotation(projectId: string, id: string): Promise<void> {
  const annotations = seedIfNeeded(projectId);
  store.set(projectId, annotations.filter((a) => a.id !== id));
}
