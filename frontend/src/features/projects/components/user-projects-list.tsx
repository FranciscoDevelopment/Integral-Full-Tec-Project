"use client";

import { useCallback } from "react";
import { EmptyState, ErrorState, LoadingState } from "@/shared/components/ui";
import { useResource } from "@/shared/hooks/use-resource";
import { getProjects } from "../api";
import { getProjectErrorMessage } from "../errors";
import { ProjectGrid } from "./project-card";

// The public projects of ANY person: for someone else's profile.
// Hidden projects never show up here (the public list leaves them out)
export function UserProjectsList({ userId }: { userId: string }) {
  const load = useCallback(
    () => getProjects({ ownerId: userId, limit: 6 }),
    [userId],
  );
  const { data, error, isLoading, reload } = useResource(
    load,
    getProjectErrorMessage,
  );

  if (isLoading) {
    return <LoadingState label="Cargando proyectos..." />;
  }

  if (error) {
    return (
      <ErrorState
        title="No pudimos cargar los proyectos"
        message={error}
        onRetry={reload}
      />
    );
  }

  if (!data || data.data.length === 0) {
    return <EmptyState title="Todavía no publicó proyectos" />;
  }

  return <ProjectGrid label="Proyectos de esta persona" projects={data.data} />;
}
