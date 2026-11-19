import type { NextConfig } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

// NEXT_PUBLIC_API_URL is baked into the bundle at build time. If it is missing in the hosting
// panel, site.ts silently falls back to localhost and the deployed site "works" but every request
// fails in the visitor's browser: better to stop the build with a clear message
export default function config(phase: string): NextConfig {
  if (phase === PHASE_PRODUCTION_BUILD && !process.env.NEXT_PUBLIC_API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not set: the production build would point the site at localhost. " +
        "Set it to the public URL of the API (https://...) and build again.",
    );
  }

  return nextConfig;
}
