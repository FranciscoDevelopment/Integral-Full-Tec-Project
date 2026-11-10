"use client";

import { useEffect, useState } from "react";
import { getCurrentSession } from "../api";
import type { Session } from "../types";

interface SessionState {
  session: Session | null;
  isLoading: boolean;
  error: Error | null;
}

export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>({
    session: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let isActive = true;

    void getCurrentSession()
      .then((session) => {
        if (isActive) {
          setState({ session, isLoading: false, error: null });
        }
      })
      .catch((error: unknown) => {
        if (isActive) {
          setState({
            session: null,
            isLoading: false,
            error:
              error instanceof Error ? error : new Error(String(error)),
          });
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  return state;
}
