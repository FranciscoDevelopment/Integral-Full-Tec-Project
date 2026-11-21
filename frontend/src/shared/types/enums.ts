// Enum values are part of the front/back contract: English snake_case, same on both sides.
// Spanish UI labels live in shared/catalogs.

export const ROLES = ["admin", "user", "sponsor"] as const;
export type Role = (typeof ROLES)[number];

export const OFFER_STATUSES = ["pending", "approved", "rejected"] as const;
export type OfferStatus = (typeof OFFER_STATUSES)[number];


export const NEWS_CATEGORIES = [
  "scholarship",
  "course",
  "event",
  "discount",
  "community",
] as const;
export type NewsCategory = (typeof NEWS_CATEGORIES)[number];

export const IT_AREAS = [
  "frontend",
  "backend",
  "fullstack",
  "mobile",
  "design",
  "qa",
  "devops",
  "data",
  "security",
  "product",
  "support",
] as const;
export type ItArea = (typeof IT_AREAS)[number];

