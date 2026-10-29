import { CHANNEL_ICONS } from "@/shared/components/channel-icons";
import { PageContainer } from "@/shared/components/layout/page-container";
import { Card } from "@/shared/components/ui/card";
import { CHANNEL_STATS, TOTAL_MEMBERS } from "../stats";
import { formatMemberCount } from "../utils";

export function CommunityCounters() {
  return (
    <PageContainer className="flex flex-col items-center gap-8 py-12 text-center">
      <div className="flex flex-col items-center gap-1">
        <p className="text-5xl font-bold tracking-tight text-brand-700">
          {formatMemberCount(TOTAL_MEMBERS)}
        </p>
        <p className="text-lg text-slate-600">
          personas ya son parte de la comunidad.
        </p>
      </div>
      <ul className="grid w-full gap-4 sm:grid-cols-3">
        {CHANNEL_STATS.map((stat) => {
          const Icon = CHANNEL_ICONS[stat.channel];

          return (
            <li key={stat.channel}>
              <Card className="flex flex-col items-center gap-2 p-5">
                <Icon aria-hidden className="size-6 text-brand-600" />
                <p className="text-2xl font-semibold text-slate-900">
                  {formatMemberCount(stat.members)}
                </p>
                <p className="text-sm text-slate-600">{stat.label}</p>
              </Card>
            </li>
          );
        })}
      </ul>
    </PageContainer>
  );
}
