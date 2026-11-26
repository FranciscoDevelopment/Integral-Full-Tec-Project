import type { Metadata } from "next";
import { MyProjectsList } from "@/features/projects/components/my-projects-list";
import { PageShell } from "@/shared/components/layout/page-shell";

export const metadata: Metadata = { title: "Mis proyectos" };

export default function MyProjectsPage() {
  return (
    <PageShell
      title="Mis proyectos"
      description="Los proyectos que publicaste, también los que un moderador ocultó."
      width="wide"
      requireAuth
    >
      <MyProjectsList />
    </PageShell>
  );
}
