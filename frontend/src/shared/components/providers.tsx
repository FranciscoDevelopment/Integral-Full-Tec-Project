"use client";

import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { SessionProvider } from "@/features/auth/components/session-provider";

// App-wide providers for shared client state.
export function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      <SessionProvider>{children}</SessionProvider>
      <Toaster position="bottom-center" richColors closeButton />
    </>
  );
}
