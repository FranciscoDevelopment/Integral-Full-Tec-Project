export interface ContributionPreview {
  amount: string;
  fee: string;
  total: string;
}

export type ContributionStatus = "simulated";

export interface Contribution {
  id: string;
  projectId: string;
  sponsorId: string;
  amount: string;
  processingFee: string;
  status: ContributionStatus;
  createdAt: string;
}

export interface ContributionListResponse {
  data: Contribution[];
  meta: { total: number; page: number; limit: number };
}

export interface ProjectContributionListResponse
  extends ContributionListResponse {
  totalAmount: string;
}
