import Link from "next/link";
import { LOGIN_HREF } from "@/shared/components/layout/nav-items";
import { buttonStyles } from "@/shared/components/ui/button";
import { SITE_NAME, SITE_TAGLINE } from "@/shared/constants/site";


export function HomeHero () {

    return(

        <section className="bg-gradient-to-b from-brand-50 to-white">

            <section className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6 sm:py-24">

                <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">

                    <span className="text-brand-600">{SITE_NAME}</span>

                </h1>

                <p className="max-w-2xl text-lg text-slate-600 sm:text-xl">{SITE_TAGLINE}</p>

                <article className="flex flex-wrap items-center justify-center gap-3">

                {/*
                    <Link href="/register" className={buttonStyles( { size: "lg" } )}>Crear cuenta</Link>

                    <Link href={LOGIN_HREF} className={buttonStyles( { size: "lg", variant: "outline" } )}>Ingresar</Link>
                */}

                    <Link href="/register" className={buttonStyles({ size: "lg" })}>
                        Crear cuenta
                    </Link>
                    
                    <Link
                        href={LOGIN_HREF}
                        className={buttonStyles({ size: "lg", variant: "outline" })}
                    >
                        Ingresar
                    </Link>


                </article>

            </section>

        </section>

    )

}
