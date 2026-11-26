"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button, Input, Select } from "@/shared/components/ui";
import {
  describedById,
  Field,
  FIELD_CONTROL_CLASSES,
  FIELD_ERROR_CLASSES,
} from "@/shared/components/ui/field";
import { toOptions } from "@/shared/catalogs/to-options";
import { cn } from "@/shared/lib/cn";
import { createProject, updateProject } from "../api";
import { getProjectErrorMessage } from "../errors";
import { projectFormSchema, type ProjectFormValues } from "../schema";
import {
  OWNER_STATUSES,
  PROJECT_KIND_LABELS,
  PROJECT_KINDS,
  PROJECT_STATUS_LABELS,
  type OwnerStatus,
  type Project,
} from "../types";

const KIND_OPTIONS = toOptions(PROJECT_KINDS, PROJECT_KIND_LABELS);

const STATUS_OPTIONS = toOptions(
  OWNER_STATUSES,
  PROJECT_STATUS_LABELS as Record<OwnerStatus, string>,
);

const DESCRIPTION_ID = "project-description";
const DESCRIPTION_HINT = "Qué es, para quién y en qué etapa está.";

interface ProjectFormProps {
  // Without a project the form creates one; with it, it edits that one
  project?: Project;
}

export function ProjectForm({ project }: ProjectFormProps) {
  const router = useRouter();
  const isEditing = project !== undefined;
  // A hidden project keeps its status: only an admin can show it again
  const canChangeStatus = isEditing && project.status !== "hidden";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: project
      ? {
          title: project.title,
          description: project.description,
          repoUrl: project.repoUrl,
          kind: project.kind,
          goalAmount: project.goalAmount,
          status: canChangeStatus
            ? (project.status as OwnerStatus)
            : undefined,
        }
      : { title: "", description: "", repoUrl: "", goalAmount: 0 },
  });

  async function onSubmit(values: ProjectFormValues) {
    const { status, ...input } = values;

    try {
      const saved = isEditing
        ? await updateProject(project.id, {
            ...input,
            ...(canChangeStatus ? { status } : {}),
          })
        : await createProject(input);

      toast.success(isEditing ? "Cambios guardados." : "¡Proyecto publicado!");
      router.push(`/projects/${saved.id}`);
    } catch (error) {
      toast.error(getProjectErrorMessage(error));
    }
  }

  return (
    <form
      aria-label={isEditing ? "Editar proyecto" : "Nuevo proyecto"}
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4"
    >
      <Input
        label="Título"
        placeholder="Ej: Juego de plataformas en Godot"
        error={errors.title?.message}
        {...register("title")}
      />

      <Field
        controlId={DESCRIPTION_ID}
        label="Descripción"
        hint={DESCRIPTION_HINT}
        error={errors.description?.message}
      >
        <textarea
          id={DESCRIPTION_ID}
          rows={5}
          aria-invalid={errors.description ? true : undefined}
          aria-describedby={describedById(DESCRIPTION_ID, {
            hint: DESCRIPTION_HINT,
            error: errors.description?.message,
          })}
          className={cn(
            FIELD_CONTROL_CLASSES,
            "h-auto min-h-32 py-2",
            errors.description && FIELD_ERROR_CLASSES,
          )}
          {...register("description")}
        />
      </Field>

      <Input
        type="url"
        label="Repositorio"
        placeholder="https://github.com/usuario/proyecto"
        hint="GitHub, GitLab, Bitbucket u otro."
        error={errors.repoUrl?.message}
        {...register("repoUrl")}
      />

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="sr-only">Tipo y meta</legend>
        <Select
          label="Tipo de proyecto"
          placeholder="Elegí un tipo"
          options={KIND_OPTIONS}
          error={errors.kind?.message}
          {...register("kind")}
        />
        <Input
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          label="Meta en pesos"
          hint="Puede ser 0 si no buscás aportes."
          error={errors.goalAmount?.message}
          {...register("goalAmount", { valueAsNumber: true })}
        />
      </fieldset>

      {canChangeStatus && (
        <Select
          label="Estado"
          options={STATUS_OPTIONS}
          hint="Marcalo como terminado cuando el proyecto esté listo."
          error={errors.status?.message}
          {...register("status")}
        />
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? "Guardando..."
          : isEditing
            ? "Guardar cambios"
            : "Publicar proyecto"}
      </Button>
    </form>
  );
}
