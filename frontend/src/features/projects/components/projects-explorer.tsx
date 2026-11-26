"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, type FormEvent } from "react";
import {
  Button,
  EmptyState,
  ErrorState,
  Input,
  LoadingState,
  Select,
} from "@/shared/components/ui";
import { toOptions } from "@/shared/catalogs/to-options";
import { useResource } from "@/shared/hooks/use-resource";
import { getProjects } from "../api";
import { getProjectErrorMessage } from "../errors";
import {
  OWNER_STATUSES,
  PROJECT_KIND_LABELS,
  PROJECT_KINDS,
  PROJECT_STATUS_LABELS,
  type OwnerStatus,
  type ProjectFilters,
  type ProjectKind,
} from "../types";
import { ProjectGrid } from "./project-card";

const PAGE_SIZE = 12;

const KIND_OPTIONS = toOptions(PROJECT_KINDS, PROJECT_KIND_LABELS);
const STATUS_OPTIONS = toOptions(
  OWNER_STATUSES,
  PROJECT_STATUS_LABELS as Record<OwnerStatus, string>,
);

// The URL is the source of truth: a filtered list can be shared or reloaded as it is
function readFilters(params: URLSearchParams): ProjectFilters {
  const kind = params.get("kind");
  const status = params.get("status");
  const page = Number(params.get("page"));

  return {
    kind: PROJECT_KINDS.includes(kind as ProjectKind)
      ? (kind as ProjectKind)
      : undefined,
    status: OWNER_STATUSES.includes(status as OwnerStatus)
      ? (status as OwnerStatus)
      : undefined,
    q: params.get("q")?.trim() || undefined,
    page: Number.isInteger(page) && page > 1 ? page : 1,
    limit: PAGE_SIZE,
  };
}

export function ProjectsExplorer() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const filters = readFilters(new URLSearchParams(query));

  const load = useCallback(
    () => getProjects(readFilters(new URLSearchParams(query))),
    [query],
  );
  const { data, error, isLoading, reload } = useResource(
    load,
    getProjectErrorMessage,
  );

  function goTo(next: ProjectFilters) {
    const params = new URLSearchParams();
    if (next.kind) params.set("kind", next.kind);
    if (next.status) params.set("status", next.status);
    if (next.q) params.set("q", next.q);
    if (next.page && next.page > 1) params.set("page", String(next.page));
    const search = params.toString();
    router.replace(search ? `${pathname}?${search}` : pathname, {
      scroll: false,
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    // Any new filter starts again from page 1
    goTo(
      readFilters(
        new URLSearchParams({
          kind: String(form.get("kind") ?? ""),
          status: String(form.get("status") ?? ""),
          q: String(form.get("q") ?? ""),
        }),
      ),
    );
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.meta.total / PAGE_SIZE)) : 1;
  const page = filters.page ?? 1;
  const hasFilters = Boolean(filters.kind || filters.status || filters.q);

  return (
    <div className="flex flex-col gap-6">
      <form
        key={query}
        role="search"
        aria-label="Filtrar proyectos"
        onSubmit={handleSubmit}
        className="grid items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-[2fr_1fr_1fr_auto]"
      >
        <Input
          name="q"
          type="search"
          label="Buscar"
          placeholder="Título o descripción"
          defaultValue={filters.q ?? ""}
        />
        <Select
          name="kind"
          label="Tipo"
          placeholder="Todos"
          options={KIND_OPTIONS}
          defaultValue={filters.kind ?? ""}
        />
        <Select
          name="status"
          label="Estado"
          placeholder="Todos"
          options={STATUS_OPTIONS}
          defaultValue={filters.status ?? ""}
        />
        <Button type="submit">Filtrar</Button>
      </form>

      {isLoading ? (
        <LoadingState label="Buscando proyectos..." />
      ) : error ? (
        <ErrorState
          title="No pudimos cargar los proyectos"
          message={error}
          onRetry={reload}
        />
      ) : !data || data.data.length === 0 ? (
        <EmptyState
          title={
            hasFilters
              ? "No hay proyectos con esos filtros"
              : "Todavía no hay proyectos publicados"
          }
          description={
            hasFilters
              ? "Probá con otra palabra o sacá algún filtro."
              : "¡Sé la primera persona en proponer uno!"
          }
          action={
            hasFilters ? (
              <Button variant="outline" onClick={() => goTo({})}>
                Limpiar filtros
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <p className="text-sm text-slate-600" aria-live="polite">
            {data.meta.total === 1
              ? "1 proyecto"
              : `${data.meta.total} proyectos`}
          </p>
          <ProjectGrid label="Proyectos" projects={data.data} />
          {totalPages > 1 && (
            <nav
              aria-label="Paginación"
              className="flex items-center justify-center gap-3"
            >
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => goTo({ ...filters, page: page - 1 })}
              >
                Anterior
              </Button>
              <span className="text-sm text-slate-600">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => goTo({ ...filters, page: page + 1 })}
              >
                Siguiente
              </Button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
