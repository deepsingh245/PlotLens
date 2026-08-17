import { describe, expect, it } from "vitest";
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_IMPORT_FEATURES,
  MAX_IMPORT_TEXT_LENGTH,
  MAX_TAG_LENGTH,
  MAX_TAGS,
  MAX_TITLE_LENGTH,
  exportAnnotationsToGeoJson,
  parseGeoJsonImport,
} from "@/gis/geojsonImportExport";
import type { Annotation } from "@/projects/annotations/types";
import type { GeoJsonPosition } from "@/gis/coordinates";

function feature(type: string, coordinates: unknown, properties: Record<string, unknown> = {}) {
  return { type: "Feature", geometry: { type, coordinates }, properties };
}

function collection(features: unknown[]): string {
  return JSON.stringify({ type: "FeatureCollection", features });
}

function circleRing(vertices: number): GeoJsonPosition[][] {
  const ring: GeoJsonPosition[] = Array.from({ length: vertices }, (_, i) => {
    const angle = (i / vertices) * 2 * Math.PI;
    return [Math.cos(angle), Math.sin(angle)];
  });
  ring.push(ring[0]);
  return [ring];
}

const CLOSED_SQUARE = [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]];

describe("parseGeoJsonImport — valid input shapes", () => {
  it("imports a FeatureCollection with one of each supported type", () => {
    const json = collection([
      feature("Point", [77.5946, 12.9716], { name: "Camp" }),
      feature("LineString", [[77, 27], [78, 28]], { tags: ["route"] }),
      feature("Polygon", CLOSED_SQUARE, { description: "a plot" }),
    ]);
    const result = parseGeoJsonImport(json);
    expect(result.valid).toBe(true);
    expect(result.annotations).toHaveLength(3);
    expect(result.annotations?.[0]).toMatchObject({ type: "point", title: "Camp" });
    expect(result.annotations?.[1]).toMatchObject({ type: "line", tags: ["route"] });
    expect(result.annotations?.[2]).toMatchObject({ type: "polygon", description: "a plot" });
  });

  it("accepts a bare Feature (not wrapped in a FeatureCollection)", () => {
    const json = JSON.stringify(feature("Point", [1, 2]));
    expect(parseGeoJsonImport(json).valid).toBe(true);
  });

  it("accepts a bare array of Features", () => {
    const json = JSON.stringify([feature("Point", [1, 2]), feature("Point", [3, 4])]);
    const result = parseGeoJsonImport(json);
    expect(result.valid).toBe(true);
    expect(result.annotations).toHaveLength(2);
  });
});

describe("parseGeoJsonImport — malformed / oversized input", () => {
  it("rejects malformed JSON", () => {
    expect(parseGeoJsonImport("{not json").valid).toBe(false);
  });

  it("rejects a non-object, non-array root", () => {
    expect(parseGeoJsonImport(JSON.stringify("x")).valid).toBe(false);
    expect(parseGeoJsonImport(JSON.stringify(42)).valid).toBe(false);
    expect(parseGeoJsonImport(JSON.stringify(null)).valid).toBe(false);
  });

  it("rejects text over the size cap before attempting to parse JSON", () => {
    const oversized = "x".repeat(MAX_IMPORT_TEXT_LENGTH + 1);
    const result = parseGeoJsonImport(oversized);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("maximum size");
  });

  it("rejects a feature count over the cap before validating any individual feature", () => {
    const tooMany = Array.from({ length: MAX_IMPORT_FEATURES + 1 }, () => ({}));
    const result = parseGeoJsonImport(collection(tooMany));
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("too many features");
  });
});

describe("parseGeoJsonImport — rejected geometry types", () => {
  it.each([
    ["MultiPoint", [[0, 0], [1, 1]]],
    ["MultiLineString", [[[0, 0], [1, 1]]]],
    ["MultiPolygon", [[CLOSED_SQUARE[0]]]],
  ])("rejects %s", (type, coordinates) => {
    const result = parseGeoJsonImport(collection([feature(type, coordinates)]));
    expect(result.valid).toBe(false);
    expect(result.reason).toContain(type);
  });

  it("rejects GeometryCollection", () => {
    const geometryCollectionFeature = { type: "Feature", geometry: { type: "GeometryCollection", geometries: [] }, properties: {} };
    const result = parseGeoJsonImport(collection([geometryCollectionFeature]));
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("GeometryCollection");
  });
});

describe("parseGeoJsonImport — reuses annotationGeometry.ts validation", () => {
  it("rejects a polygon with a hole (more than one ring)", () => {
    const withHole = [CLOSED_SQUARE[0], [[0.25, 0.25], [0.25, 0.5], [0.5, 0.5], [0.5, 0.25], [0.25, 0.25]]];
    const result = parseGeoJsonImport(collection([feature("Polygon", withHole)]));
    expect(result.valid).toBe(false);
  });

  it("rejects a line exceeding the vertex ceiling", () => {
    const coords = Array.from({ length: 501 }, (_, i) => [i * 0.001, i * 0.001]);
    const result = parseGeoJsonImport(collection([feature("LineString", coords)]));
    expect(result.valid).toBe(false);
  });

  it("rejects an out-of-bounds point coordinate", () => {
    const result = parseGeoJsonImport(collection([feature("Point", [200, 12])]));
    expect(result.valid).toBe(false);
  });
});

