import { ExternalLink } from "lucide-react";
import { COMMUNITY_LINKS } from "@/shared/catalogs/community-links";
import { CHANNEL_ICONS } from "@/shared/components/channel-icons";
import { Card } from "@/shared/components/ui/card";

export function CommunityLinksGrid() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {COMMUNITY_LINKS.map((link) => {
        const Icon = CHANNEL_ICONS[link.channel];

        return (
          <li key={link.channel}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block h-full rounded-2xl"
            >
              <Card className="flex h-full items-start gap-4 transition-colors group-hover:border-brand-300 group-hover:bg-brand-50/40">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                  <Icon aria-hidden className="size-6" />
                </span>
                <div className="flex flex-col gap-1">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {link.label}
                    <ExternalLink
                      aria-hidden
                      className="ml-2 inline size-4 align-[-0.125em] text-slate-400 transition-colors group-hover:text-brand-600"
                    />
                  </h2>
                  <p className="text-sm text-slate-600">{link.description}</p>
                </div>
              </Card>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
