import { IT_AREAS, type ItArea } from "@/shared/types";
import { toOptions } from "./to-options";

export const AREA_LABELS: Record<ItArea, string> = {
  frontend: "Frontend",
  backend: "Backend",
  fullstack: "Fullstack",
  mobile: "Mobile",
  design: "Diseño",
  qa: "QA",
  devops: "DevOps",
  data: "Datos",
  security: "Seguridad",
  product: "Producto",
  support: "Soporte",
};

export const AREA_OPTIONS = toOptions(IT_AREAS, AREA_LABELS);
