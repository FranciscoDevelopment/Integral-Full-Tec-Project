import { NEWS_CATEGORIES, type NewsCategory } from "@/shared/types";
import { toOptions } from "./to-options";

export const NEWS_CATEGORY_LABELS: Record<NewsCategory, string> = {
  scholarship: "Becas",
  course: "Cursos",
  event: "Eventos",
  discount: "Descuentos",
  community: "Comunidad",
};

export const NEWS_CATEGORY_OPTIONS = toOptions(
  NEWS_CATEGORIES,
  NEWS_CATEGORY_LABELS,
);
