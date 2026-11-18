import { TriangleAlert } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { Button } from "./button";


type ErrorStatePropsT = {
    title? : string ;
    message : string ;
    onRetry? : () => void ;
    className? : string ;
}


export function ErrorState ( { title = "Ocurrió un error", message, onRetry, className } : ErrorStatePropsT ) {

    return(

        <div role="alert" className={cn( "flex flex-col items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center", className )}>

            <TriangleAlert aria-hidden className="size-6 text-red-500" />

            <p className="text-base font-semibold text-slate-900">{title}</p>

            <p className="max-w-md text-sm text-slate-600">{message}</p>

            { onRetry && <Button variant="outline" onClick={onRetry}>Reintentar</Button> }

        </div>

    )

}
