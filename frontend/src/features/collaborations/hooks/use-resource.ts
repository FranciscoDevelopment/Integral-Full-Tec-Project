"use client";

import { useEffect, useState } from "react";
import { getErrorMessage } from "../api";

interface ResourceResult<T> {
  key: number;
  data?: T;
  error?: string;
}

// Loads data once and again on reload(). `load` must be a stable reference.
export function useResource<T>(load: () => Promise<T>) {
  const [reloadKey, setReloadKey] = useState(0);
  const [result, setResult] = useState<ResourceResult<T> | null>(null);

  useEffect(() => {
    let isActive = true;

    load()
      .then((data) => {
        if (isActive) setResult({ key: reloadKey, data });
      })
      .catch((error: unknown) => {
        if (isActive) setResult({ key: reloadKey, error: getErrorMessage(error) });
      });

    return () => {
      isActive = false;
    };
  }, [load, reloadKey]);

  const isLoading = result === null || result.key !== reloadKey;

  return {
    data: isLoading ? undefined : result?.data,
    error: isLoading ? undefined : result?.error,
    isLoading,
    reload: () => setReloadKey((key) => key + 1),
  };
}