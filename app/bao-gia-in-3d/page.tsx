import type { Metadata } from "next";

import { QuoteRoutePage } from "@/components/quote/QuoteRoutePage";
import { getQuoteCanonicalUrl, SEO_KEYWORDS, SITE_BRAND } from "@/lib/seo";

export const dynamic = "force-dynamic";

const quoteSeoTitleAbsolute =
  "Báo Giá In 3D Online Lấy Liền | NA 3D SHOP - Toàn Quốc & Sinh Viên";
const quoteSeoDescription =
  "Công cụ báo giá in 3D trực tuyến chính xác nhất. Hỗ trợ nhựa PLA, PETG, ABS, TPU. Ưu đãi riêng cho sinh viên và khách hàng tại TP.HCM.";

const canonical = getQuoteCanonicalUrl();

export const metadata: Metadata = {
  title: { absolute: quoteSeoTitleAbsolute },
  description: quoteSeoDescription,
  keywords: [...SEO_KEYWORDS, "báo giá STL", "slice online", SITE_BRAND, "báo giá in 3D"],
  alternates: {
    canonical,
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
