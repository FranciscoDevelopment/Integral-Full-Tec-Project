"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import {
  getCurrentSession,
  logout as logoutRequest,
  signin,
  signup,
} from "../api";
import type { Session } from "../types";

interface SessionContextValue {
  session: Session | null;
  isLoading: boolean;
  error: Error | null;
  login(input: Parameters<typeof signin>[0]): Promise<void>;
  register(input: Parameters<typeof signup>[0]): Promise<void>;
  logout(): Promise<void>;
}

export const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const initialSessionRequest = useRef<ReturnType<
    typeof getCurrentSession
  > | null>(null);

  useEffect(() => {
    let ignore = false;
    const request =
      initialSessionRequest.current ??
      (initialSessionRequest.current = getCurrentSession());

    void request.then(
      (currentSession) => {
        if (!ignore) {
          setSession(currentSession);
          setIsLoading(false);
        }
      },
      (requestError: unknown) => {
        if (!ignore) {
          setError(
            requestError instanceof Error
              ? requestError
              : new Error(String(requestError)),
          );
          setIsLoading(false);
        }
      },
    );

    return () => {
      ignore = true;
    };
  }, []);

  const login = useCallback(async (input: Parameters<typeof signin>[0]) => {
    const { user, expiresAt } = await signin(input);
    setSession({ user, expiresAt });
    setError(null);
  }, []);

  const register = useCallback(async (input: Parameters<typeof signup>[0]) => {
    const { user, expiresAt } = await signup(input);
    setSession({ user, expiresAt });
    setError(null);
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    setSession(null);
    setError(null);
  }, []);

  const value = useMemo(
    () => ({ session, isLoading, error, login, register, logout }),
    [session, isLoading, error, login, register, logout],
  );

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}
