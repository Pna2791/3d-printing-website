import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    return [
      {
        source: "/en/bao-gia-in-3d",
        destination: "/en/3d-printing-quote",
        permanent: true,
      },
      {
        source: "/en/bao-gia-in-3d/:path*",
        destination: "/en/3d-printing-quote",
        permanent: true,
      },
    ];
  },
  /**
   * Default is 10 MB; without this, `middleware` + large `POST` bodies (e.g. STL uploads to
   * `/api/slicer`) are truncated and `request.formData()` fails. Keep slightly above the route’s
   * own `MAX_UPLOAD_BYTES` (50 MB) to allow multipart overhead.
   * @see https://nextjs.org/docs/app/api-reference/config/next-config-js/middlewareClientMaxBodySize
   */
  experimental: {
    middlewareClientMaxBodySize: "55mb",
  },
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
