import type { Metadata } from "next" ;
import { PageShell } from "@/shared/components/layout/page-shell" ;
import { EmptyState } from "@/shared/components/ui" ;

export const metadata : Metadata = { title: "Proponer proyecto" } ;


export default function NewProjectPage () {

    return(

        <PageShell title="Proponer proyecto" description="Contá qué estás construyendo y cuánto necesitás para llegar a la meta." width="narrow" requireAuth>

            {/* Iri: replace the placeholder with <ProjectForm /> */}
            <EmptyState title="El formulario de proyecto llega pronto" />

        </PageShell>

    )

}