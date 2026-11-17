import { z } from "zod";

// Mirrors the backend rules (role up to 80, description up to 1000, endDate not before startDate).
export const collaborationFormSchema = z
  .object({
    role: z
      .string()
      .trim()
      .min(2, "Indicá qué rol podés cumplir.")
      .max(80, "El rol admite hasta 80 caracteres."),
    description: z
      .string()
      .trim()
      .min(10, "Contanos cómo podés ayudar (mínimo 10 caracteres).")
      .max(1000, "La descripción admite hasta 1000 caracteres."),
    startDate: z.string().min(1, "Elegí una fecha de inicio."),
    endDate: z.string().optional(),
  })
  .refine((values) => !values.endDate || values.endDate >= values.startDate, {
    message: "La fecha de fin no puede ser anterior a la de inicio.",
    path: ["endDate"],
  });

export type CollaborationFormValues = z.infer<typeof collaborationFormSchema>;