import type { Role } from "./enums";

// `password` exists only in the back and never reaches the front.
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}
