"use client";

import { useCallback } from "react";
import { useSession } from "@/features/auth/hooks/use-session";
import { ErrorState, LoadingState } from "@/shared/components/ui";
import { useResource } from "@/shared/hooks/use-resource";
import { getMyProjects } from "../api";
import { getProjectErrorMessage } from "../errors";
import { ProjectForm } from "./project-form";

// Looks the project up in /me/projects: it is the owner's own list, hidden ones included,
// so a project that is not yours simply is not there
export function EditProject({ projectId }: { projectId: string }) {
  const { session } = useSession();
  const load = useCallback(async () => {
    const mine = await getMyProjects(1, 100);
    return mine.data.find((project) => project.id === projectId) ?? null;
  }, [projectId]);
  const { data, error, isLoading, reload } = useResource(
    load,
    getProjectErrorMessage,
  );

  if (isLoading) {
    return <LoadingState label="Cargando proyecto..." />;
  }

  if (error) {
    return (
      <ErrorState
        title="No pudimos cargar el proyecto"
        message={error}
        onRetry={reload}
      />
    );
  }

  if (!data || data.ownerId !== session?.user.id) {
    return (
      <ErrorState
        title="No podés editar este proyecto"
        message="Solo su dueño puede editarlo."
      />
    );
  }

  return <ProjectForm project={data} />;
}
