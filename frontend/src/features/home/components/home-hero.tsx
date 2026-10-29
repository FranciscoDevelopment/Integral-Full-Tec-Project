import Link from "next/link";
import { LOGIN_HREF } from "@/shared/components/layout/nav-items";
import { buttonStyles } from "@/shared/components/ui/button";
import { SITE_NAME, SITE_TAGLINE } from "@/shared/constants/site";

export function HomeHero() {
  return (
    <section className="bg-gradient-to-b from-brand-50 to-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6 sm:py-24">
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Comunidad <span className="text-brand-600">{SITE_NAME}</span>
        </h1>
        <p className="max-w-2xl text-lg text-slate-600 sm:text-xl">
          {SITE_TAGLINE}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/jobs" className={buttonStyles({ size: "lg" })}>
            Ofertas laborales
          </Link>
          <Link
            href="/links"
            className={buttonStyles({ size: "lg", variant: "outline" })}
          >
            Enlaces
          </Link>
          <Link
            href={LOGIN_HREF}
            className={buttonStyles({ size: "lg", variant: "ghost" })}
          >
            Ingresar a mi cuenta
          </Link>
        </div>
      </div>
    </section>
  );
}
