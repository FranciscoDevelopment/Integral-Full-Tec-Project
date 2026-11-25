import type { Metadata } from "next";
import { ProjectDetail } from "@/features/projects/components/project-detail";
import { PageShell } from "@/shared/components/layout/page-shell";

export const metadata: Metadata = { title: "Proyecto" };

async function DetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProjectDetail projectId={id} />;
}

export default function ProjectPage(props: PageProps<"/projects/[id]">) {
  return (
    <PageShell title="Detalle del proyecto" width="wide">
      <DetailContent params={props.params} />
    </PageShell>
  );
}
