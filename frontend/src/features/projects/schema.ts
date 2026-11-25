import { z } from "zod";
import { OWNER_STATUSES, PROJECT_KINDS } from "./types";
import { isValidRepoUrl } from "./utils";

// Decimal(12, 2) in the database: 10 digits before the point
export const MAX_GOAL_AMOUNT = 9_999_999_999.99;

const hasAtMostTwoDecimals = (value: number) =>
  Math.abs(value * 100 - Math.round(value * 100)) < 1e-6;

// Mirrors the back rules (CreateProjectDto) so the user sees the error before sending
export const projectFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "El título necesita al menos 3 caracteres.")
    .max(120, "El título admite hasta 120 caracteres."),
  description: z
    .string()
    .trim()
    .min(10, "Contá un poco más (mínimo 10 caracteres).")
    .max(5000, "La descripción admite hasta 5000 caracteres."),
  repoUrl: z
    .string()
    .trim()
    .refine(
      isValidRepoUrl,
      "Pegá el link completo del repositorio, por ejemplo https://github.com/usuario/proyecto.",
    ),
  kind: z.enum(PROJECT_KINDS, { error: "Elegí qué tipo de proyecto es." }),
  goalAmount: z
    .number({ error: "Ingresá un número (puede ser 0)." })
    .min(0, "La meta no puede ser negativa.")
    .max(MAX_GOAL_AMOUNT, "La meta es demasiado grande.")
    .refine(hasAtMostTwoDecimals, "Usá como máximo 2 decimales."),
  status: z.enum(OWNER_STATUSES).optional(),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;
