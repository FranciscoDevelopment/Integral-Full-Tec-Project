
import { Suspense } from "react";
import { RequireAuth } from "@/features/auth/components/require-auth";
import { CollaborationRequestForm } from "@/features/collaborations/components/collaboration-request-form";
import { LoadingState } from "@/shared/components/ui";
async function FormContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CollaborationRequestForm projectId={id} />;
}

// Temporary home for the form until the project detail page exists (ámbito B).
export default function CollaboratePage(
  props: PageProps<"/projects/[id]/collaborate">,
) {
  return (
    <section
      aria-labelledby="collaborate-title"
      className="mx-auto w-full max-w-2xl px-4 py-10"
    >
      <header className="mb-6">
        <h1
          id="collaborate-title"
          className="mb-2 text-2xl font-semibold text-slate-900"
        >
          Quiero ayudar
        </h1>
        <p className="text-sm text-slate-600">
          Contale al dueño del proyecto cómo podés sumarte.
        </p>
      </header>
      <Suspense fallback={<LoadingState label="Cargando..." />}>
        <RequireAuth>
          <FormContent params={props.params} />
        </RequireAuth>
      </Suspense>
    </section>
  );
}
