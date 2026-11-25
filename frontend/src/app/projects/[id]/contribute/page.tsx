import { Suspense } from "react";
import { RequireRole } from "@/features/auth/components/require-role";
import { ContributionForm } from "@/features/contributions/components/contribution-form";
import { LoadingState } from "@/shared/components/ui";

async function ContributionContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <RequireRole role="sponsor">
      <ContributionForm projectId={id} />
    </RequireRole>
  );
}

export default function ContributePage(props: {
  params: Promise<{ id: string }>;
}) {
  return (
    <section className="mx-auto w-full max-w-2xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-semibold text-slate-900">Aportar</h1>
      <p className="mb-6 text-sm text-slate-600">
        Revisá el desglose antes de confirmar tu aporte.
      </p>
      <Suspense fallback={<LoadingState label="Cargando proyecto..." />}>
        <ContributionContent params={props.params} />
      </Suspense>
    </section>
  );
}
