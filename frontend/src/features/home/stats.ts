import type { CommunityChannel } from "@/shared/catalogs/community-links";

export interface ChannelStat {
  channel: Exclude<CommunityChannel, "jobs_linkedin">;
  label: string;
  members: number;
}

// Static content: the home counters need no API.
export const CHANNEL_STATS: readonly ChannelStat[] = [
  { channel: "whatsapp", label: "WhatsApp", members: 1_300 },
  { channel: "linkedin", label: "LinkedIn", members: 71_000 },
  { channel: "instagram", label: "Instagram", members: 23_000 },
];

export const TOTAL_MEMBERS = CHANNEL_STATS.reduce(
  (total, stat) => total + stat.members,
  0,
);
