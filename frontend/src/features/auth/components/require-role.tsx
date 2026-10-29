import type { ReactNode } from "react";
import type { Role } from "@/shared/types";
import { SessionGuard } from "./session-guard";

interface RequireRoleProps {
  children: ReactNode;
  role: Role;
}

export function RequireRole({ children, role }: RequireRoleProps) {
  return <SessionGuard role={role}>{children}</SessionGuard>;
}
