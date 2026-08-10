import type { Project } from "./types";

/**
 * Track A placeholder data only — see docs/plans/plan-1.md Track B.
 * Replaced by ProjectsProvider (real Firestore onSnapshot) once a Firebase
 * project exists. Delete this file when that lands.
 */
export const mockProjects: Project[] = [
  {
    id: "mock-1",
    ownerId: "mock-owner",
    name: "Agra Ring Road Investigation",
    description: "Proposed road impact on nearby plots",
    map: { center: [78.0081, 27.1767], zoom: 12, bearing: 0, pitch: 0 },
    layers: [],
    overlays: [],
    annotations: [],
    savedViews: [],
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-09T00:00:00.000Z",
    archivedAt: null,
  },
];
