import type { Metadata } from "next";

import { QuoteRoutePage } from "@/components/quote/QuoteRoutePage";
import { getQuoteCanonicalUrl, SEO_KEYWORDS, SITE_BRAND } from "@/lib/seo";

export const dynamic = "force-dynamic";

/** Legacy `/quote` — không index; canonical trỏ về slug tiếng Việt. */
const legacyTitle = "Báo giá in 3D (legacy /quote) | NA 3D SHOP";
const legacyDescription =
  "Đường dẫn /quote giữ cho liên kết cũ & dev. Trang SEO chính: /bao-gia-in-3d — báo giá in 3D online, ship toàn quốc.";

const canonical = getQuoteCanonicalUrl();

export const metadata: Metadata = {
  title: { absolute: legacyTitle },
  description: legacyDescription,
  keywords: [...SEO_KEYWORDS, "báo giá STL", SITE_BRAND],
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical,
  },
  openGraph: {
    title: legacyTitle,
    description: legacyDescription,
    url: canonical,
    type: "website",
  },
  twitter: {
    title: legacyTitle,
    description: legacyDescription,
  },
};

export default function QuotePage() {
  return <QuoteRoutePage />;
}
