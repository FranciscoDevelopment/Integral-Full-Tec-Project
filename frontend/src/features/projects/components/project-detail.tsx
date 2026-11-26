"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useSession } from "@/features/auth/hooks/use-session";
import { getProjectContributions } from "@/features/contributions/api";
import {
  Badge,
  buttonStyles,
  ErrorState,
  LoadingState,
} from "@/shared/components/ui";
import { useResource } from "@/shared/hooks/use-resource";
import { formatDate } from "@/shared/lib/date";
import { getProject } from "../api";
import { getProjectErrorMessage } from "../errors";
import {
  PROJECT_KIND_LABELS,
  PROJECT_STATUS_BADGES,
  PROJECT_STATUS_LABELS,
  type Project,
} from "../types";
import { formatMoney } from "../utils";
import { DeleteProjectButton } from "./delete-project-button";
import { ProgressBar } from "./progress-bar";
import { VisibilityToggle } from "./visibility-toggle";

interface ProjectDetailData {
  project: Project;
  // null when the total could not be loaded: the page still works without the bar
  raised: number | null;
}

async function loadDetail(id: string): Promise<ProjectDetailData> {
  const project = await getProject(id);

  // The total belongs to Contributions (D5): if it fails, only the bar is left out
  const raised = await getProjectContributions(id, 1, 1)
    .then((list) => Number(list.totalAmount))
    .catch(() => null);

  return { project, raised };
}

export function ProjectDetail({ projectId }: { projectId: string }) {
  const router = useRouter();
  const { session } = useSession();
  const load = useCallback(() => loadDetail(projectId), [projectId]);
  const { data, error, isLoading, reload } = useResource(
    load,
    getProjectErrorMessage,
  );

  if (isLoading) {
    return <LoadingState label="Cargando proyecto..." />;
  }

  if (error || !data) {
    return (
      <ErrorState
        title="No pudimos mostrar el proyecto"
        message={error ?? "Ocurrió un error inesperado."}
        onRetry={reload}
      />
    );
  }

  const { project, raised } = data;
  const user = session?.user;
  const isOwner = user?.id === project.ownerId;
  const isActive = project.status === "active";
  const base = `/projects/${project.id}`;

  return (
    <article aria-labelledby="project-title" className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <p className="flex flex-wrap items-center gap-2">
          <Badge>{PROJECT_KIND_LABELS[project.kind]}</Badge>
          <Badge variant={PROJECT_STATUS_BADGES[project.status]}>
            {PROJECT_STATUS_LABELS[project.status]}
          </Badge>
        </p>
        <h2
          id="project-title"
          className="text-3xl font-semibold text-slate-900"
        >
          {project.title}
        </h2>
        <p className="text-sm text-slate-600">
          Creado por <span className="font-medium">{project.owner.name}</span>{" "}
          el {formatDate(project.createdAt)}
        </p>
      </header>

      <section className="grid gap-8 md:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-4">
          <p className="whitespace-pre-line text-slate-800">
            {project.description}
          </p>
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline"
          >
            Ver repositorio
            <ExternalLink aria-hidden className="size-4" />
          </a>
        </div>

        <aside className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          {project.goalAmount > 0 && raised !== null ? (
            <ProgressBar raised={raised} goal={project.goalAmount} />
          ) : (
            <p className="text-sm text-slate-600">
              Meta:{" "}
              <span className="font-semibold text-slate-900">
                {project.goalAmount > 0
                  ? formatMoney(project.goalAmount)
                  : "este proyecto no busca aportes"}
              </span>
            </p>
          )}

          <nav aria-label="Acciones del proyecto" className="flex flex-col gap-2">
            {isOwner && (
              <>
                <Link href={`${base}/edit`} className={buttonStyles()}>
                  Editar proyecto
                </Link>
                <Link
                  href={`${base}/collaborations`}
                  className={buttonStyles({ variant: "outline" })}
                >
                  Ver solicitudes de ayuda
                </Link>
                <DeleteProjectButton
                  projectId={project.id}
                  projectTitle={project.title}
                  onDeleted={() => router.push("/profile")}
                />
              </>
            )}

            {isActive && !isOwner && user?.role === "user" && (
              <Link href={`${base}/collaborate`} className={buttonStyles()}>
                Quiero ayudar
              </Link>
            )}

            {isActive && user?.role === "sponsor" && (
              <Link href={`${base}/contribute`} className={buttonStyles()}>
                Aportar
              </Link>
            )}

            {!user && isActive && (
              <Link
                href={`/login?callbackUrl=${encodeURIComponent(base)}`}
                className={buttonStyles({ variant: "outline" })}
              >
                Iniciá sesión para ayudar o aportar
              </Link>
            )}

            {user?.role === "admin" && (
              <VisibilityToggle project={project} onChanged={reload} />
            )}
          </nav>
        </aside>
      </section>
    </article>
  );
}
