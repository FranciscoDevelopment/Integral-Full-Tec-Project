import type { Metadata } from "next";
import { MyCollaborationsList } from "@/features/collaborations/components/my-collaborations-list";

export const metadata: Metadata = { title: "Mis colaboraciones" };

// TODO: wrap in <RequireAuth> once the session is connected to the real API (ámbito A).
export default function MyCollaborationsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-semibold text-slate-900">
        Mis colaboraciones
      </h1>
      <p className="mb-6 text-sm text-slate-600">
        Los proyectos en los que pediste participar y el estado de cada solicitud.
      </p>
      <MyCollaborationsList />
    </div>
  );
}