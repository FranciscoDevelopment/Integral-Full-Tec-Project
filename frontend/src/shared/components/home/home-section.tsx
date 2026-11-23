import Link from "next/link" ;
import type { ReactNode } from "react" ;
import { PageContainer } from "@/shared/components/layout/page-container" ;
import { buttonStyles } from "@/shared/components/ui/button" ;


type HomeSectionPropsT = {
    title : string ;
    description? : string ;
    href? : string ;
    linkLabel? : string ;
    children : ReactNode ;
}


// Container of a home block: title, optional "see all" link and a slot for the content.
// It knows nothing about the domain: whoever owns the content (projects, collaborations) passes it as children
export function HomeSection ( { title, description, href, linkLabel = "Ver todos", children } : HomeSectionPropsT ) {

    return(

        <PageContainer className="flex flex-col gap-6 py-12">

            <header className="flex flex-wrap items-end justify-between gap-3">

                <article className="flex flex-col gap-1">

                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>

                    { description && <p className="text-slate-600">{description}</p> }

                </article>

                { href && <Link href={href} className={buttonStyles( { variant: "outline" } )}>{linkLabel}</Link> }

            </header>

            {children}

        </PageContainer>

    )

}