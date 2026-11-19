import type { Metadata } from "next";
import { Suspense } from "react";
import { RegisterForm } from "@/features/auth/components/register-form";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Creá tu cuenta en Integral.",
};

export default function RegisterPage() {
  return (
    <section className="px-4 py-12">
      <h1 className="mb-6 text-center text-3xl font-semibold text-slate-900">
        Crear cuenta
      </h1>
      <Suspense
        fallback={
          <p aria-live="polite" className="py-8 text-center text-sm text-slate-600">
            Cargando...
          </p>
        }
      >
        <RegisterForm />
      </Suspense>
    </section>
  );
}
