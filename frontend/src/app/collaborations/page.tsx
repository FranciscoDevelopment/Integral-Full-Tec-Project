import type { Metadata } from "next";
import { Suspense } from "react";

import { RequireAuth } from "@/features/auth/components/require-auth";
import { MyCollaborationsList } from "@/features/collaborations/components/my-collaborations-list";
import { LoadingState } from "@/shared/components/ui";

export const metadata: Metadata = {
  title: "Mis colaboraciones",
};

export default function MyCollaborationsPage() {
  return (
    <section
      aria-labelledby="my-collaborations-title"
      className="mx-auto w-full max-w-3xl px-4 py-10"
    >
      <header className="mb-6">
        <h1
          id="my-collaborations-title"
          className="mb-2 text-2xl font-semibold text-slate-900"
        >
          Mis colaboraciones
        </h1>
        <p className="text-sm text-slate-600">
          Los proyectos en los que pediste participar y el estado de cada
          solicitud.
        </p>
      </header>

      <Suspense fallback={<LoadingState label="Verificando sesión..." />}>
        <RequireAuth>
          <MyCollaborationsList />
        </RequireAuth>
      </Suspense>
    </section>
  );
}