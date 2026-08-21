import type { ProjectMapState } from "./maps/types";

/** Mirrors the Project schema in docs/DATA_MODEL.md. */
export interface Project {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  map: ProjectMapState;
  layers: string[];
  overlays: string[];
  annotations: string[];
  savedViews: string[];
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}

export interface NewProjectInput {
  ownerId: string;
  name: string;
  description?: string;
  map: ProjectMapState;
}

export interface UseProjectsResult {
  projects: Project[];
  loading: boolean;
  createProject: (input: NewProjectInput) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
}

export interface UseProjectResult {
  project: Project | null;
  loading: boolean;
}
