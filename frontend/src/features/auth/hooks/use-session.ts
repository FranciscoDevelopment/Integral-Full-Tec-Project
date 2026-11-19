"use client";

import { useContext } from "react";
import { SessionContext } from "../components/session-provider";

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider.");
  }
  return context;
}
