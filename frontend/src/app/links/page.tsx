import type { Metadata } from "next";
import { CommunityLinksGrid } from "@/features/links/components/community-links-grid";
import {
  PageContainer,
  PageHeader,
} from "@/shared/components/layout/page-container";

export const metadata: Metadata = { title: "Enlaces" };

export default function LinksPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Enlaces"
        description="Todos los canales de la comunidad en un solo lugar."
      />
      <CommunityLinksGrid />
    </PageContainer>
  );
}
