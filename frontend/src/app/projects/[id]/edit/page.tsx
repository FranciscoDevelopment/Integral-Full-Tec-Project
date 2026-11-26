import type { Metadata } from "next";
import { EditProject } from "@/features/projects/components/edit-project";
import { PageShell } from "@/shared/components/layout/page-shell";

export const metadata: Metadata = { title: "Editar proyecto" };

async function EditContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditProject projectId={id} />;
}

export default function EditProjectPage(
  props: PageProps<"/projects/[id]/edit">,
) {
  return (
    <PageShell title="Editar proyecto" width="narrow" requireAuth>
      <EditContent params={props.params} />
    </PageShell>
  );
}
