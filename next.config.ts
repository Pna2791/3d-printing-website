import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /**
   * Captured at `next build` only (Supabase project URL — not the anon key).
   * Next.js forbids `__*` keys here; `warnIfPublicSupabaseUrlDiffersFromBuild()` compares this
   * to runtime `NEXT_PUBLIC_SUPABASE_URL` on the server.
   */
  env: {
    SUPABASE_PUBLIC_URL_AT_BUILD: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  },
};

export default nextConfig;
