"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Badge, Button, buttonStyles } from "@/shared/components/ui";
import { ROLE_LABELS } from "@/shared/catalogs/roles";
import { cn } from "@/shared/lib/cn";
import { useSession } from "../hooks/use-session";

const LOGIN_HREF = "/login";
const REGISTER_HREF = "/register";

type AccountMenuVariant = "desktop" | "mobile";

interface AccountMenuProps {
  variant?: AccountMenuVariant;
  // Called after a link click or a successful logout, e.g. to close the mobile menu.
  onNavigate?: () => void;
  className?: string;
}

export function AccountMenu({
  variant = "desktop",
  onNavigate,
  className,
}: AccountMenuProps) {
  const { session, isLoading, logout } = useSession();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isMobile = variant === "mobile";

  const containerClasses = cn(
    isMobile ? "flex flex-col gap-2" : "flex items-center gap-2",
    className,
  );
  const size = isMobile ? "md" : "sm";
  const itemClasses = isMobile ? "w-full" : undefined;

  if (isLoading) {
    // Reserves roughly the space of the logged-out links so the bar does not jump.
    return (
      <div
        aria-hidden
        className={cn(
          containerClasses,
          "animate-pulse",
          isMobile ? "h-[5.5rem]" : "h-8 w-48",
        )}
      >
        <span
          className={cn(
            "h-full rounded-lg bg-slate-100",
            isMobile ? "w-full" : "flex-1",
          )}
        />
      </div>
    );
  }

  // Covers both "no session" and "session could not be verified" (error):
  // in either case the user must still be able to reach /login.
  if (!session) {
    return (
      <div className={containerClasses}>
        <Link
          href={LOGIN_HREF}
          onClick={onNavigate}
          className={buttonStyles({ size, className: itemClasses })}
        >
          Ingresar
        </Link>
        <Link
          href={REGISTER_HREF}
          onClick={onNavigate}
          className={buttonStyles({
            variant: "outline",
            size,
            className: itemClasses,
          })}
        >
          Registrarme
        </Link>
      </div>
    );
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      // logout() clears the session itself, only when the request succeeds.
      await logout();
      onNavigate?.();
      router.replace("/");
      router.refresh();
    } catch {
      toast.error("No pudimos cerrar tu sesión. Intentá de nuevo.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  const { name, role } = session.user;

  return (
    <div className={containerClasses}>
      <div
        className={cn(
          "flex min-w-0 items-center gap-2",
          isMobile && "px-3 py-1",
        )}
      >
        <span
          title={name}
          className={cn(
            "truncate text-sm font-medium text-slate-900",
            isMobile ? "max-w-full" : "max-w-40",
          )}
        >
          {name}
        </span>
        <Badge variant="brand" className="shrink-0">
          {ROLE_LABELS[role]}
        </Badge>
      </div>
      {role === "sponsor" && (
        <Link
          href="/me/contributions"
          onClick={onNavigate}
          className={buttonStyles({
            variant: "outline",
            size,
            className: itemClasses,
          })}
        >
          Mis aportes
        </Link>
      )}
      <Button
        variant="outline"
        size={size}
        onClick={handleLogout}
        disabled={isLoggingOut}
        aria-busy={isLoggingOut}
        className={itemClasses}
      >
        {isLoggingOut ? "Cerrando sesión…" : "Cerrar sesión"}
      </Button>
    </div>
  );
}
