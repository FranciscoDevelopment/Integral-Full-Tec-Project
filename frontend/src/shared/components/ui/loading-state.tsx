import { LoaderCircle } from "lucide-react";
import { cn } from "@/shared/lib/cn";


type LoadingStatePropsT = {
    label? : string ;
    className? : string ;
}


export function LoadingState ( { label = "Cargando...", className } : LoadingStatePropsT ) {

    return(

        <div role="status" aria-live="polite" className={cn( "flex items-center justify-center gap-2 py-12 text-sm text-slate-600", className )}>

            <LoaderCircle aria-hidden className="size-4 animate-spin" />

            {label}

        </div>

    )

}
