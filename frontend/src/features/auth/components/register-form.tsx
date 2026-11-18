"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "@/features/auth/api";
import { registerSchema } from "@/features/auth/schema";
import type { RegisterFormValues } from "@/features/auth/schema";
import { getSafeCallbackUrl } from "@/features/auth/utils";
import { useSession } from "@/features/auth/hooks/use-session";
import { Button, Card, Input, Select } from "@/shared/components/ui";

const roleOptions = [
  { value: "user", label: "Usuario" },
  { value: "sponsor", label: "Sponsor" },
] as const;

export function RegisterForm() {
  const { session, isLoading, register: registerUser } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);
  const callbackUrl = getSafeCallbackUrl(searchParams.get("callbackUrl"));
  const callbackQuery = searchParams.has("callbackUrl")
    ? `?${new URLSearchParams({
        callbackUrl: searchParams.get("callbackUrl") ?? "",
      }).toString()}`
    : "";
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "user",
      companyName: "",
      logoUrl: "",
      website: "",
    },
  });
  const role = useWatch({ control, name: "role" });

  useEffect(() => {
    if (!isLoading && session) {
      router.replace(callbackUrl);
    }
  }, [callbackUrl, isLoading, router, session]);

  async function onSubmit(values: RegisterFormValues) {
    setFormError(null);
    const optionalFields = {
      ...(values.logoUrl ? { logoUrl: values.logoUrl } : {}),
      ...(values.website ? { website: values.website } : {}),
    };

    try {
      if (values.role === "sponsor") {
        await registerUser({
          name: values.name,
          email: values.email,
          password: values.password,
          role: "sponsor",
          companyName: values.companyName,
          ...optionalFields,
        });
      } else {
        await registerUser({
          name: values.name,
          email: values.email,
          password: values.password,
          role: "user",
          ...optionalFields,
        });
      }
      router.replace(callbackUrl);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          setFormError("El correo electrónico o la contraseña no son correctos.");
          return;
        }
        if (error.status === 403) {
          setFormError("Tu cuenta está suspendida. Contactá al equipo de soporte.");
          return;
        }
        if (error.status === 429) {
          setFormError(
            "Demasiados intentos. Esperá un minuto antes de volver a intentarlo.",
          );
          return;
        }
        if (error.status === 409) {
          setFormError("Ya existe una cuenta registrada con ese correo electrónico.");
          return;
        }
        if (error.status !== 0) {
          setFormError(error.message);
          return;
        }
      }

      setFormError(
        "No se pudo crear la cuenta. Verificá tu conexión e intentá nuevamente.",
      );
    }
  }

  if (isLoading || session) {
    return (
      <p aria-live="polite" className="py-8 text-center text-sm text-slate-600">
        Verificando sesión...
      </p>
    );
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
        <Input
          {...register("name")}
          type="text"
          label="Nombre"
          autoComplete="name"
          error={errors.name?.message}
        />
        <Input
          {...register("email")}
          type="email"
          label="Correo electrónico"
          autoComplete="email"
          error={errors.email?.message}
        />
        <Input
          {...register("password")}
          type="password"
          label="Contraseña"
          autoComplete="new-password"
          hint="Usá al menos 8 caracteres, una mayúscula, una minúscula y un número."
          error={errors.password?.message}
        />
        <Select
          {...register("role")}
          label="Tipo de cuenta"
          options={roleOptions}
          error={errors.role?.message}
        />
        {role === "sponsor" && (
          <>
            <Input
              {...register("companyName")}
              type="text"
              label="Nombre de la empresa"
              autoComplete="organization"
              error={errors.companyName?.message}
            />
            <Input
              {...register("logoUrl")}
              type="url"
              label="URL del logo (opcional)"
              autoComplete="url"
              error={errors.logoUrl?.message}
            />
            <Input
              {...register("website")}
              type="url"
              label="Sitio web (opcional)"
              autoComplete="url"
              error={errors.website?.message}
            />
          </>
        )}
        {formError && (
          <p role="alert" className="text-sm text-red-600">
            {formError}
          </p>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-slate-600">
        ¿Ya tenés una cuenta?{" "}
        <Link
          href={`/login${callbackQuery}`}
          className="font-medium text-brand-700 hover:underline"
        >
          Iniciá sesión
        </Link>
      </p>
    </Card>
  );
}
