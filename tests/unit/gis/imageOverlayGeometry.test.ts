import { describe, expect, it } from "vitest";
import {
  centroidOf,
  rotateCorners,
  scaleCorners,
  validateOverlayCorners,
  type OverlayCorners,
} from "@/gis/imageOverlayGeometry";

const SQUARE: OverlayCorners = [
  [0, 2], // top-left
  [2, 2], // top-right
  [2, 0], // bottom-right
  [0, 0], // bottom-left
];

function expectCornersClose(a: OverlayCorners, b: OverlayCorners, epsilon = 1e-9) {
  for (let i = 0; i < 4; i++) {
    expect(a[i][0]).toBeCloseTo(b[i][0], 9);
    expect(a[i][1]).toBeCloseTo(b[i][1], 9);
  }
  void epsilon; // kept for signature clarity; toBeCloseTo drives the actual tolerance
}

describe("centroidOf", () => {
  it("returns the arithmetic mean of a known square", () => {
    expect(centroidOf(SQUARE)).toEqual([1, 1]);
  });
});

describe("rotateCorners", () => {
  it("returns to the original corners after a full 360° rotation", () => {
    expectCornersClose(rotateCorners(SQUARE, 360), SQUARE);
  });

  it("composes back to the original after four 90° rotations", () => {
    let corners = SQUARE;
    for (let i = 0; i < 4; i++) corners = rotateCorners(corners, 90);
    expectCornersClose(corners, SQUARE);
  });

  it("preserves the centroid", () => {
    const rotated = rotateCorners(SQUARE, 37);
    const [cx, cy] = centroidOf(rotated);
    expect(cx).toBeCloseTo(1, 9);
    expect(cy).toBeCloseTo(1, 9);
  });
});

describe("scaleCorners", () => {
  it("is an exact no-op at factor 1", () => {
    expect(scaleCorners(SQUARE, 1)).toBe(SQUARE); // same reference — no float drift at all
  });

  it("scales corners away from the centroid", () => {
    const scaled = scaleCorners(SQUARE, 2);
    expect(scaled).toEqual([
      [-1, 3],
      [3, 3],
      [3, -1],
      [-1, -1],
    ]);
  });
});

describe("validateOverlayCorners", () => {
  it("accepts a well-formed square", () => {
    expect(validateOverlayCorners(SQUARE)).toEqual({ valid: true });
  });

  it("rejects an array that isn't exactly 4 elements", () => {
    expect(validateOverlayCorners([[0, 0], [1, 1], [1, 0]]).valid).toBe(false);
    expect(validateOverlayCorners([...SQUARE, [5, 5]]).valid).toBe(false);
  });

  it("rejects a non-array", () => {
    expect(validateOverlayCorners(null).valid).toBe(false);
    expect(validateOverlayCorners("not corners").valid).toBe(false);
  });

  it("rejects an out-of-bounds coordinate", () => {
    const bad: OverlayCorners = [[0, 2], [200, 2], [2, 0], [0, 0]];
    expect(validateOverlayCorners(bad).valid).toBe(false);
  });

  it("rejects a non-finite coordinate", () => {
    const bad: OverlayCorners = [[0, 2], [NaN, 2], [2, 0], [0, 0]];
    expect(validateOverlayCorners(bad).valid).toBe(false);
  });

  it("rejects degenerate/collinear corners", () => {
    const collinear: OverlayCorners = [[0, 0], [1, 0], [2, 0], [3, 0]];
    expect(validateOverlayCorners(collinear).valid).toBe(false);
  });
});
