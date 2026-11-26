"use client";

import Link from "next/link";
import {
  buttonStyles,
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/shared/components/ui";
import { useResource } from "@/shared/hooks/use-resource";
import { getProjects } from "../api";
import { getProjectErrorMessage } from "../errors";
import { ProjectGrid } from "./project-card";

// Module level on purpose: useResource loads again whenever `load` changes identity.
// "Featured" here means the 3 newest active ones: the API has no popularity criterion
const loadFeatured = () => getProjects({ status: "active", limit: 3 });

export function FeaturedProjects() {
  const { data, error, isLoading, reload } = useResource(
    loadFeatured,
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
    return (
      <EmptyState
        title="Todavía no hay proyectos activos"
        description="Proponé el primero."
        action={
          <Link href="/projects/new" className={buttonStyles()}>
            Proponer proyecto
          </Link>
        }
      />
    );
  }

  return <ProjectGrid label="Proyectos destacados" projects={data.data} />;
}
