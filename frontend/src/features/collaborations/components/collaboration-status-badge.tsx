import { Badge } from "@/shared/components/ui";
import {
  STATUS_BADGE_VARIANTS,
  STATUS_LABELS,
  type CollaborationStatus,
} from "../types";

export function CollaborationStatusBadge({
  status,
}: {
  status: CollaborationStatus;
}) {
  return (
    <Badge variant={STATUS_BADGE_VARIANTS[status]}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}