import { MODALITIES, type Modality } from "@/shared/types";
import { toOptions } from "./to-options";

export const MODALITY_LABELS: Record<Modality, string> = {
  remote: "Remoto",
  hybrid: "Híbrido",
  onsite: "Presencial",
};

export const MODALITY_OPTIONS = toOptions(MODALITIES, MODALITY_LABELS);
