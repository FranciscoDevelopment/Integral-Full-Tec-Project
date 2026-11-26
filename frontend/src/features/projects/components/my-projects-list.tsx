"use client";

import Link from "next/link";
import {
  buttonStyles,
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/shared/components/ui";
import { useResource } from "@/shared/hooks/use-resource";
import { getMyProjects } from "../api";
import { getProjectErrorMessage } from "../errors";
import { DeleteProjectButton } from "./delete-project-button";
import { ProjectGrid } from "./project-card";

// GET /me/projects: the owner sees all of their projects, hidden ones included
export function MyProjectsList() {
  const { data, error, isLoading, reload } = useResource(
    getMyProjects,
    getProjectErrorMessage,
  );

  if (isLoading) {
    return <LoadingState label="Cargando tus proyectos..." />;
  }

  if (error) {
    return (
      <ErrorState
        title="No pudimos cargar tus proyectos"
        message={error}
        onRetry={reload}
      />
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <EmptyState
        title="Todavía no publicaste proyectos"
        description="Contá qué estás construyendo y sumá gente que te ayude."
        action={
          <Link href="/projects/new" className={buttonStyles()}>
            Proponer proyecto
          </Link>
        }
      />
    );
  }

  return (
    <ProjectGrid
      label="Mis proyectos"
      projects={data.data}
      renderActions={(project) => (
        <>
          <Link
            href={`/projects/${project.id}/edit`}
            className={buttonStyles({ variant: "outline", size: "sm" })}
            aria-label={`Editar ${project.title}`}
          >
            Editar
          </Link>
          <DeleteProjectButton
            projectId={project.id}
            projectTitle={project.title}
            onDeleted={reload}
          />
        </>
      )}
    />
  );
}
