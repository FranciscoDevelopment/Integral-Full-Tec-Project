"use client";

import { useCallback, useState } from "react";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  Select,
} from "@/shared/components/ui";
import { toOptions } from "@/shared/catalogs/to-options";
import { useResource } from "@/shared/hooks/use-resource";
import { getAdminProjects } from "../api";
import { getProjectErrorMessage } from "../errors";
import {
  PROJECT_STATUS_LABELS,
  PROJECT_STATUSES,
  type ProjectStatus,
} from "../types";
import { ProjectGrid } from "./project-card";
import { VisibilityToggle } from "./visibility-toggle";

const STATUS_OPTIONS = toOptions(PROJECT_STATUSES, PROJECT_STATUS_LABELS);

// Moderation queue: every project, hidden ones included (GET /admin/projects)
export function AdminProjectsList() {
  const [status, setStatus] = useState<ProjectStatus | "">("");
  const load = useCallback(
    () => getAdminProjects({ status: status || undefined, limit: 100 }),
    [status],
  );
  const { data, error, isLoading, reload } = useResource(
    load,
    getProjectErrorMessage,
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="max-w-xs">
        <Select
          label="Estado"
          placeholder="Todos"
          options={STATUS_OPTIONS}
          value={status}
          onChange={(event) => setStatus(event.target.value as ProjectStatus | "")}
        />
      </div>

      {isLoading ? (
        <LoadingState label="Cargando proyectos..." />
      ) : error ? (
        <ErrorState
          title="No pudimos cargar los proyectos"
          message={error}
          onRetry={reload}
        />
      ) : !data || data.data.length === 0 ? (
        <EmptyState title="No hay proyectos para moderar" />
      ) : (
        <ProjectGrid
          label="Proyectos para moderar"
          projects={data.data}
          renderActions={(project) => (
            <VisibilityToggle project={project} onChanged={reload} />
          )}
        />
      )}
    </div>
  );
}
