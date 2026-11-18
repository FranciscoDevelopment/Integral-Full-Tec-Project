import { Suspense } from "react";
import { ReceivedRequestsList } from "@/features/collaborations/components/received-requests-list";

async function ReceivedContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ReceivedRequestsList projectId={id} />;
}

// Params are request data: they are read inside <Suspense> (Cache Components is on).
export default function ProjectCollaborationsPage(
  props: PageProps<"/projects/[id]/collaborations">,
) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-semibold text-slate-900">
        Solicitudes recibidas
      </h1>
      <p className="mb-6 text-sm text-slate-600">
        Quiénes quieren sumarse a tu proyecto. Solo vos podés aceptar, rechazar y confirmar.
      </p>
      <Suspense
        fallback={<p className="text-sm text-slate-600">Cargando...</p>}
      >
        <ReceivedContent params={props.params} />
      </Suspense>
    </div>
  );
}