import Link from "next/link";
import { cacheLife } from "next/cache";
import {
  CONTACT_EMAIL,
  SITE_NAME,
  SITE_TAGLINE,
} from "@/shared/constants/site";

// Cache Components rejects reading the clock during prerender; caching it for a day is enough here.
async function CurrentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

const FOOTER_LINK_CLASSES =
  "text-sm text-slate-600 transition-colors hover:text-brand-700";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <section className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-2">
        <article className="flex flex-col gap-2">
          <p className="font-semibold text-slate-900">{SITE_NAME}</p>
          <p className="max-w-xs text-sm text-slate-600">{SITE_TAGLINE}</p>
        </article>

        <article>
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Contacto</h2>
          <ul className="flex flex-col gap-2">
            <li>
              <Link href="/contact" className={FOOTER_LINK_CLASSES}>
                Escribinos
              </Link>
            </li>
            <li>
              <a href={`mailto:${CONTACT_EMAIL}`} className={FOOTER_LINK_CLASSES}>
                {CONTACT_EMAIL}
              </a>
            </li>
          </ul>
        </article>
      </section>

      <section className="border-t border-slate-200">
        <p className="mx-auto w-full max-w-6xl px-4 py-4 text-sm text-slate-500 sm:px-6">
          © <CurrentYear /> {SITE_NAME} — Hecho por la comunidad
        </p>
      </section>
    </footer>
  );
}
