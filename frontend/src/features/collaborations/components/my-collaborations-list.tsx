
"use client";

import { toast } from "sonner";
import { Button, EmptyState } from "@/shared/components/ui";
import { ErrorState } from "./error-state";
import { LoadingState } from "./loading-state";
import {
  getErrorMessage,
  getMyCollaborations,
  withdrawCollaboration,
} from "../api";
import { useResource } from "../hooks/use-resource";
import { PROJECT_KIND_LABELS } from "../types";
import { formatPeriod } from "../utils";
import { CollaborationStatusBadge } from "./collaboration-status-badge";

export function MyCollaborationsList() {
  const { data, error, isLoading, reload } = useResource(getMyCollaborations);

  async function handleWithdraw(id: string) {
    try {
      await withdrawCollaboration(id);
      toast.success("Solicitud retirada.");
      reload();
    } catch (withdrawError) {
      toast.error(getErrorMessage(withdrawError));
    }
  }

  if (isLoading) {
    return <LoadingState label="Cargando tus colaboraciones..." />;
  }

  if (error) {
    return (
      <ErrorState
        title="No pudimos cargar tus colaboraciones"
        message={error}
        onRetry={reload}
      />
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <EmptyState
        title="Todavía no te ofreciste a ayudar"
        description="Cuando pidas sumarte a un proyecto, vas a ver acá el estado de tu solicitud."
      />
    );
  }

  return (
    <ul
      aria-label="Mis solicitudes de colaboración"
      className="flex flex-col gap-3"
    >
      {data.data.map((collaboration) => (
        <li key={collaboration.id}>
          <article
            aria-labelledby={`my-collaboration-${collaboration.id}`}
            className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4"
          >
            <header className="flex items-start justify-between gap-3">
              <hgroup>
                <h2
                  id={`my-collaboration-${collaboration.id}`}
                  className="font-semibold text-slate-900"
                >
                  {collaboration.project.title}
                </h2>
                <p className="text-sm text-slate-600">
                  {PROJECT_KIND_LABELS[collaboration.project.kind]}
                </p>
              </hgroup>
              <CollaborationStatusBadge status={collaboration.status} />
            </header>
            <p className="text-sm text-slate-800">
              <span className="font-medium">{collaboration.role}</span>:{" "}
              {collaboration.description}
            </p>
            <p className="text-sm text-slate-500">
              {formatPeriod(collaboration.startDate, collaboration.endDate)}
            </p>
            {collaboration.status === "pending" && (
              <footer>
                <Button
                  variant="outline"
                  size="sm"
                  aria-label={`Retirar la solicitud para ${collaboration.project.title}`}
                  onClick={() => handleWithdraw(collaboration.id)}
                >
                  Retirar solicitud
                </Button>
              </footer>
            )}
          </article>
        </li>
      ))}
    </ul>
  );
}
