import type { BadgeVariant } from "@/shared/components/ui";
import type { PaginatedResponse } from "@/shared/types";

// Enum values stay in English: they are the API contract. Spanish only in the labels.
export const PROJECT_KINDS = ["app", "game", "tool"] as const;
export type ProjectKind = (typeof PROJECT_KINDS)[number];

export const PROJECT_STATUSES = ["active", "completed", "hidden"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

// The owner can only move between these two: "hidden" is set by an admin
export const OWNER_STATUSES = ["active", "completed"] as const;
export type OwnerStatus = (typeof OWNER_STATUSES)[number];

export const PROJECT_KIND_LABELS: Record<ProjectKind, string> = {
  app: "Aplicación",
  game: "Juego",
  tool: "Herramienta",
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  active: "Activo",
  completed: "Terminado",
  hidden: "Oculto por moderación",
};

export const PROJECT_STATUS_BADGES: Record<ProjectStatus, BadgeVariant> = {
  active: "success",
  completed: "brand",
  hidden: "danger",
};

// The owner travels with public fields only: never the email
export interface ProjectOwner {
  id: string;
  name: string;
}

// Shape of every project the API returns (goalAmount already comes as a number)
export interface Project {
  id: string;
  title: string;
  description: string;
  repoUrl: string;
  kind: ProjectKind;
  goalAmount: number;
  status: ProjectStatus;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  owner: ProjectOwner;
}

export type ProjectList = PaginatedResponse<Project>;

// POST /projects. ownerId is never sent: the API takes it from the session
export interface ProjectInput {
  title: string;
  description: string;
  repoUrl: string;
  kind: ProjectKind;
  goalAmount: number;
}

// PATCH /projects/:id
export type ProjectUpdateInput = Partial<ProjectInput> & {
  status?: OwnerStatus;
};

// Query params of GET /projects (and of the explorer URL)
export interface ProjectFilters {
  kind?: ProjectKind;
  status?: OwnerStatus;
  q?: string;
  // The public projects of one person (their profile); hidden ones never show up
  ownerId?: string;
  page?: number;
  limit?: number;
}

// GET /admin/projects can also ask for hidden ones
export interface AdminProjectFilters extends Omit<ProjectFilters, "status"> {
  status?: ProjectStatus;
}
