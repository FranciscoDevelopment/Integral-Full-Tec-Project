import { Suspense } from "react";
import { CollaborationRequestForm } from "@/features/collaborations/components/collaboration-request-form";

async function FormContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CollaborationRequestForm projectId={id} />;
}

// Temporary home for the form until the project detail page exists (ámbito B).
export default function CollaboratePage(
  props: PageProps<"/projects/[id]/collaborate">,
) {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-semibold text-slate-900">
        Quiero ayudar
      </h1>
      <p className="mb-6 text-sm text-slate-600">
        Contale al dueño del proyecto cómo podés sumarte.
      </p>
      <Suspense
        fallback={<p className="text-sm text-slate-600">Cargando...</p>}
      >
        <FormContent params={props.params} />
      </Suspense>
    </div>
  );
}