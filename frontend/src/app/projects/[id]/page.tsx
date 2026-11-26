import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetail } from "@/features/projects/components/project-detail";
import { PageShell } from "@/shared/components/layout/page-shell";
import { isUuid } from "@/shared/lib/uuid";

export const metadata: Metadata = { title: "Proyecto" };

async function DetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // /projects/anything-that-is-not-an-id is a page that does not exist, not an API error
  if (!isUuid(id)) notFound();
  return <ProjectDetail projectId={id} />;
}

export default function ProjectPage(props: PageProps<"/projects/[id]">) {
  return (
    <PageShell title="Detalle del proyecto" width="wide">
      <DetailContent params={props.params} />
    </PageShell>
  );
}
