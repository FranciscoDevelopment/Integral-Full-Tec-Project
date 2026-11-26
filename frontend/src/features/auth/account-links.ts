import {
  Handshake,
  HandCoins,
  FolderOpen,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/shared/types";

export interface AccountLink {
  label: string;
  href: string;
  icon: LucideIcon;
}

// Each role only sees the screens it can use: the API answers 403 to the rest.
// Shared by the desktop dropdown and the mobile panel.
export function getAccountLinks(role: Role): AccountLink[] {
  const links: AccountLink[] = [
    { label: "Mi perfil", href: "/profile", icon: UserRound },
  ];

  // Only the user role publishes projects
  if (role === "user") {
    links.push({ label: "Mis proyectos", href: "/projects/mine", icon: FolderOpen });
  }

  links.push({ label: "Mis colaboraciones", href: "/collaborations", icon: Handshake });

  if (role === "sponsor") {
    links.push({ label: "Mis aportes", href: "/me/contributions", icon: HandCoins });
  }

  if (role === "admin") {
    links.push({ label: "Moderar proyectos", href: "/admin/projects", icon: ShieldCheck });
  }

  return links;
}
