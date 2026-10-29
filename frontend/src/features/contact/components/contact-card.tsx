import { Mail } from "lucide-react";
import { Card } from "@/shared/components/ui/card";
import { CONTACT_EMAIL } from "@/shared/constants/site";
import { CopyEmailButton } from "./copy-email-button";

export function ContactCard() {
  return (
    <Card className="flex max-w-xl flex-col gap-4">
      <span className="flex size-12 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
        <Mail aria-hidden className="size-6" />
      </span>
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-slate-900">
          Escribinos por mail
        </h2>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="break-all text-brand-700 underline-offset-4 hover:underline"
        >
          {CONTACT_EMAIL}
        </a>
      </div>
      <div>
        <CopyEmailButton email={CONTACT_EMAIL} />
      </div>
    </Card>
  );
}
