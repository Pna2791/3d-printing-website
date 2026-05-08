import type { Metadata } from "next";

import { QuoteRoutePage } from "@/components/quote/QuoteRoutePage";
import { getSiteUrl, SITE_BRAND } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: `Online 3D Printing Quote | ${SITE_BRAND}` },
  description:
    "Instant online 3D printing quote in Vietnam (HCMC / Thu Duc). Upload STL to estimate print time, material usage, and price. Custom ABS parts manufacturing (enclosed chamber), PLA, PETG-CF.",
  keywords: [
    "Online 3D Printing Quote",
    "Affordable 3D Printing Service Vietnam",
    "Custom ABS parts manufacturing",
    "STL quote Vietnam",
  ],
  alternates: {
    canonical: "/en/bao-gia-in-3d",
    languages: {
      "vi-VN": "/bao-gia-in-3d",
      "en-US": "/en/bao-gia-in-3d",
    },
  },
  openGraph: {
    title: `Online 3D Printing Quote | ${SITE_BRAND}`,
    description:
      "Upload STL to estimate print time, material usage, and price. ABS (enclosed), PLA, PETG-CF.",
    url: `${getSiteUrl()}/en/bao-gia-in-3d`,
    type: "website",
    locale: "en_US",
  },
};

export default function EnQuotePage() {
  // Reuse the same tool UI; copy will be translated incrementally.
  return <QuoteRoutePage />;
}

