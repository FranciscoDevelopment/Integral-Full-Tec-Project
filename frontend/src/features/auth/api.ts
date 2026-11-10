import { MOCK_USERS } from "@/mocks";
import { delay } from "@/shared/lib/delay";
import type { Session } from "./types";

const STUB_SESSION_USER_ID: string | null =
  "d4cffde0-dd41-4d9a-8e9e-f29e1f2ba357";
const STUB_SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

export async function getCurrentSession(): Promise<Session | null> {
  await delay();

  if (STUB_SESSION_USER_ID === null) {
    return null;
  }

  const user = MOCK_USERS.find(({ id }) => id === STUB_SESSION_USER_ID);

  if (!user) {
    throw new Error(`Stub session user "${STUB_SESSION_USER_ID}" was not found.`);
  }

  return {
    user,
    expiresAt: new Date(Date.now() + STUB_SESSION_DURATION_MS).toISOString(),
  };
}
