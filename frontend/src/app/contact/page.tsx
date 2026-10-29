import type { Metadata } from "next";
import { ContactCard } from "@/features/contact/components/contact-card";
import {
  PageContainer,
  PageHeader,
} from "@/shared/components/layout/page-container";

export const metadata: Metadata = { title: "Contacto" };

export default function ContactPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Hablemos"
        description="¿Tenés una pregunta o propuesta? Escribinos."
      />
      <ContactCard />
    </PageContainer>
  );
}
