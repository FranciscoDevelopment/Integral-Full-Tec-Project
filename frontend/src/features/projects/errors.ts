import { ApiError, getErrorMessage } from "@/shared/lib/api-client";

// Same messages as the shared client, but with the project's own words for 403, 404 and 409
export function getProjectErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 403) {
      return "Solo el dueño del proyecto puede hacer esto.";
    }
    if (error.status === 404) {
      return "Este proyecto no existe o fue ocultado.";
    }
    if (error.status === 409) {
      return "El proyecto ya recibió aportes y no se puede eliminar. Podés marcarlo como terminado.";
    }
  }

  return getErrorMessage(error);
}
