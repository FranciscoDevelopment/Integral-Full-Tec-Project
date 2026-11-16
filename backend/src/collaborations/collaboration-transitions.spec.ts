import { CollaborationStatus } from 'src/generated/prisma/enums';
import {
  ALLOWED_TRANSITIONS,
  canTransition,
} from './collaboration-transitions';

describe('collaboration transitions', () => {
  const { pending, accepted, confirmed, rejected } = CollaborationStatus;

  it.each([
    [pending, accepted],
    [pending, rejected],
    [accepted, confirmed],
  ])('allows %s -> %s', (from, to) => {
    expect(canTransition(from, to)).toBe(true);
  });

  it.each([
    [pending, pending],
    [pending, confirmed],
    [accepted, pending],
    [accepted, accepted],
    [accepted, rejected],
    [confirmed, pending],
    [confirmed, accepted],
    [confirmed, rejected],
    [confirmed, confirmed],
    [rejected, pending],
    [rejected, accepted],
    [rejected, confirmed],
    [rejected, rejected],
  ])('rejects %s -> %s', (from, to) => {
    expect(canTransition(from, to)).toBe(false);
  });

  it('confirmed and rejected are terminal states', () => {
    expect(ALLOWED_TRANSITIONS[confirmed]).toEqual([]);
    expect(ALLOWED_TRANSITIONS[rejected]).toEqual([]);
  });
});
