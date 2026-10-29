import { SENIORITIES, type Seniority } from "@/shared/types";
import { toOptions } from "./to-options";

export const SENIORITY_LABELS: Record<Seniority, string> = {
  trainee: "Trainee",
  junior: "Junior",
  mid: "Semi Senior",
  senior: "Senior",
};

export const SENIORITY_OPTIONS = toOptions(SENIORITIES, SENIORITY_LABELS);
