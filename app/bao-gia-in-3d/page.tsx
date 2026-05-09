import type { Metadata } from "next";

import { QuoteRoutePage } from "@/components/quote/QuoteRoutePage";
import { getQuoteCanonicalUrl, QUOTE_EN_SEO_PATH, SEO_KEYWORDS, SITE_BRAND } from "@/lib/seo";

export const dynamic = "force-dynamic";

const quoteSeoTitleAbsolute = `In 3D giá rẻ HCM (Thủ Đức) | Báo giá online | ${SITE_BRAND}`;
const quoteSeoDescription =
  "Dịch vụ in 3D giá rẻ HCM, Thủ Đức cho sinh viên & kỹ sư. Báo giá online lấy liền, ship COD toàn quốc. Chuyên in ABS buồng kín, PLA, PETG-CF.";

const canonical = getQuoteCanonicalUrl();

export const metadata: Metadata = {
  title: { absolute: quoteSeoTitleAbsolute },
  description: quoteSeoDescription,
  keywords: [...SEO_KEYWORDS, "báo giá STL", "slice online", SITE_BRAND, "báo giá in 3D"],
  alternates: {
    canonical,
    languages: {
      "vi-VN": "/bao-gia-in-3d",
      "en-US": QUOTE_EN_SEO_PATH,
      "x-default": "/bao-gia-in-3d",
    },
  },
  openGraph: {
    title: quoteSeoTitleAbsolute,
    description: quoteSeoDescription,
    url: canonical,
    type: "website",
  },
  twitter: {
    title: quoteSeoTitleAbsolute,
    description: quoteSeoDescription,
  },
};

export default function BaoGiaIn3DPage() {
  return <QuoteRoutePage />;
}
