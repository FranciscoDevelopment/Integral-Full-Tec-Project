
"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import {
  Button,
  EmptyState,
  type ButtonVariant,
} from "@/shared/components/ui";
import { ErrorState } from "./error-state";
import { LoadingState } from "./loading-state";
import {
  getErrorMessage,
  getProjectCollaborations,
  updateCollaborationStatus,
} from "../api";
import { useResource } from "../hooks/use-resource";
import { STATUS_LABELS, type CollaborationStatus } from "../types";
import { formatPeriod } from "../utils";
import { CollaborationStatusBadge } from "./collaboration-status-badge";

interface NextAction {
  status: CollaborationStatus;
  label: string;
  variant: ButtonVariant;
}

// Buttons follow the state machine: pending -> accepted | rejected, accepted -> confirmed.
const NEXT_ACTIONS: Record<CollaborationStatus, NextAction[]> = {
  pending: [
    { status: "accepted", label: "Aceptar", variant: "primary" },
    { status: "rejected", label: "Rechazar", variant: "danger" },
  ],
  accepted: [
    { status: "confirmed", label: "Confirmar colaboración", variant: "primary" },
  ],
  confirmed: [],
  rejected: [],
};

export function ReceivedRequestsList({ projectId }: { projectId: string }) {
  const load = useCallback(
    () => getProjectCollaborations(projectId),
    [projectId],
  );
  const { data, error, isLoading, reload } = useResource(load);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleChange(id: string, status: CollaborationStatus) {
    setBusyId(id);
    try {
      await updateCollaborationStatus(id, status);
      toast.success(`Solicitud ${STATUS_LABELS[status].toLowerCase()}.`);
      reload();
    } catch (changeError) {
      toast.error(getErrorMessage(changeError));
    } finally {
      setBusyId(null);
    }
  }

  if (isLoading) {
    return <LoadingState label="Cargando solicitudes..." />;
  }

  if (error) {
    return (
      <ErrorState
        title="No pudimos cargar las solicitudes"
        message={error}
        onRetry={reload}
      />
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <EmptyState
        title="Este proyecto todavía no recibió solicitudes"
        description="Cuando alguien se ofrezca a ayudar, vas a poder aceptarlo o rechazarlo desde acá."
      />
    );
  }

  return (
    <ul
      aria-label="Solicitudes recibidas para este proyecto"
      className="flex flex-col gap-3"
    >
      {data.data.map((collaboration) => (
        <li key={collaboration.id}>
          <article
            aria-labelledby={`received-request-${collaboration.id}`}
            className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4"
          >
            <header className="flex items-start justify-between gap-3">
              <h2
                id={`received-request-${collaboration.id}`}
                className="font-semibold text-slate-900"
              >
                {collaboration.collaborator.name}
              </h2>
              <CollaborationStatusBadge status={collaboration.status} />
            </header>
            <p className="text-sm text-slate-800">
              <span className="font-medium">{collaboration.role}</span>:{" "}
              {collaboration.description}
            </p>
            <p className="text-sm text-slate-500">
              {formatPeriod(collaboration.startDate, collaboration.endDate)}
            </p>
            {NEXT_ACTIONS[collaboration.status].length > 0 && (
              <footer className="flex flex-wrap gap-2">
                {NEXT_ACTIONS[collaboration.status].map((action) => (
                  <Button
                    key={action.status}
                    size="sm"
                    variant={action.variant}
                    disabled={busyId === collaboration.id}
                    aria-label={`${action.label} de ${collaboration.collaborator.name}`}
                    onClick={() => handleChange(collaboration.id, action.status)}
                  >
                    {action.label}
                  </Button>
                ))}
              </footer>
            )}
          </article>
        </li>
      ))}
    </ul>
  );
}
