"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui";
import { deleteProject } from "../api";
import { getProjectErrorMessage } from "../errors";

interface DeleteProjectButtonProps {
  projectId: string;
  projectTitle: string;
  onDeleted: () => void;
}

// Two steps instead of a browser confirm(): the second click is the one that deletes
export function DeleteProjectButton({
  projectId,
  projectTitle,
  onDeleted,
}: DeleteProjectButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteProject(projectId);
      toast.success("Proyecto eliminado.");
      onDeleted();
    } catch (error) {
      toast.error(getProjectErrorMessage(error));
      setIsDeleting(false);
      setIsConfirming(false);
    }
  }

  if (!isConfirming) {
    return (
      <Button
        variant="outline"
        size="sm"
        aria-label={`Eliminar ${projectTitle}`}
        onClick={() => setIsConfirming(true)}
      >
        Eliminar
      </Button>
    );
  }

  return (
    <span role="group" aria-label="Confirmar eliminación" className="flex gap-2">
      <Button
        variant="danger"
        size="sm"
        disabled={isDeleting}
        onClick={handleDelete}
      >
        {isDeleting ? "Eliminando..." : "Sí, eliminar"}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        disabled={isDeleting}
        onClick={() => setIsConfirming(false)}
      >
        Cancelar
      </Button>
    </span>
  );
}
