import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .min(1, "El correo electrónico es obligatorio.")
  .email("Ingresá un correo electrónico válido.");

const passwordSchema = z
  .string()
  .min(1, "La contraseña es obligatoria.")
  .min(8, "La contraseña debe tener al menos 8 caracteres.")
  .regex(/[A-Z]/, "La contraseña debe incluir al menos una mayúscula.")
  .regex(/[a-z]/, "La contraseña debe incluir al menos una minúscula.")
  .regex(/[0-9]/, "La contraseña debe incluir al menos un número.");

const optionalUrlSchema = z
  .string()
  .trim()
  .optional()
  .refine(
    (value) => !value || z.url().safeParse(value).success,
    "Ingresá una URL válida.",
  );

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "La contraseña es obligatoria."),
});

const registerFields = {
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio."),
  email: emailSchema,
  password: passwordSchema,
  logoUrl: optionalUrlSchema,
  website: optionalUrlSchema,
};

export const registerSchema = z.discriminatedUnion("role", [
  z.object({
    ...registerFields,
    role: z.literal("user"),
    companyName: z.string().trim().optional(),
  }),
  z.object({
    ...registerFields,
    role: z.literal("sponsor"),
    companyName: z
      .string()
      .trim()
      .min(1, "El nombre de la empresa es obligatorio para sponsors."),
  }),
]);

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
