import type { Metadata } from "next";
import { ProjectsExplorer } from "@/features/projects/components/projects-explorer";
import { PageShell } from "@/shared/components/layout/page-shell";

export const metadata: Metadata = { title: "Explorar proyectos" };

export default function ProjectsPage() {
  return (
    <PageShell
      title="Explorar proyectos"
      description="Proyectos de programación que buscan colaboradores y apoyo."
      width="wide"
    >
      <ProjectsExplorer />
    </PageShell>
  );
}
