import type { Annotation } from "./types";

/**
 * Track A placeholder data only — see docs/plans/plan-2.md Track B.
 * Replaced by real Firestore persistence once a Firebase project exists.
 * Delete this file when that lands (same precedent as mockProjects.ts).
 */
export const mockAnnotations: Annotation[] = [
  {
    id: "mock-annotation-1",
    projectId: "mock-1",
    type: "point",
    geometry: { type: "Point", coordinates: [78.0081, 27.1767] },
    title: "Candidate site",
    description: "Near the proposed ring road alignment",
    tags: ["candidate"],
    attachments: [],
    createdAt: "2026-08-09T00:00:00.000Z",
    updatedAt: "2026-08-09T00:00:00.000Z",
  },
];
