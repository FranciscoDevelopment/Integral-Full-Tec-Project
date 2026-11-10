import { CollaborationStatus } from 'src/generated/prisma/enums';

// State machine: pending -> accepted | rejected, accepted -> confirmed
export const ALLOWED_TRANSITIONS: Record<CollaborationStatus, CollaborationStatus[]> = {
  [CollaborationStatus.pending]: [CollaborationStatus.accepted, CollaborationStatus.rejected],
  [CollaborationStatus.accepted]: [CollaborationStatus.confirmed],
  [CollaborationStatus.confirmed]: [],
  [CollaborationStatus.rejected]: [],
};

export function canTransition(from: CollaborationStatus, to: CollaborationStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}