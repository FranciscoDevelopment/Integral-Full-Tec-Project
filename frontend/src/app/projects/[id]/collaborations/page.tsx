
import { Suspense } from "react";
import { RequireAuth } from "@/features/auth/components/require-auth";
import { ReceivedRequestsList } from "@/features/collaborations/components/received-requests-list";
import { LoadingState } from "@/shared/components/ui";
async function ReceivedContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ReceivedRequestsList projectId={id} />;
}

// Params are request data: they are read inside <Suspense> (Cache Components is on).
export default function ProjectCollaborationsPage(
  props: PageProps<"/projects/[id]/collaborations">,
) {
  return (
    <section
      aria-labelledby="received-requests-title"
      className="mx-auto w-full max-w-3xl px-4 py-10"
    >
      <header className="mb-6">
        <h1
          id="received-requests-title"
          className="mb-2 text-2xl font-semibold text-slate-900"
        >
          Solicitudes recibidas
        </h1>
        <p className="text-sm text-slate-600">
          Quiénes quieren sumarse a tu proyecto. Solo vos podés aceptar,
          rechazar y confirmar.
        </p>
      </header>
      <Suspense fallback={<LoadingState label="Cargando..." />}>
        <RequireAuth>
          <ReceivedContent params={props.params} />
        </RequireAuth>
      </Suspense>
    </section>
  );
}
