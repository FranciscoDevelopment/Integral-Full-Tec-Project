import { ROLES, type Role } from "@/shared/types";
import { toOptions } from "./to-options";

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrador",
  user: "Usuario",
};

export const ROLE_OPTIONS = toOptions(ROLES, ROLE_LABELS);
