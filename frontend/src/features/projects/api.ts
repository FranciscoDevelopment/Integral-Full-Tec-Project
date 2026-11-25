import { apiDelete, apiGet, apiPatch, apiPost } from "@/shared/lib/api-client";
import type {
  AdminProjectFilters,
  Project,
  ProjectFilters,
  ProjectInput,
  ProjectList,
  ProjectUpdateInput,
} from "./types";

// Components never call fetch directly: every request of the ámbito goes through here.

const byId = (id: string) => `/projects/${encodeURIComponent(id)}`;

// Public
export function getProjects(filters: ProjectFilters = {}, signal?: AbortSignal) {
  return apiGet<ProjectList>("/projects", { ...filters }, signal);
}

export function getProject(id: string, signal?: AbortSignal) {
  return apiGet<Project>(byId(id), undefined, signal);
}

// Logged in
export function getMyProjects(page = 1, limit = 20) {
  return apiGet<ProjectList>("/me/projects", { page, limit });
}

export function createProject(input: ProjectInput) {
  return apiPost<Project>("/projects", input);
}

export function updateProject(id: string, input: ProjectUpdateInput) {
  return apiPatch<Project>(byId(id), input);
}

export function deleteProject(id: string) {
  return apiDelete(byId(id));
}

// Admin (moderation)
export function getAdminProjects(
  filters: AdminProjectFilters = {},
  signal?: AbortSignal,
) {
  return apiGet<ProjectList>("/admin/projects", { ...filters }, signal);
}

export function setProjectVisibility(id: string, hidden: boolean) {
  return apiPatch<Project>(`/admin${byId(id)}/visibility`, { hidden });
}
