import { describe, expect, it } from "vitest";
import { formatArea, formatDistance, measureArea, measureDistance } from "@/gis/measurement";

describe("measureDistance", () => {
  it("matches the well-documented ~111.19km-per-degree-of-latitude reference figure", () => {
    // One degree of latitude is a standard, independently-documented geographic
    // constant (~111.19-111.32km depending on model) — not a value derived from
    // Turf itself, per docs/ACCEPTANCE_CRITERIA.md §Measurements.
    const oneDegreeOfLatitude = { type: "LineString" as const, coordinates: [[0, 0], [0, 1]] as [number, number][] };
    const result = measureDistance(oneDegreeOfLatitude);
    expect(result.kilometers).toBeGreaterThan(110);
    expect(result.kilometers).toBeLessThan(112);
    expect(result.meters).toBeCloseTo(result.kilometers * 1000, 3);
  });

  it("sums path length across multiple segments, not straight-line start-to-end distance", () => {
    // An out-and-back path returns to its start (zero straight-line distance)
    // but has a real, nonzero path length.
    const outAndBack = { type: "LineString" as const, coordinates: [[0, 0], [0, 1], [0, 0]] as [number, number][] };
    const result = measureDistance(outAndBack);
    expect(result.kilometers).toBeGreaterThan(220);
  });
});

describe("measureArea", () => {
  it("matches an independently-computed planar approximation for a small square near the equator", () => {
    // At the equator, curvature effects on a 0.01deg square are negligible, so a
    // planar approximation (side length in meters = degrees * meters-per-degree)
    // is a legitimate independent cross-check, not just Turf checking itself.
    const metersPerDegreeAtEquator = 111_195; // matches the length fixture above
    const side = 0.01;
    const square = {
      type: "Polygon" as const,
      coordinates: [[[0, 0], [0, side], [side, side], [side, 0], [0, 0]]] as [number, number][][],
    };
    const result = measureArea(square);
    const expectedSquareMeters = (side * metersPerDegreeAtEquator) ** 2;
    expect(result.squareMeters).toBeGreaterThan(expectedSquareMeters * 0.95);
    expect(result.squareMeters).toBeLessThan(expectedSquareMeters * 1.05);
    expect(result.hectares).toBeCloseTo(result.squareMeters / 10_000, 5);
  });
});

describe("formatDistance", () => {
  it("shows meters below 1km", () => {
    expect(formatDistance({ meters: 42, kilometers: 0.042 })).toBe("42 m");
  });

  it("shows kilometers at or above 1km", () => {
    expect(formatDistance({ meters: 1500, kilometers: 1.5 })).toBe("1.5 km");
  });
});

describe("formatArea", () => {
  it("shows both square meters and hectares", () => {
    expect(formatArea({ squareMeters: 12345, hectares: 1.2345 })).toBe("12,345 m² / 1.23 ha");
  });
});
