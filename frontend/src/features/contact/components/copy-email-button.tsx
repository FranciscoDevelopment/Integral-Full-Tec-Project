"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";

const COPIED_FEEDBACK_MS = 2000;

export function CopyEmailButton({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeoutId = setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
    return () => clearTimeout(timeoutId);
  }, [copied]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      toast.success("Mail copiado al portapapeles");
    } catch {
      // The Clipboard API is missing on insecure origins and when permission is denied.
      toast.error("No pudimos copiar el mail. Copialo manualmente.");
    }
  }

  return (
    <Button variant="outline" onClick={handleCopy}>
      {copied ? (
        <Check aria-hidden className="size-4 text-emerald-600" />
      ) : (
        <Copy aria-hidden className="size-4" />
      )}
      {copied ? "Copiado" : "Copiar mail"}
    </Button>
  );
}
