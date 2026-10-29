import type { ItArea, Province, Seniority } from "./enums";

export interface JobAlert {
  id: string;
  name: string;
  areas: ItArea[];
  provinces: Province[];
  seniorities: Seniority[];
  skills: string[];
  active: boolean;
  userId: string;
}
