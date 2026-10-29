"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ROLE_LABELS } from "@/shared/catalogs";
import { EmptyState } from "@/shared/components/ui";
import type { Role } from "@/shared/types";
import { useSession } from "../hooks/use-session";

interface SessionGuardProps {
  children: ReactNode;
  role?: Role;
}

export function SessionGuard({ children, role }: SessionGuardProps) {
  const { session, isLoading, error } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !error && !session) {
      const callbackUrl = new URLSearchParams({ callbackUrl: pathname });
      router.replace(`/login?${callbackUrl.toString()}`);
    }
  }, [error, isLoading, pathname, router, session]);

  if (isLoading) {
    return (
      <p aria-live="polite" className="py-8 text-center text-sm text-slate-600">
        Verificando sesión...
      </p>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="No se pudo verificar la sesión"
        description={error.message}
      />
    );
  }

  if (!session) {
    return null;
  }

  if (role && session.user.role !== role) {
    return (
      <EmptyState
        title="Acceso restringido"
        description={`Esta sección está disponible para usuarios con el rol de ${ROLE_LABELS[role]}.`}
      />
    );
  }

  return children;
}
