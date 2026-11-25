"use client";

import { useResource } from "@/features/collaborations/hooks/use-resource";
import {
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/shared/components/ui";
import { getMyContributions } from "../api";

export function MyContributionsList() {
  const { data, error, isLoading, reload } = useResource(getMyContributions);

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

  if (!data || data.data.length === 0) {
    return (
      <EmptyState
        title="Todavía no hiciste aportes"
        description="Cuando aportes a un proyecto, vas a ver el detalle acá."
      />
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {data.data.map((contribution) => (
        <li key={contribution.id}>
          <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900">
                Proyecto {contribution.projectId}
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
      ))}
    </ul>
  );
}
