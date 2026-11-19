import type { Metadata } from "next";
import { RequireRole } from "@/features/auth/components/require-role";
import { MyContributionsList } from "@/features/contributions/components/my-contributions-list";

export const metadata: Metadata = { title: "Mis aportes" };

export default function MyContributionsPage() {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-semibold text-slate-900">
        Mis aportes
      </h1>
      <p className="mb-6 text-sm text-slate-600">
        El estado y desglose de tus aportes a proyectos.
      </p>
      <RequireRole role="sponsor">
        <MyContributionsList />
      </RequireRole>
    </section>
  );
}
