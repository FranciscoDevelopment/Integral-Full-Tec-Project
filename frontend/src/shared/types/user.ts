import type { Role } from "./enums";

// `password` exists only in the back and never reaches the front.
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "active" | "suspended";
  companyName: string | null;
  logoUrl: string | null;
  website: string | null;
  createdAt: string;
  updatedAt: string;
}
