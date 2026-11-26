import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "@/shared/components/ui";
import {
  PROJECT_KIND_LABELS,
  PROJECT_STATUS_BADGES,
  PROJECT_STATUS_LABELS,
  type Project,
} from "../types";
import { formatMoney } from "../utils";

interface ProjectCardProps {
  project: Project;
  // Extra buttons under the card, e.g. edit and delete in "Mis proyectos"
  actions?: ReactNode;
}

export function ProjectCard({ project, actions }: ProjectCardProps) {
  const titleId = `project-${project.id}-title`;

  return (
    <article
      aria-labelledby={titleId}
      className="flex h-full flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <header className="flex flex-wrap items-center gap-2">
        <Badge>{PROJECT_KIND_LABELS[project.kind]}</Badge>
        {project.status !== "active" && (
          <Badge variant={PROJECT_STATUS_BADGES[project.status]}>
            {PROJECT_STATUS_LABELS[project.status]}
          </Badge>
        )}
      </header>

      <h3 id={titleId} className="text-lg font-semibold text-slate-900">
        <Link
          href={`/projects/${project.id}`}
          className="hover:text-brand-700 hover:underline"
        >
          {project.title}
        </Link>
      </h3>

      <p className="line-clamp-3 text-sm text-slate-600">
        {project.description}
      </p>

      <dl className="mt-auto grid grid-cols-2 gap-2 text-sm">
        <dt className="text-slate-500">Meta</dt>
        <dd className="text-right font-medium text-slate-900">
          {project.goalAmount > 0 ? formatMoney(project.goalAmount) : "Sin meta"}
        </dd>
        <dt className="text-slate-500">Creado por</dt>
        <dd className="text-right text-slate-900">{project.owner.name}</dd>
      </dl>

      {actions && (
        <footer className="flex flex-wrap gap-2 border-t border-slate-100 pt-3">
          {actions}
        </footer>
      )}
    </article>
  );
}

interface ProjectGridProps {
  projects: Project[];
  label: string;
  renderActions?: (project: Project) => ReactNode;
}

export function ProjectGrid({ projects, label, renderActions }: ProjectGridProps) {
  return (
    <ul aria-label={label} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <li key={project.id}>
          <ProjectCard project={project} actions={renderActions?.(project)} />
        </li>
      ))}
    </ul>
  );
}
