import type { PaginatedResponse } from "@/shared/types";
import type {
  Collaboration,
  CollaborationInput,
  CollaborationStatus,
  CollaborationWithCollaborator,
  CollaborationWithProject,
} from "./types";

// Components never call fetch directly: everything goes through this file.
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const STATUS_MESSAGES: Record<number, string> = {
  0: "No pudimos conectarnos con el servidor. Revisá que la API esté en línea.",
  400: "Revisá los datos ingresados.",
  401: "Iniciá sesión para continuar.",
  403: "No tenés permiso para hacer esto.",
  404: "No encontramos lo que buscás.",
  409: "Esta acción no es válida para el estado actual.",
};

const FALLBACK_MESSAGE = "Ocurrió un error inesperado. Probá de nuevo.";

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return STATUS_MESSAGES[error.status] ?? FALLBACK_MESSAGE;
  }
  return FALLBACK_MESSAGE;
}

async function request<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      // The session lives in an httpOnly cookie, so the browser must send it.
      credentials: "include",
      headers:
        body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, STATUS_MESSAGES[0]);
  }

  // DELETE answers 204 with no body: there is no JSON to read.
  if (response.status === 204) {
    return undefined as T;
  }

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const serverMessage = (payload as { message?: string | string[] } | null)
      ?.message;
    throw new ApiError(
      response.status,
      Array.isArray(serverMessage)
        ? serverMessage.join(", ")
        : (serverMessage ?? ""),
    );
  }

  return payload as T;
}

function pageQuery(page: number, limit: number): string {
  return `?page=${page}&limit=${limit}`;
}

export function createCollaboration(
  projectId: string,
  input: CollaborationInput,
) {
  return request<Collaboration>(
    `/projects/${projectId}/collaborations`,
    "POST",
    input,
  );
}

export function getMyCollaborations(page = 1, limit = 20) {
  return request<PaginatedResponse<CollaborationWithProject>>(
    `/me/collaborations${pageQuery(page, limit)}`,
  );
}

export function getProjectCollaborations(
  projectId: string,
  page = 1,
  limit = 20,
) {
  return request<PaginatedResponse<CollaborationWithCollaborator>>(
    `/projects/${projectId}/collaborations${pageQuery(page, limit)}`,
  );
}

export function updateCollaborationStatus(
  id: string,
  status: CollaborationStatus,
) {
  return request<CollaborationWithCollaborator>(
    `/collaborations/${id}/status`,
    "PATCH",
    { status },
  );
}

export function withdrawCollaboration(id: string) {
  return request<void>(`/collaborations/${id}`, "DELETE");
}