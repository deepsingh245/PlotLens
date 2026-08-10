import { describe, expect, it } from "vitest";
import { fromGeoJsonPosition, toGeoJsonPosition } from "@/gis/coordinates";

describe("toGeoJsonPosition", () => {
  it("orders the result as [lng, lat], not [lat, lng]", () => {
    // Bengaluru: 12.9716°N, 77.5946°E — lat and lng are far enough apart
    // that a swapped-order bug would be immediately obvious, not accidentally correct.
    const result = toGeoJsonPosition({ lat: 12.9716, lng: 77.5946 });
    expect(result).toEqual([77.5946, 12.9716]);
    expect(result).not.toEqual([12.9716, 77.5946]);
  });
});

describe("fromGeoJsonPosition", () => {
  it("reads a [lng, lat] tuple back into a named {lng, lat} object", () => {
    expect(fromGeoJsonPosition([77.5946, 12.9716])).toEqual({
      lng: 77.5946,
      lat: 12.9716,
    });
  });
});

describe("round-trip", () => {
  it("recovers the original point through both conversions", () => {
    const original = { lat: -33.8688, lng: 151.2093 };
    expect(fromGeoJsonPosition(toGeoJsonPosition(original))).toEqual(original);
  });
});
