import type {
  ItArea,
  Modality,
  OfferStatus,
  Province,
  Seniority,
} from "./enums";

export interface JobOffer {
  id: string;
  title: string;
  company: string;
  description: string;
  area: ItArea;
  seniority: Seniority;
  modality: Modality;
  province: Province;
  skills: string[];
  applyUrl: string;
  status: OfferStatus;
  authorId: string;
  createdAt: string;
}
