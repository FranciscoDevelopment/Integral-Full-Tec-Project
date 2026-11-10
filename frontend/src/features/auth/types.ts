import type { User } from "@/shared/types";

export interface Session {
  user: User;
  expiresAt: string;
}
