"use client";

import { toast } from "sonner";
import { Button, Card, EmptyState } from "@/shared/components/ui";
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
    return (
      <p aria-live="polite" className="py-8 text-center text-sm text-slate-600">
        Cargando tus colaboraciones...
      </p>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="No pudimos cargar tus colaboraciones"
        description={error}
        action={
          <Button variant="outline" onClick={reload}>
            Reintentar
          </Button>
        }
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
    <ul className="flex flex-col gap-3">
      {data.data.map((collaboration) => (
        <li key={collaboration.id}>
          <Card className="flex flex-col gap-2 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">
                  {collaboration.project.title}
                </p>
                <p className="text-sm text-slate-600">
                  {PROJECT_KIND_LABELS[collaboration.project.kind]}
                </p>
              </div>
              <CollaborationStatusBadge status={collaboration.status} />
            </div>
            <p className="text-sm text-slate-800">
              <span className="font-medium">{collaboration.role}</span>:{" "}
              {collaboration.description}
            </p>
            <p className="text-sm text-slate-500">
              {formatPeriod(collaboration.startDate, collaboration.endDate)}
            </p>
            {collaboration.status === "pending" && (
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleWithdraw(collaboration.id)}
                >
                  Retirar solicitud
                </Button>
              </div>
            )}
          </Card>
        </li>
      ))}
    </ul>
  );
}