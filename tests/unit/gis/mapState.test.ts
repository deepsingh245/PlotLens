import { describe, expect, it } from "vitest";
import {
  clamp,
  MAX_PITCH,
  MAX_ZOOM,
  MIN_PITCH,
  MIN_ZOOM,
  normalizeBearing,
  toProjectMapState,
} from "@/gis/mapState";
import type { Map as MapLibreMap } from "maplibre-gl";

function fakeMap(overrides: {
  center?: { lng: number; lat: number };
  zoom?: number;
  bearing?: number;
  pitch?: number;
}): MapLibreMap {
  const { center = { lng: 0, lat: 0 }, zoom = 5, bearing = 0, pitch = 0 } = overrides;
  return {
    getCenter: () => center,
    getZoom: () => zoom,
    getBearing: () => bearing,
    getPitch: () => pitch,
  } as unknown as MapLibreMap;
}

describe("clamp", () => {
  it("clamps below the minimum", () => {
    expect(clamp(-5, 0, 22)).toBe(0);
  });

  it("clamps above the maximum", () => {
    expect(clamp(30, 0, 22)).toBe(22);
  });

  it("leaves in-range values untouched", () => {
    expect(clamp(10, 0, 22)).toBe(10);
  });
});

describe("normalizeBearing", () => {
  it("wraps a negative bearing into [0, 360)", () => {
    expect(normalizeBearing(-90)).toBe(270);
  });

  it("wraps a bearing greater than 360 back into range", () => {
    expect(normalizeBearing(450)).toBe(90);
  });

  it("leaves an in-range bearing untouched", () => {
    expect(normalizeBearing(180)).toBe(180);
  });
});

describe("toProjectMapState", () => {
  it("converts center to [lng, lat] order and clamps zoom/pitch", () => {
    const map = fakeMap({
      center: { lng: 77.5946, lat: 12.9716 },
      zoom: MAX_ZOOM + 10,
      bearing: -10,
      pitch: MAX_PITCH + 10,
    });

    expect(toProjectMapState(map)).toEqual({
      center: [77.5946, 12.9716],
      zoom: MAX_ZOOM,
      bearing: 350,
      pitch: MAX_PITCH,
    });
  });

  it("clamps zoom/pitch at the minimum boundary too", () => {
    const map = fakeMap({ zoom: MIN_ZOOM - 5, pitch: MIN_PITCH - 5 });
    const state = toProjectMapState(map);
    expect(state.zoom).toBe(MIN_ZOOM);
    expect(state.pitch).toBe(MIN_PITCH);
  });
});
