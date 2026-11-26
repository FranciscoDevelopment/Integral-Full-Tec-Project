import type { Metadata } from "next";
import { RequireRole } from "@/features/auth/components/require-role";
import { ProjectForm } from "@/features/projects/components/project-form";
import { PageShell } from "@/shared/components/layout/page-shell";

export const metadata: Metadata = { title: "Proponer proyecto" };

export default function NewProjectPage() {
  return (
    <PageShell
      title="Proponer proyecto"
      description="Contá qué estás construyendo y cuánto necesitás para llegar a la meta."
      width="narrow"
    >
      {/* Only the "user" role publishes projects: the API answers 403 to sponsors and admins */}
      <RequireRole role="user">
        <ProjectForm />
      </RequireRole>
    </PageShell>
  );
}
