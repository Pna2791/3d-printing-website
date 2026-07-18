import type { MetadataRoute } from "next";

import { INDEXABLE_ROUTES } from "@/lib/indexable-routes";
import { getSiteUrl } from "@/lib/seo";

/** Resolve `NEXT_PUBLIC_SITE_URL` / `VERCEL_URL` at request time (Docker / production). */
export const dynamic = "force-dynamic";

function absolutePath(base: string, pathname: string): string {
  return `${base}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

function hreflangAlternates(
  base: string,
  pair: NonNullable<(typeof INDEXABLE_ROUTES)[number]["alternates"]>,
): MetadataRoute.Sitemap[number]["alternates"] {
  return {
    languages: {
      "vi-VN": absolutePath(base, pair["vi-VN"]),
      "en-US": absolutePath(base, pair["en-US"]),
    },
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const lastModified = new Date();

  return INDEXABLE_ROUTES.map((route) => ({
    url: absolutePath(base, route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    ...(route.alternates ? { alternates: hreflangAlternates(base, route.alternates) } : {}),
  }));
}
