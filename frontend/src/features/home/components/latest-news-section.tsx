import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Newspaper } from "lucide-react";
import { PageContainer } from "@/shared/components/layout/page-container";
import { EmptyState } from "@/shared/components/ui/empty-state";

// D3 delivers <LatestNews limit={4} />; the home passes it as `children` and the placeholder goes away.
export function LatestNewsSection({ children }: { children?: ReactNode }) {
  return (
    <PageContainer className="flex flex-col gap-6 py-12">
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Últimas novedades
          </h2>
          <p className="text-slate-600">
            Becas, cursos, descuentos y eventos para la comunidad IT.
          </p>
        </div>
        <Link
          href="/news"
          className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-brand-700 hover:underline"
        >
          Ver todas
          <ArrowRight aria-hidden className="size-4" />
        </Link>
      </div>
      {children ?? (
        <EmptyState
          icon={<Newspaper aria-hidden className="size-10" />}
          title="Muy pronto vas a ver acá las últimas novedades"
          description="Estamos preparando el listado de becas, cursos, descuentos y eventos."
        />
      )}
    </PageContainer>
  );
}
