// Enum values are part of the front/back contract: English snake_case, same on both sides.
// Spanish UI labels live in shared/catalogs.

export const ROLES = ["admin", "user"] as const;
export type Role = (typeof ROLES)[number];

export const OFFER_STATUSES = ["pending", "approved", "rejected"] as const;
export type OfferStatus = (typeof OFFER_STATUSES)[number];

export const SENIORITIES = ["trainee", "junior", "mid", "senior"] as const;
export type Seniority = (typeof SENIORITIES)[number];

export const MODALITIES = ["remote", "hybrid", "onsite"] as const;
export type Modality = (typeof MODALITIES)[number];

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

// The 24 jurisdictions (23 provinces + CABA) as slugs without accents.
export const PROVINCES = [
  "caba",
  "buenos_aires",
  "catamarca",
  "chaco",
  "chubut",
  "cordoba",
  "corrientes",
  "entre_rios",
  "formosa",
  "jujuy",
  "la_pampa",
  "la_rioja",
  "mendoza",
  "misiones",
  "neuquen",
  "rio_negro",
  "salta",
  "san_juan",
  "san_luis",
  "santa_cruz",
  "santa_fe",
  "santiago_del_estero",
  "tierra_del_fuego",
  "tucuman",
] as const;
export type Province = (typeof PROVINCES)[number];
