import { describe, expect, it } from "vitest";
import {
  distanceFromPointToGeometry,
  findNearestAnnotation,
  findPolygonOverlaps,
} from "@/gis/spatialAnalysis";
import type { AnnotationGeometry, Polygon } from "@/gis/geojson";

const METERS_PER_DEGREE_AT_EQUATOR = 111_195; // matches tests/unit/gis/measurement.test.ts's fixture

describe("distanceFromPointToGeometry", () => {
  it("matches the well-documented ~111.19km-per-degree reference figure for point-to-point", () => {
    const result = distanceFromPointToGeometry([0, 0], { type: "Point", coordinates: [0, 1] });
    expect(result.kilometers).toBeGreaterThan(110);
    expect(result.kilometers).toBeLessThan(112);
  });

  it("computes the real perpendicular distance from a point to the nearest point on a line, not a vertex distance", () => {
    // A north-south line at lng=0; a point one degree of longitude east, level
    // with the line's midpoint — the closest point on the line is (0,0), not
    // either endpoint, so this only passes if Turf is doing a true line
    // projection, not point-to-vertex distance.
    const line: AnnotationGeometry = { type: "LineString", coordinates: [[0, -1], [0, 1]] };
    const result = distanceFromPointToGeometry([1, 0], line);
    expect(result.kilometers).toBeGreaterThan(108);
    expect(result.kilometers).toBeLessThan(113);
  });

  it("returns zero when the point is inside the polygon", () => {
    const square: Polygon = {
      type: "Polygon",
      coordinates: [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]],
    };
    const result = distanceFromPointToGeometry([0.5, 0.5], square);
    expect(result.kilometers).toBe(0);
  });

  it("computes real distance to the polygon boundary when the point is outside", () => {
    const square: Polygon = {
      type: "Polygon",
      coordinates: [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]],
    };
    // One degree of longitude east of the square's right edge, at its mid-latitude.
    const result = distanceFromPointToGeometry([2, 0.5], square);
    expect(result.kilometers).toBeGreaterThan(108);
    expect(result.kilometers).toBeLessThan(113);
  });
});

describe("findNearestAnnotation", () => {
  it("picks the closer of two candidates using real geometry-aware distance", () => {
    const near = { id: "near", geometry: { type: "Point", coordinates: [0, 0.1] } as AnnotationGeometry };
    const far = { id: "far", geometry: { type: "Point", coordinates: [0, 5] } as AnnotationGeometry };
    const result = findNearestAnnotation([0, 0], [far, near]);
    expect(result?.annotation.id).toBe("near");
    expect(result?.distance.kilometers).toBeLessThan(20);
  });

  it("returns null for an empty candidate list", () => {
    expect(findNearestAnnotation([0, 0], [])).toBeNull();
  });
});

describe("findPolygonOverlaps", () => {
  it("matches an independently-computed planar overlap area for two offset squares near the equator", () => {
    const side = 0.01;
    const target: Polygon = {
      type: "Polygon",
      coordinates: [[[0, 0], [0, side], [side, side], [side, 0], [0, 0]]],
    };
    // Offset by half the side — overlap is a (side/2) x (side/2) square in the corner.
    const offset = side / 2;
    const other: Polygon = {
      type: "Polygon",
      coordinates: [[
        [offset, offset],
        [offset, offset + side],
        [offset + side, offset + side],
        [offset + side, offset],
        [offset, offset],
      ]],
    };

    const results = findPolygonOverlaps(target, [{ id: "other", geometry: other }]);
    expect(results).toHaveLength(1);

    const overlapSide = side / 2;
    const expectedSquareMeters = (overlapSide * METERS_PER_DEGREE_AT_EQUATOR) ** 2;
    expect(results[0].overlapArea.squareMeters).toBeGreaterThan(expectedSquareMeters * 0.9);
    expect(results[0].overlapArea.squareMeters).toBeLessThan(expectedSquareMeters * 1.1);
  });

  it("returns nothing for non-overlapping polygons", () => {
    const target: Polygon = { type: "Polygon", coordinates: [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]] };
    const farAway: Polygon = { type: "Polygon", coordinates: [[[10, 10], [10, 11], [11, 11], [11, 10], [10, 10]]] };
    expect(findPolygonOverlaps(target, [{ id: "far", geometry: farAway }])).toEqual([]);
  });

  it("skips non-polygon candidates instead of coercing them", () => {
    const target: Polygon = { type: "Polygon", coordinates: [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]] };
    const point = { id: "pt", geometry: { type: "Point", coordinates: [0.5, 0.5] } as AnnotationGeometry };
    expect(findPolygonOverlaps(target, [point])).toEqual([]);
  });
});
