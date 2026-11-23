import type { Metadata } from "next" ;
import { PageShell } from "@/shared/components/layout/page-shell" ;
import { EmptyState } from "@/shared/components/ui" ;


export const metadata : Metadata = { title: "Explorar proyectos" } ;


export default function ProjectsPage () {

    return(

        <PageShell title="Explorar proyectos" description="Proyectos de programación que buscan colaboradores y apoyo." width="wide">

            {/* Iri: replace the placeholder with <ProjectsExplorer /> (filters in the URL + list) */}
            <EmptyState title="Pronto vas a poder explorar proyectos acá" />

        </PageShell>

    )

}