import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Iniciá sesión en Integral.",
};

export default function LoginPage() {
  return (
    <section className="px-4 py-12">
      <h1 className="mb-6 text-center text-3xl font-semibold text-slate-900">
        Iniciar sesión
      </h1>
      <Suspense
        fallback={
          <p aria-live="polite" className="py-8 text-center text-sm text-slate-600">
            Cargando...
          </p>
        }
      >
        <LoginForm />
      </Suspense>
    </section>
  );
}
