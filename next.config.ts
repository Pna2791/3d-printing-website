import type { NextConfig } from "next";

function supabaseStorageImageHostname(): string | null {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!raw) return null;
  try {
    return new URL(raw).hostname;
  } catch {
    return null;
  }
}

const galleryImageRemote = supabaseStorageImageHostname();

/** Patterns for Supabase Storage public URLs + any project-specific host from env (e.g. custom domain). */
function imageRemotePatterns(): { protocol: "https"; hostname: string; pathname: string }[] {
  const patterns: { protocol: "https"; hostname: string; pathname: string }[] = [
    // Hosted Supabase projects (`xxxx.supabase.co`) — works even when NEXT_PUBLIC_SUPABASE_URL was missing at build time.
    { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
  ];
  if (galleryImageRemote && !galleryImageRemote.endsWith(".supabase.co")) {
    patterns.push({
      protocol: "https",
      hostname: galleryImageRemote,
      pathname: "/storage/v1/object/public/**",
    });
  }
  return patterns;
}

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
  images: {
    remotePatterns: imageRemotePatterns(),
  },
};

export default nextConfig;
