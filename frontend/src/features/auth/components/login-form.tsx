"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "@/features/auth/api";
import { loginSchema } from "@/features/auth/schema";
import type { LoginFormValues } from "@/features/auth/schema";
import { getSafeCallbackUrl } from "@/features/auth/utils";
import { useSession } from "@/features/auth/hooks/use-session";
import { Button, Card, Input } from "@/shared/components/ui";

export function LoginForm() {
  const { session, isLoading, login } = useSession();
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
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (!isLoading && session) {
      router.replace(callbackUrl);
    }
  }, [callbackUrl, isLoading, router, session]);

  async function onSubmit(values: LoginFormValues) {
    setFormError(null);
    try {
      await login(values);
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
      }

      setFormError(
        "No se pudo iniciar sesión. Verificá tu conexión e intentá nuevamente.",
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
          autoComplete="current-password"
          error={errors.password?.message}
        />
        {formError && (
          <p role="alert" className="text-sm text-red-600">
            {formError}
          </p>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-slate-600">
        ¿Todavía no tenés una cuenta?{" "}
        <Link
          href={`/register${callbackQuery}`}
          className="font-medium text-brand-700 hover:underline"
        >
          Registrate
        </Link>
      </p>
    </Card>
  );
}
