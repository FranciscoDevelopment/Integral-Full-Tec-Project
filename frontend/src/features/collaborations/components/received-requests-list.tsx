"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import {
  Button,
  Card,
  EmptyState,
  type ButtonVariant,
} from "@/shared/components/ui";
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
    return (
      <p aria-live="polite" className="py-8 text-center text-sm text-slate-600">
        Cargando solicitudes...
      </p>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="No pudimos cargar las solicitudes"
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
        title="Este proyecto todavía no recibió solicitudes"
        description="Cuando alguien se ofrezca a ayudar, vas a poder aceptarlo o rechazarlo desde acá."
      />
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {data.data.map((collaboration) => (
        <li key={collaboration.id}>
          <Card className="flex flex-col gap-2 p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="font-semibold text-slate-900">
                {collaboration.collaborator.name}
              </p>
              <CollaborationStatusBadge status={collaboration.status} />
            </div>
            <p className="text-sm text-slate-800">
              <span className="font-medium">{collaboration.role}</span>:{" "}
              {collaboration.description}
            </p>
            <p className="text-sm text-slate-500">
              {formatPeriod(collaboration.startDate, collaboration.endDate)}
            </p>
            {NEXT_ACTIONS[collaboration.status].length > 0 && (
              <div className="flex flex-wrap gap-2">
                {NEXT_ACTIONS[collaboration.status].map((action) => (
                  <Button
                    key={action.status}
                    size="sm"
                    variant={action.variant}
                    disabled={busyId === collaboration.id}
                    onClick={() => handleChange(collaboration.id, action.status)}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </Card>
        </li>
      ))}
    </ul>
  );
}