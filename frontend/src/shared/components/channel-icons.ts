import { Briefcase, Camera, MessageCircle, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { CommunityChannel } from "@/shared/catalogs/community-links";

// lucide has no brand icons, so each channel gets the closest generic one.
export const CHANNEL_ICONS: Record<CommunityChannel, LucideIcon> = {
  whatsapp: MessageCircle,
  linkedin: Users,
  instagram: Camera,
  jobs_linkedin: Briefcase,
};
