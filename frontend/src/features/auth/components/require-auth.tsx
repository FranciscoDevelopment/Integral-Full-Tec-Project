import type { ReactNode } from "react";
import { SessionGuard } from "./session-guard";

export function RequireAuth({ children }: { children: ReactNode }) {
  return <SessionGuard>{children}</SessionGuard>;
}
