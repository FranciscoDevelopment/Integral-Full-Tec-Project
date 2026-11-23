import { Suspense, useId, type ReactNode } from "react" ;
import { RequireAuth } from "@/features/auth/components/require-auth" ;
import { LoadingState } from "@/shared/components/ui" ;
import { cn } from "@/shared/lib/cn" ;


const WIDTHS = {
    narrow : "max-w-2xl",
    default : "max-w-3xl",
    wide : "max-w-6xl"
} as const ;


type PageShellPropsT = {
    title : string ;
    description? : string ;
    width? : keyof typeof WIDTHS ;
    // Wraps the content in <RequireAuth>: every private screen of every ámbito uses it
    requireAuth? : boolean ;
    children : ReactNode ;
}


// Parent of every screen: width, title, description and the loading state while the session is checked.
// Whoever owns the screen (projects, collaborations...) only writes what goes inside
export function PageShell ( { title, description, width = "default", requireAuth = false, children } : PageShellPropsT ) {

    const titleId = useId() ;


    return(

        <section aria-labelledby={titleId} className={cn( "mx-auto w-full px-4 py-10", WIDTHS[ width ] )}>

            <header className="mb-6">

                <h1 id={titleId} className="mb-2 text-2xl font-semibold text-slate-900">{title}</h1>

                { description && <p className="text-sm text-slate-600">{description}</p> }

            </header>

            <Suspense fallback={<LoadingState label={ requireAuth ? "Verificando sesión..." : "Cargando..." } />}>

                { requireAuth ? <RequireAuth>{children}</RequireAuth> : children }

            </Suspense>

        </section>

    )

}