import type { BadgeVariant } from "@/shared/components/ui";

export const COLLABORATION_STATUSES = [
  "pending",
  "accepted",
  "confirmed",
  "rejected",
] as const;
export type CollaborationStatus = (typeof COLLABORATION_STATUSES)[number];

// Spanish labels for the UI. Enum values stay in English: they are the API contract.
export const STATUS_LABELS: Record<CollaborationStatus, string> = {
  pending: "Pendiente",
  accepted: "Aceptada",
  confirmed: "Confirmada",
  rejected: "Rechazada",
};

export const STATUS_BADGE_VARIANTS: Record<CollaborationStatus, BadgeVariant> =
  {
    pending: "warning",
    accepted: "brand",
    confirmed: "success",
    rejected: "danger",
  };

export type ProjectKind = "app" | "game" | "tool";

export const PROJECT_KIND_LABELS: Record<ProjectKind, string> = {
  app: "Aplicación",
  game: "Juego",
  tool: "Herramienta",
};

export interface Collaboration {
  id: string;
  projectId: string;
  collaboratorId: string;
  role: string;
  description: string;
  startDate: string;
  endDate: string | null;
  status: CollaborationStatus;
  repoLinks: string[];
  createdAt: string;
  updatedAt: string;
}

// GET /me/collaborations and GET /users/:id/collaborations/confirmed
export interface CollaborationWithProject extends Collaboration {
  project: { id: string; title: string; kind: ProjectKind };
}

// GET /projects/:id/collaborations (owner only). The email is never included.
export interface CollaborationWithCollaborator extends Collaboration {
  collaborator: { id: string; name: string };
}

export interface CollaborationInput {
  role: string;
  description: string;
  startDate: string;
  endDate?: string;
}