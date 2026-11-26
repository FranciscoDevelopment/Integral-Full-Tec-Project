import type { Metadata } from "next";
import { ProfileInfo } from "@/features/auth/components/profile-info";
import { MyProjectsList } from "@/features/projects/components/my-projects-list";
import { PageShell } from "@/shared/components/layout/page-shell";

export const metadata: Metadata = { title: "Mi perfil" };

export default function ProfilePage() {
  return (
    <PageShell
      title="Mi perfil"
      description="Tus datos de cuenta."
      width="default"
      requireAuth
    >
      <div className="space-y-8">
        <ProfileInfo />
        <section aria-labelledby="my-projects-heading">
          <h2
            id="my-projects-heading"
            className="mb-4 text-xl font-semibold text-slate-900"
          >
            Mis proyectos
          </h2>
          <MyProjectsList />
        </section>
      </div>
    </PageShell>
  );
}
