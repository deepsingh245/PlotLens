import type { DrawTool } from "@/gis/annotationGeometry";
import type { AnnotationGeometry } from "@/gis/geojson";

export type AnnotationType = DrawTool | "text";

/** Mirrors docs/DATA_MODEL.md's Annotation schema. */
export interface Annotation {
  id: string;
  projectId: string;
  type: AnnotationType;
  geometry: AnnotationGeometry; // GeoJSON geometry, [lng, lat] order — see src/gis/coordinates.ts
  title: string;
  description?: string;
  tags: string[];
  attachments: string[]; // Attachment.id — Phase 3 plumbing; always [] this phase
  createdAt: string;
  updatedAt: string;
}

export type NewAnnotationInput = Omit<Annotation, "id" | "createdAt" | "updatedAt">;

export interface UseAnnotationsResult {
  annotations: Annotation[];
  loading: boolean;
  createAnnotation: (input: NewAnnotationInput) => Promise<Annotation>;
  createAnnotations: (inputs: NewAnnotationInput[]) => Promise<Annotation[]>;
  updateAnnotation: (
    id: string,
    patch: Partial<Pick<Annotation, "title" | "description" | "tags" | "geometry">>,
  ) => Promise<void>;
  deleteAnnotation: (id: string) => Promise<void>;
}
