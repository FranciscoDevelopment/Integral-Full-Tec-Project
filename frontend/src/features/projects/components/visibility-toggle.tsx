"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui";
import { setProjectVisibility } from "../api";
import { getProjectErrorMessage } from "../errors";
import type { Project } from "../types";

interface VisibilityToggleProps {
  project: Project;
  onChanged: () => void;
}

// Admin only. The button is a convenience: the API answers 403 to anyone else anyway
export function VisibilityToggle({ project, onChanged }: VisibilityToggleProps) {
  const [isSaving, setIsSaving] = useState(false);
  const isHidden = project.status === "hidden";

  async function handleClick() {
    setIsSaving(true);
    try {
      await setProjectVisibility(project.id, !isHidden);
      toast.success(isHidden ? "El proyecto volvió a ser visible." : "Proyecto ocultado.");
      onChanged();
    } catch (error) {
      toast.error(getProjectErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Button
      variant={isHidden ? "secondary" : "danger"}
      size="sm"
      disabled={isSaving}
      aria-label={`${isHidden ? "Mostrar" : "Ocultar"} ${project.title}`}
      onClick={handleClick}
    >
      {isSaving ? "Guardando..." : isHidden ? "Mostrar" : "Ocultar"}
    </Button>
  );
}
