import { Prisma } from 'src/generated/prisma/client';

export const CONTRIBUTION_SELECT = {
  id: true,
  projectId: true,
  sponsorId: true,
  amount: true,
  processingFee: true,
  status: true,
  createdAt: true,
} satisfies Prisma.ContributionSelect;

type ContributionRow = Prisma.ContributionGetPayload<{
  select: typeof CONTRIBUTION_SELECT;
}>;

export function mapContribution(contribution: ContributionRow) {
  return {
    id: contribution.id,
    projectId: contribution.projectId,
    sponsorId: contribution.sponsorId,
    amount: contribution.amount.toFixed(2),
    processingFee: contribution.processingFee.toFixed(2),
    status: contribution.status,
    createdAt: contribution.createdAt.toISOString(),
  };
}
