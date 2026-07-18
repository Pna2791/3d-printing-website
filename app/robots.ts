import type { MetadataRoute } from "next";

import { ROBOTS_DISALLOW_PATHS } from "@/lib/indexable-routes";
import { getSiteUrl } from "@/lib/seo";

/** Resolve site origin at request time so `Sitemap:` points at the live host. */
export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [...ROBOTS_DISALLOW_PATHS],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
