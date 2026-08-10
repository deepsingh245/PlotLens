import { describe, expect, it } from "vitest";
import {
  annotationTypeForTool,
  locationSummary,
  toAnnotationGeometry,
  validateDrawnFeature,
} from "@/gis/annotationGeometry";
import type { Polygon } from "@/gis/geojson";

function feature(type: string, coordinates: unknown) {
  return { type: "Feature", geometry: { type, coordinates }, properties: {} };
}

describe("validateDrawnFeature — point", () => {
  it("accepts a well-formed point", () => {
    expect(validateDrawnFeature("point", feature("Point", [77.5946, 12.9716])).valid).toBe(true);
  });

  it("rejects an out-of-bounds coordinate", () => {
    expect(validateDrawnFeature("point", feature("Point", [200, 12.9])).valid).toBe(false);
  });

  it("rejects a non-finite coordinate", () => {
    expect(validateDrawnFeature("point", feature("Point", [NaN, 12.9])).valid).toBe(false);
    expect(validateDrawnFeature("point", feature("Point", [Infinity, 12.9])).valid).toBe(false);
  });

  it("rejects a geometry-type/tool mismatch", () => {
    expect(validateDrawnFeature("point", feature("LineString", [[0, 0], [1, 1]])).valid).toBe(false);
  });
});

describe("validateDrawnFeature — line", () => {
  it("accepts a well-formed line", () => {
    const coords = [[77.0, 27.0], [78.0, 28.0]];
    expect(validateDrawnFeature("line", feature("LineString", coords)).valid).toBe(true);
  });

  it("rejects a line with fewer than 2 vertices", () => {
    expect(validateDrawnFeature("line", feature("LineString", [[77.0, 27.0]])).valid).toBe(false);
  });

  it("rejects a line exceeding the vertex ceiling", () => {
    const coords = Array.from({ length: 501 }, (_, i) => [i * 0.001, i * 0.001]);
    expect(validateDrawnFeature("line", feature("LineString", coords)).valid).toBe(false);
  });
});

describe("validateDrawnFeature — polygon", () => {
  const closedSquare = [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]];

  it("accepts a well-formed closed polygon", () => {
    expect(validateDrawnFeature("polygon", feature("Polygon", closedSquare)).valid).toBe(true);
  });

  it("rejects a degenerate 1-point 'polygon'", () => {
    expect(validateDrawnFeature("polygon", feature("Polygon", [[[0, 0]]])).valid).toBe(false);
  });

  it("rejects an unclosed ring", () => {
    const unclosed = [[[0, 0], [0, 1], [1, 1], [1, 0]]];
    expect(validateDrawnFeature("polygon", feature("Polygon", unclosed)).valid).toBe(false);
  });

  it("rejects a polygon with a hole (more than one ring)", () => {
    const withHole = [
      [[0, 0], [0, 4], [4, 4], [4, 0], [0, 0]],
      [[1, 1], [1, 2], [2, 2], [2, 1], [1, 1]],
    ];
    expect(validateDrawnFeature("polygon", feature("Polygon", withHole)).valid).toBe(false);
  });

  it("rejects a ring below the minimum vertex count", () => {
    const triangleNotClosed = [[[0, 0], [1, 1], [0, 0]]];
    expect(validateDrawnFeature("polygon", feature("Polygon", triangleNotClosed)).valid).toBe(false);
  });
});

describe("validateDrawnFeature — circle (stored as Polygon)", () => {
  function circleRing(vertices: number) {
    const ring = Array.from({ length: vertices }, (_, i) => {
      const angle = (i / vertices) * 2 * Math.PI;
      return [Math.cos(angle), Math.sin(angle)];
    });
    ring.push(ring[0]);
    return [ring];
  }

  it("accepts a circle-shaped polygon within the circle vertex bounds", () => {
    expect(validateDrawnFeature("circle", feature("Polygon", circleRing(32))).valid).toBe(true);
  });

  it("rejects a circle ring below the circle minimum (8)", () => {
    expect(validateDrawnFeature("circle", feature("Polygon", circleRing(4))).valid).toBe(false);
  });

  it("tags as circle while the geometry itself stays Polygon", () => {
    expect(annotationTypeForTool("circle")).toBe("circle");
    const geometry = toAnnotationGeometry("circle", feature("Polygon", circleRing(16)));
    expect(geometry.type).toBe("Polygon");
  });
});

describe("toAnnotationGeometry", () => {
  it("strips extraneous Feature properties, returning a clean geometry-only object", () => {
    const raw = { type: "Feature", geometry: { type: "Point", coordinates: [1, 2] }, properties: { mode: "point", id: "abc" } };
    expect(toAnnotationGeometry("point", raw)).toEqual({ type: "Point", coordinates: [1, 2] });
  });
});

describe("locationSummary", () => {
  it("returns the point itself for a Point geometry", () => {
    expect(locationSummary({ type: "Point", coordinates: [10, 20] })).toEqual([10, 20]);
  });

  it("returns the first vertex for a LineString", () => {
    expect(locationSummary({ type: "LineString", coordinates: [[5, 5], [10, 10]] })).toEqual([5, 5]);
  });

  it("returns the planar mean centroid for a simple square polygon", () => {
    const square: Polygon = { type: "Polygon", coordinates: [[[0, 0], [0, 2], [2, 2], [2, 0], [0, 0]]] };
    expect(locationSummary(square)).toEqual([1, 1]);
  });
});
