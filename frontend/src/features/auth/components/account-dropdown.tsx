"use client" ;

import Link from "next/link" ;
import { LogOut, UserRound } from "lucide-react" ;
import { useEffect, useId, useRef, useState } from "react" ;
import { cn } from "@/shared/lib/cn" ;
import type { AccountLink } from "../account-links" ;


type AccountDropdownPropsT = {
    links : AccountLink[] ;
    onLogout : () => void ;
    isLoggingOut : boolean ;
}


const ITEM_CLASSES = "flex w-full items-center gap-2 whitespace-nowrap px-3 py-2 text-left text-sm transition-colors" ;


// Desktop only: a round user icon that opens a small box with the account options.
// The mobile panel keeps its own full-width buttons (see AccountMenu)
export function AccountDropdown ( { links, onLogout, isLoggingOut } : AccountDropdownPropsT ) {

    const [ open, setOpen ] = useState(false) ;

    const containerRef = useRef<HTMLElement>(null) ;

    const triggerRef = useRef<HTMLButtonElement>(null) ;

    const menuId = useId() ;


    // Same behavior as the "Proyectos" dropdown: a click outside or Escape closes it
    useEffect( () => {

        if( !open ) return ;


        function handlePointerDown ( event : PointerEvent ) {

            if( !containerRef.current?.contains( event.target as Node ) ) setOpen(false) ;

        }

        function handleKeyDown ( event : KeyboardEvent ) {

            if( event.key !== "Escape" ) return ;

            setOpen(false) ;

            triggerRef.current?.focus() ;

        }


        document.addEventListener( "pointerdown", handlePointerDown ) ;

        document.addEventListener( "keydown", handleKeyDown ) ;


        return () => {

            document.removeEventListener( "pointerdown", handlePointerDown ) ;

            document.removeEventListener( "keydown", handleKeyDown ) ;

        }

    }, [ open ] ) ;


    return(

        <section ref={containerRef} className="relative">

            <button
                ref={triggerRef}
                type="button"
                aria-label="Mi cuenta"
                aria-expanded={open}
                aria-controls={menuId}
                onClick={ () => setOpen( (current) => !current ) }
                className={cn(
                    "flex size-9 items-center justify-center rounded-full border border-slate-300 text-slate-700 transition-colors hover:border-brand-600 hover:text-brand-700",
                    open && "border-brand-600 text-brand-700",
                )}
            >

                <UserRound aria-hidden className="size-5" />

            </button>


            {/* Always mounted so it can fade; "invisible" takes it out of the tab order and of the accessibility tree while closed */}
            <ul
                id={menuId}
                className={cn(
                    "absolute right-0 top-full z-50 mt-2 w-56 origin-top-right divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg transition-all duration-150 ease-out",
                    open ? "visible translate-y-0 scale-100 opacity-100" : "invisible -translate-y-1 scale-95 opacity-0",
                )}
            >

                { links.map( ( { label, href, icon : Icon } ) => (

                    <li key={href}>

                        <Link
                            href={href}
                            onClick={ () => setOpen(false) }
                            className={cn( ITEM_CLASSES, "text-slate-800 hover:bg-slate-100" )}
                        >

                            <Icon aria-hidden className="size-4" />

                            {label}

                        </Link>

                    </li>

                ) ) }

                <li>

                    <button
                        type="button"
                        onClick={onLogout}
                        disabled={isLoggingOut}
                        aria-busy={isLoggingOut}
                        className={cn( ITEM_CLASSES, "text-red-700 hover:bg-red-50 disabled:opacity-60" )}
                    >

                        <LogOut aria-hidden className="size-4" />

                        { isLoggingOut ? "Cerrando sesión…" : "Cerrar sesión" }

                    </button>

                </li>

            </ul>

        </section>

    )

}
