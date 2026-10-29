"use client";

import type { ReactNode } from "react";
import { Toaster } from "sonner";

// Single place for app-wide client providers. D2 adds the session store rehydration here.
export function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster position="bottom-center" richColors closeButton />
    </>
  );
}
