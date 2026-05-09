import type { Metadata } from "next";

import { QuoteRoutePage } from "@/components/quote/QuoteRoutePage";
import { getEnglishQuoteCanonicalUrl, SITE_BRAND } from "@/lib/seo";

export const dynamic = "force-dynamic";

const titleAbsolute = `Online 3D Printing Quote | Vietnam 3D Printing Service | ${SITE_BRAND}`;
const description =
  "Get an online 3D printing quote for affordable ABS, PLA, PETG, PETG-CF, and TPU in Vietnam. Instant STL upload, VND/USD estimates, and international shipping guidance — NA 3D SHOP global support.";

export const metadata: Metadata = {
  title: { absolute: titleAbsolute },
  description,
  keywords: [
    "Online 3D Printing Quote",
    "Vietnam 3D Printing Service",
    "Affordable ABS",
    "Affordable PLA",
    "STL quote Vietnam",
    "FDM 3D printing",
    SITE_BRAND,
  ],
  alternates: {
    canonical: "/en/3d-printing-quote",
    languages: {
      "vi-VN": "/bao-gia-in-3d",
      "en-US": "/en/3d-printing-quote",
      "x-default": "/bao-gia-in-3d",
    },
  },
  openGraph: {
    title: titleAbsolute,
    description,
    url: getEnglishQuoteCanonicalUrl(),
    type: "website",
    locale: "en_US",
  },
  twitter: {
    title: titleAbsolute,
    description,
  },
};

export default function EnQuotePage() {
  return (
    <QuoteRoutePage locale="en" homeHref="/en" materialsHref="/en/materials" />
  );
}
