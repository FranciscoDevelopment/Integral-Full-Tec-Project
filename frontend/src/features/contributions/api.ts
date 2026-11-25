import { apiGet, apiPost } from "@/shared/lib/api-client";
import type {
  Contribution,
  ContributionListResponse,
  ContributionPreview,
  ProjectContributionListResponse,
} from "./types";

export function previewContribution(amount: string, signal?: AbortSignal) {
  return apiGet<ContributionPreview>(
    "/contributions/preview",
    { amount },
    signal,
  );
}

export function createContribution(projectId: string, amount: string) {
  return apiPost<Contribution>(
    `/projects/${encodeURIComponent(projectId)}/contributions`,
    { amount },
  );
}

export function getProjectContributions(
  projectId: string,
  page = 1,
  limit = 20,
  signal?: AbortSignal,
) {
  return apiGet<ProjectContributionListResponse>(
    `/projects/${encodeURIComponent(projectId)}/contributions`,
    { page, limit },
    signal,
  );
}

export function getMyContributions(page = 1, limit = 20) {
  return apiGet<ContributionListResponse>("/me/contributions", { page, limit });
}
