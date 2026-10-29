import Link from "next/link";
import { Suspense } from "react";
import { CodeXml } from "lucide-react";
import { SITE_NAME } from "@/shared/constants/site";
import { MainNav } from "./main-nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-slate-900"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <CodeXml aria-hidden className="size-5" />
          </span>
          {SITE_NAME}
        </Link>
        {/* usePathname suspends on routes whose params are unknown at build time
            (/go/[id], /jobs/[id]), so the nav needs its own boundary. */}
        <Suspense fallback={<div aria-hidden className="h-10 w-10 md:w-[36rem]" />}>
          <MainNav />
        </Suspense>
      </div>
    </header>
  );
}
