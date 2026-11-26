"use client";

import { ROLE_LABELS } from "@/shared/catalogs/roles";
import { Card } from "@/shared/components/ui";
import { useSession } from "../hooks/use-session";

export function ProfileInfo() {
  const { session } = useSession();

  if (!session) {
    return null;
  }

  const { name, email, role, companyName, website } = session.user;

  return (
    <Card>
      <dl className="grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-sm font-medium text-slate-500">Nombre</dt>
          <dd className="mt-1 text-sm text-slate-900">{name}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-slate-500">Correo electrónico</dt>
          <dd className="mt-1 text-sm text-slate-900">{email}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-slate-500">Rol</dt>
          <dd className="mt-1 text-sm text-slate-900">{ROLE_LABELS[role]}</dd>
        </div>
        {companyName !== null && (
          <div>
            <dt className="text-sm font-medium text-slate-500">Empresa</dt>
            <dd className="mt-1 text-sm text-slate-900">{companyName}</dd>
          </div>
        )}
        {website !== null && (
          <div>
            <dt className="text-sm font-medium text-slate-500">Sitio web</dt>
            <dd className="mt-1 text-sm">
              <a
                href={website}
                target="_blank"
                rel="noreferrer noopener"
                className="break-all text-blue-700 underline"
              >
                {website}
              </a>
            </dd>
          </div>
        )}
      </dl>
    </Card>
  );
}