describe("parseGeoJsonImport — property caps", () => {
  it("rejects an oversized name", () => {
    const result = parseGeoJsonImport(collection([feature("Point", [1, 2], { name: "x".repeat(MAX_TITLE_LENGTH + 1) })]));
    expect(result.valid).toBe(false);
  });

  it("rejects an oversized description", () => {
    const properties = { description: "x".repeat(MAX_DESCRIPTION_LENGTH + 1) };
    const result = parseGeoJsonImport(collection([feature("Point", [1, 2], properties)]));
    expect(result.valid).toBe(false);
  });

  it("rejects an oversized tag", () => {
    const properties = { tags: ["x".repeat(MAX_TAG_LENGTH + 1)] };
    const result = parseGeoJsonImport(collection([feature("Point", [1, 2], properties)]));
    expect(result.valid).toBe(false);
  });

  it("rejects too many tags", () => {
    const properties = { tags: Array.from({ length: MAX_TAGS + 1 }, (_, i) => `tag${i}`) };
    const result = parseGeoJsonImport(collection([feature("Point", [1, 2], properties)]));
    expect(result.valid).toBe(false);
  });
});

describe("parseGeoJsonImport — plotlensType resolution", () => {
  it("resolves a compatible plotlensType (circle on Polygon)", () => {
    const result = parseGeoJsonImport(collection([feature("Polygon", CLOSED_SQUARE, { plotlensType: "circle" })]));
    expect(result.valid).toBe(true);
    expect(result.annotations?.[0].type).toBe("circle");
  });

  it("resolves a compatible plotlensType (text on Point)", () => {
    const result = parseGeoJsonImport(collection([feature("Point", [1, 2], { plotlensType: "text" })]));
    expect(result.valid).toBe(true);
    expect(result.annotations?.[0].type).toBe("text");
  });

  it("falls back to the geometry mapping when plotlensType is incompatible, without failing the batch", () => {
    const result = parseGeoJsonImport(collection([feature("LineString", [[0, 0], [1, 1]], { plotlensType: "circle" })]));
    expect(result.valid).toBe(true);
    expect(result.annotations?.[0].type).toBe("line");
  });

  it("falls back to the geometry mapping when plotlensType is missing", () => {
    const result = parseGeoJsonImport(collection([feature("Polygon", CLOSED_SQUARE)]));
    expect(result.valid).toBe(true);
    expect(result.annotations?.[0].type).toBe("polygon");
  });
});

describe("parseGeoJsonImport — atomicity", () => {
  it("rejects the whole batch when any single feature is invalid", () => {
    const result = parseGeoJsonImport(
      collection([feature("Point", [1, 2]), feature("Point", [200, 12])]),
    );
    expect(result.valid).toBe(false);
    expect(result.annotations).toBeUndefined();
  });
});

describe("exportAnnotationsToGeoJson", () => {
  it("produces an empty FeatureCollection for an empty annotation list", () => {
    expect(JSON.parse(exportAnnotationsToGeoJson([]))).toEqual({ type: "FeatureCollection", features: [] });
  });

  it("never writes id or projectId into properties", () => {
    const annotation: Annotation = {
      id: "a1",
      projectId: "p1",
      type: "point",
      geometry: { type: "Point", coordinates: [1, 2] },
      title: "Spot",
      tags: [],
      attachments: [],
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
    const parsed = JSON.parse(exportAnnotationsToGeoJson([annotation]));
    expect(parsed.features[0].properties).not.toHaveProperty("id");
    expect(parsed.features[0].properties).not.toHaveProperty("projectId");
  });

  it("round-trips losslessly through import, including circle and text annotations", () => {
    const originals: Annotation[] = [
      {
        id: "a1",
        projectId: "p1",
        type: "point",
        geometry: { type: "Point", coordinates: [10, 20] },
        title: "Point A",
        description: "a description",
        tags: ["x", "y"],
        attachments: [],
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "a2",
        projectId: "p1",
        type: "circle",
        geometry: { type: "Polygon", coordinates: circleRing(16) },
        title: "Circle A",
        tags: [],
        attachments: [],
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "a3",
        projectId: "p1",
        type: "text",
        geometry: { type: "Point", coordinates: [1, 2] },
        title: "Text A",
        tags: ["note"],
        attachments: [],
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    ];

    const json = exportAnnotationsToGeoJson(originals);
    const result = parseGeoJsonImport(json);
    expect(result.valid).toBe(true);

    const stripped = originals.map((a) => ({
      type: a.type,
      geometry: a.geometry,
      title: a.title,
      description: a.description,
      tags: a.tags,
      attachments: a.attachments,
    }));
    expect(result.annotations).toEqual(stripped);
  });
});
