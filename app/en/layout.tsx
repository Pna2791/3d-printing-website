import type { Metadata } from "next";

import { getSiteUrl, SITE_BRAND } from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    default: `Affordable 3D Printing Service Vietnam | Online Quote | ${SITE_BRAND}`,
    template: `%s | ${SITE_BRAND}`,
  },
  description:
    "Affordable 3D printing in Vietnam (Ho Chi Minh City / Thu Duc) for students and engineers. Instant online quote, nationwide COD shipping. Enclosed-chamber ABS, PLA, PETG-CF.",
  keywords: [
    "Affordable 3D Printing Service Vietnam",
    "Online 3D Printing Quote",
    "Custom ABS parts manufacturing",
    "FDM 3D printing Vietnam",
    "NA 3D SHOP",
  ],
  alternates: {
    canonical: "/en",
    languages: {
      "vi-VN": "/",
      "en-US": "/en",
    },
  },
  openGraph: {
    title: `Affordable 3D Printing Service Vietnam | Online Quote | ${SITE_BRAND}`,
    description:
      "Instant online 3D printing quote. Enclosed-chamber ABS, PLA, PETG-CF. Nationwide shipping in Vietnam.",
    url: `${getSiteUrl()}/en`,
    type: "website",
    locale: "en_US",
  },
};

export default function EnLayout({ children }: { children: React.ReactNode }) {
  // Root `app/layout.tsx` owns <html> and the global header.
  return children;
}

