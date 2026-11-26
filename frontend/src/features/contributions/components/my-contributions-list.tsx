"use client";

import Link from "next/link";
import { getProject } from "@/features/projects/api";
import {
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/shared/components/ui";
import { useResource } from "@/shared/hooks/use-resource";
import { getMyContributions } from "../api";

// The contributions API only knows the project id. The name comes from Projects:
// one lookup per distinct project, and a project that is hidden or gone just has no name
async function loadMine() {
  const list = await getMyContributions();
  const ids = [...new Set(list.data.map((contribution) => contribution.projectId))];
  const entries = await Promise.all(
    ids.map((id) =>
      getProject(id).then(
        (project) => [id, project.title] as const,
        () => [id, null] as const,
      ),
    ),
  );

  return { list, titles: new Map<string, string | null>(entries) };
}

export function MyContributionsList() {
  const { data, error, isLoading, reload } = useResource(loadMine);

  if (isLoading) {
    return <LoadingState label="Cargando tus aportes..." />;
  }

  if (error) {
    return (
      <ErrorState
        title="No pudimos cargar tus aportes"
        message={error}
        onRetry={reload}
      />
    );
  }

  if (!data || data.list.data.length === 0) {
    return (
      <EmptyState
        title="Todavía no hiciste aportes"
        description="Cuando aportes a un proyecto, vas a ver el detalle acá."
      />
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {data.list.data.map((contribution) => {
        const title = data.titles.get(contribution.projectId);

        return (
          <li key={contribution.id}>
            <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">
                  {title ? (
                    <Link
                      href={`/projects/${contribution.projectId}`}
                      className="hover:text-brand-700 hover:underline"
                    >
                      {title}
                    </Link>
                  ) : (
                    "Proyecto no disponible"
                  )}
                </p>
                <p className="text-xs text-slate-500">
                  {new Date(contribution.createdAt).toLocaleDateString("es-AR")}
                  {" · "}
                  {contribution.status === "simulated"
                    ? "Simulado"
                    : contribution.status}
                </p>
              </div>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:text-right">
                <dt className="text-slate-600">Aporte</dt>
                <dd className="font-medium text-slate-900">
                  {contribution.amount}
                </dd>
                <dt className="text-slate-600">Cargo</dt>
                <dd className="text-slate-700">{contribution.processingFee}</dd>
              </dl>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
