"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button, Input } from "@/shared/components/ui";
import {
  describedById,
  Field,
  FIELD_CONTROL_CLASSES,
  FIELD_ERROR_CLASSES,
} from "@/shared/components/ui/field";
import { cn } from "@/shared/lib/cn";
import { createCollaboration, getErrorMessage } from "../api";
import {
  collaborationFormSchema,
  type CollaborationFormValues,
} from "../schema";

const DESCRIPTION_ID = "collaboration-description";
const DESCRIPTION_HINT = "Contale al dueño del proyecto qué vas a aportar.";

interface CollaborationRequestFormProps {
  projectId: string;
  onCreated?: () => void;
}

export function CollaborationRequestForm({
  projectId,
  onCreated,
}: CollaborationRequestFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CollaborationFormValues>({
    resolver: zodResolver(collaborationFormSchema),
    defaultValues: { role: "", description: "", startDate: "", endDate: "" },
  });

  async function onSubmit(values: CollaborationFormValues) {
    try {
      await createCollaboration(projectId, {
        role: values.role,
        description: values.description,
        startDate: values.startDate,
        endDate: values.endDate || undefined,
      });
      toast.success("Solicitud enviada. El dueño del proyecto la va a revisar.");
      reset();
      onCreated?.();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4"
    >
      <Input
        label="Rol que podés cumplir"
        placeholder="Ej: diseño de interfaz"
        error={errors.role?.message}
        {...register("role")}
      />

      <Field
        controlId={DESCRIPTION_ID}
        label="Cómo podés ayudar"
        hint={DESCRIPTION_HINT}
        error={errors.description?.message}
      >
        <textarea
          id={DESCRIPTION_ID}
          rows={4}
          aria-invalid={errors.description ? true : undefined}
          aria-describedby={describedById(DESCRIPTION_ID, {
            hint: DESCRIPTION_HINT,
            error: errors.description?.message,
          })}
          className={cn(
            FIELD_CONTROL_CLASSES,
            "h-auto min-h-28 py-2",
            errors.description && FIELD_ERROR_CLASSES,
          )}
          {...register("description")}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          type="date"
          label="Fecha de inicio"
          error={errors.startDate?.message}
          {...register("startDate")}
        />
        <Input
          type="date"
          label="Fecha de fin (opcional)"
          error={errors.endDate?.message}
          {...register("endDate")}
        />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Enviando..." : "Enviar solicitud"}
      </Button>
    </form>
  );
}