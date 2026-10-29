import type { NewsCategory, Province } from "./enums";

export interface News {
  id: string;
  title: string;
  category: NewsCategory;
  province: Province;
  url: string;
  clicks: number;
  publishedAt: string;
  authorId: string;
}
