const DEFAULT_LATENCY_MS = 300;

// Simulates network latency in each feature's api.ts so loading states get exercised.
export function delay(ms: number = DEFAULT_LATENCY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
