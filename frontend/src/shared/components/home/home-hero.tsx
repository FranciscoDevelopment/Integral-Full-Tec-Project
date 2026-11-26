"use client" ;

import Link from "next/link" ;
import { useSession } from "@/features/auth/hooks/use-session" ;
import { LOGIN_HREF } from "@/shared/components/layout/nav-items" ;
import { buttonStyles } from "@/shared/components/ui/button" ;
import { SITE_NAME, SITE_TAGLINE } from "@/shared/constants/site" ;
import type { Role } from "@/shared/types" ;


type HeroActionT = {
    label : string ;
    href : string ;
}


// What the hero offers once someone is logged in. The first action is the main one
const ACTIONS_BY_ROLE : Record<Role, readonly [ HeroActionT, HeroActionT ]> = {

    user : [
        { label: "Proponer proyecto", href: "/projects/new" },
        { label: "Explorar proyectos", href: "/projects" },
    ],

    sponsor : [
        { label: "Explorar proyectos", href: "/projects" },
        { label: "Mis aportes", href: "/me/contributions" },
    ],

    admin : [
        { label: "Moderar proyectos", href: "/admin/projects" },
        { label: "Explorar proyectos", href: "/projects" },
    ],

} ;


export function HomeHero () {

    const { session, isLoading } = useSession() ;

    const actions = session ? ACTIONS_BY_ROLE[ session.user.role ] : null ;


    return(

        <section className="bg-gradient-to-b from-brand-50 to-white">

            <section className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6 sm:py-24">

                <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">

                    <span className="text-brand-600">{SITE_NAME}</span>

                </h1>

                <p className="max-w-2xl text-lg text-slate-600 sm:text-xl">{SITE_TAGLINE}</p>

                {/* While the session is being checked the space is reserved: nobody sees the wrong buttons for a moment */}
                <article aria-hidden={isLoading} className="flex min-h-12 flex-wrap items-center justify-center gap-3">

                    { isLoading ? null : actions ? (

                        <>

                            <Link href={actions[0].href} className={buttonStyles( { size: "lg" } )}>
                                {actions[0].label}
                            </Link>

                            <Link href={actions[1].href} className={buttonStyles( { size: "lg", variant: "outline" } )}>
                                {actions[1].label}
                            </Link>

                        </>

                    ) : (

                        <>

                            <Link href="/register" className={buttonStyles( { size: "lg" } )}>
                                Crear cuenta
                            </Link>

                            <Link href={LOGIN_HREF} className={buttonStyles( { size: "lg", variant: "outline" } )}>
                                Ingresar
                            </Link>

                        </>

                    ) }

                </article>

            </section>

        </section>

    )

}
