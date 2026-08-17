import { toAnnotationGeometry, validateDrawnFeature, type DrawTool } from "./annotationGeometry";
import type { Annotation, AnnotationType, NewAnnotationInput } from "@/projects/annotations/types";

/**
 * Client-side GeoJSON import/export (docs/plans/plan-4.md) — no server route,
 * no new dependency. Reuses validateDrawnFeature/toAnnotationGeometry as the
 * actual geometry-security boundary; this file only handles the GeoJSON
 * envelope (FeatureCollection/Feature shape, caps, property extraction) and
 * the plotlensType round-trip hint plain GeoJSON has no room for otherwise.
 */

export const MAX_IMPORT_FEATURES = 2000;
export const MAX_IMPORT_TEXT_LENGTH = 5 * 1024 * 1024; // string length as a byte-count proxy
export const MAX_TITLE_LENGTH = 500;
export const MAX_DESCRIPTION_LENGTH = 5000;
export const MAX_TAG_LENGTH = 100;
export const MAX_TAGS = 50;

const DRAW_TOOL_FOR_GEOMETRY_TYPE: Record<string, DrawTool> = {
  Point: "point",
  LineString: "line",
  Polygon: "polygon",
  // MultiPoint / MultiLineString / MultiPolygon / GeometryCollection deliberately
  // absent — their absence here is the rejection mechanism.
};

// A hinted plotlensType is only trusted when it's compatible with the feature's
// actual geometry type — an incompatible or invalid hint falls back to the
// geometry mapping rather than failing the whole import.
const COMPATIBLE_TYPES_FOR_GEOMETRY: Record<string, readonly AnnotationType[]> = {
  Point: ["point", "text"],
  LineString: ["line"],
  Polygon: ["polygon", "circle"],
};

interface RawGeoJsonFeature {
  geometry?: { type?: unknown; coordinates?: unknown } | null;
  properties?: Record<string, unknown> | null;
}

export interface GeoJsonImportResult {
  valid: boolean;
  /** Dev-facing only — never rendered raw to the end user. */
  reason?: string;
  annotations?: Omit<NewAnnotationInput, "projectId">[];
}

function asFeatureArray(root: unknown): unknown[] | null {
  if (Array.isArray(root)) return root;
  if (typeof root !== "object" || root === null) return null;
  const obj = root as { type?: unknown; features?: unknown };
  if (obj.type === "FeatureCollection") return Array.isArray(obj.features) ? obj.features : null;
  if (obj.type === "Feature") return [root];
  return null;
}

function extractString(value: unknown, maxLength: number): { ok: boolean; value?: string } {
  if (value === undefined || value === null) return { ok: true, value: undefined };
  if (typeof value !== "string" || value.length > maxLength) return { ok: false };
  return { ok: true, value };
}

function extractTags(value: unknown): { ok: boolean; tags?: string[] } {
  if (value === undefined || value === null) return { ok: true, tags: [] };
  if (!Array.isArray(value) || value.length > MAX_TAGS) return { ok: false };
  const tags: string[] = [];
  for (const tag of value) {
    if (typeof tag !== "string" || tag.length > MAX_TAG_LENGTH) return { ok: false };
    tags.push(tag);
  }
  return { ok: true, tags };
}

export function parseGeoJsonImport(text: string): GeoJsonImportResult {
  if (text.length > MAX_IMPORT_TEXT_LENGTH) {
    return { valid: false, reason: `file exceeds the maximum size (${MAX_IMPORT_TEXT_LENGTH} characters)` };
  }

  let root: unknown;
  try {
    root = JSON.parse(text);
  } catch {
    return { valid: false, reason: "malformed JSON" };
  }

  const features = asFeatureArray(root);
  if (!features) {
    return { valid: false, reason: "root must be a FeatureCollection, a Feature, or an array of Features" };
  }
  if (features.length > MAX_IMPORT_FEATURES) {
    return { valid: false, reason: `too many features (max ${MAX_IMPORT_FEATURES})` };
  }

  const annotations: Omit<NewAnnotationInput, "projectId">[] = [];

  for (let i = 0; i < features.length; i++) {
    const item = features[i];
    if (typeof item !== "object" || item === null) {
      return { valid: false, reason: `feature ${i}: not an object` };
    }
    const rawFeature = item as RawGeoJsonFeature;

    const geometryType = rawFeature.geometry?.type;
    if (typeof geometryType !== "string") {
      return { valid: false, reason: `feature ${i}: missing or invalid geometry type` };
    }
    const tool = DRAW_TOOL_FOR_GEOMETRY_TYPE[geometryType];
    if (!tool) {
      return { valid: false, reason: `feature ${i}: unsupported geometry type "${geometryType}"` };
    }

    const wrapped = { type: "Feature", geometry: rawFeature.geometry, properties: {} };
    const { valid, reason } = validateDrawnFeature(tool, wrapped);
    if (!valid) {
      return { valid: false, reason: `feature ${i}: ${reason}` };
    }
    const geometry = toAnnotationGeometry(tool, wrapped);

    const properties = rawFeature.properties ?? {};
    const title = extractString(properties.name, MAX_TITLE_LENGTH);
    if (!title.ok) return { valid: false, reason: `feature ${i}: "name" property invalid or too long` };
    const description = extractString(properties.description, MAX_DESCRIPTION_LENGTH);
    if (!description.ok) return { valid: false, reason: `feature ${i}: "description" property invalid or too long` };
    const tags = extractTags(properties.tags);
    if (!tags.ok) return { valid: false, reason: `feature ${i}: "tags" property invalid, too long, or too numerous` };

    const hinted = properties.plotlensType;
    const compatible = COMPATIBLE_TYPES_FOR_GEOMETRY[geometryType];
    const type: AnnotationType =
      typeof hinted === "string" && compatible?.includes(hinted as AnnotationType) ? (hinted as AnnotationType) : tool;

    annotations.push({
      type,
      geometry,
      title: title.value ?? "",
      description: description.value,
      tags: tags.tags ?? [],
      attachments: [],
    });
  }

  return { valid: true, annotations };
}

export function exportAnnotationsToGeoJson(annotations: Annotation[]): string {
  const features = annotations.map((annotation) => ({
    type: "Feature" as const,
    geometry: annotation.geometry,
    properties: {
      name: annotation.title,
      description: annotation.description,
      tags: annotation.tags,
      plotlensType: annotation.type,
    },
  }));
  return JSON.stringify({ type: "FeatureCollection", features }, null, 2);
}
