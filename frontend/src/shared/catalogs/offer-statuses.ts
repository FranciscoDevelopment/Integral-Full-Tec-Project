import { OFFER_STATUSES, type OfferStatus } from "@/shared/types";
import { toOptions } from "./to-options";

export const OFFER_STATUS_LABELS: Record<OfferStatus, string> = {
  pending: "Pendiente",
  approved: "Aprobada",
  rejected: "Rechazada",
};

export const OFFER_STATUS_OPTIONS = toOptions(
  OFFER_STATUSES,
  OFFER_STATUS_LABELS,
);
