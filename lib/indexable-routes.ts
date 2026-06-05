import type { MetadataRoute } from "next";

import { QUOTE_EN_SEO_PATH, QUOTE_SEO_PATH } from "@/lib/seo";

type ChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;

export type IndexableRoute = {
  /** App Router pathname (leading slash). */
  path: string;
  changeFrequency: ChangeFrequency;
  priority: number;
  /** Hreflang pair — both locale URLs are emitted with shared alternates. */
  alternates?: {
    "vi-VN": string;
    "en-US": string;
  };
};

/** Public, SEO-targeted routes included in `/sitemap.xml`. */
export const INDEXABLE_ROUTES: readonly IndexableRoute[] = [
  {
    path: "/",
    changeFrequency: "weekly",
    priority: 1,
    alternates: { "vi-VN": "/", "en-US": "/en" },
  },
  {
    path: "/en",
    changeFrequency: "weekly",
    priority: 1,
    alternates: { "vi-VN": "/", "en-US": "/en" },
  },
  {
    path: QUOTE_SEO_PATH,
    changeFrequency: "weekly",
    priority: 0.9,
    alternates: { "vi-VN": QUOTE_SEO_PATH, "en-US": QUOTE_EN_SEO_PATH },
  },
  {
    path: QUOTE_EN_SEO_PATH,
    changeFrequency: "weekly",
    priority: 0.9,
    alternates: { "vi-VN": QUOTE_SEO_PATH, "en-US": QUOTE_EN_SEO_PATH },
  },
  {
    path: "/materials",
    changeFrequency: "monthly",
    priority: 0.8,
    alternates: { "vi-VN": "/materials", "en-US": "/en/materials" },
  },
  {
    path: "/en/materials",
    changeFrequency: "monthly",
    priority: 0.8,
    alternates: { "vi-VN": "/materials", "en-US": "/en/materials" },
  },
] as const;

/** Path prefixes blocked in `/robots.txt` (admin, legacy quote, APIs). */
export const ROBOTS_DISALLOW_PATHS = ["/admin/", "/quote", "/api/"] as const;
