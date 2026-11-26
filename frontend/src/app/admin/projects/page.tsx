import type { Metadata } from "next";
import { RequireRole } from "@/features/auth/components/require-role";
import { AdminProjectsList } from "@/features/projects/components/admin-projects-list";
import { PageShell } from "@/shared/components/layout/page-shell";

export const metadata: Metadata = { title: "Moderar proyectos" };

export default function AdminProjectsPage() {
  return (
    <PageShell
      title="Moderar proyectos"
      description="Ocultá los proyectos que no corresponden. Un proyecto oculto deja de verse en el listado y en su detalle."
      width="wide"
    >
      <RequireRole role="admin">
        <AdminProjectsList />
      </RequireRole>
    </PageShell>
  );
}
