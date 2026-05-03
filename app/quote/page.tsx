import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { GrandOpeningQuotePromo } from "@/components/quote/GrandOpeningQuotePromo";
import { QuotePageBrand } from "@/components/quote/QuotePageBrand";
import { QuoteEstimatorClient } from "@/components/quote/QuoteEstimatorClient";
import { getSiteUrl, SEO_KEYWORDS, SITE_BRAND } from "@/lib/seo";
import { getWorkshopInfo } from "@/services/workshopService";

export const dynamic = "force-dynamic";

const quoteTitleAbsolute =
  "Báo giá in 3D online toàn quốc — STL, PLA / PETG / PETG-CF / TPU | NA 3D SHOP";
const quoteDescription =
  "Báo giá in 3D online, giá rẻ — ưu đãi sinh viên, ship COD toàn quốc, ưu đãi thêm cho khách TP.HCM. Tải STL, xem gam & giá tức thì; tư vấn ABS & nhựa kỹ thuật với máy buồng kín.";

export const metadata: Metadata = {
  title: { absolute: quoteTitleAbsolute },
  description: quoteDescription,
  keywords: [...SEO_KEYWORDS, "báo giá STL", "slice online", SITE_BRAND],
  alternates: {
    canonical: "/quote",
  },
  openGraph: {
    title: quoteTitleAbsolute,
    description: quoteDescription,
    url: `${getSiteUrl()}/quote`,
    type: "website",
  },
  twitter: {
    title: quoteTitleAbsolute,
    description: quoteDescription,
  },
};

export default async function QuotePage() {
  const workshopRes = await getWorkshopInfo();

  return (
    <main className="min-h-screen bg-zinc-900 px-4 py-12 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-zinc-100 transition hover:border-emerald-500 hover:bg-zinc-900"
          >
            <ArrowLeft className="h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
            Về trang chủ
          </Link>
        </div>

        <header className="mb-10 border-b border-zinc-800 pb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
            Báo giá file in 3D
          </h1>
          <p className="mt-3 max-w-2xl text-zinc-400">
            Tải file STL để hệ thống slice và ước tính thời gian, lượng nhựa và giá theo bảng giá
            PLA, PETG, PETG-CF, TPU (người thường / sinh viên).{" "}
            <Link href="/materials" className="font-semibold text-emerald-400 hover:text-emerald-300">
              Hướng dẫn chọn nhựa
            </Link>
            .
          </p>
        </header>

        <QuotePageBrand
          workshopRows={workshopRes.data ?? []}
          workshopError={workshopRes.error}
          surface="dark"
        />

        <GrandOpeningQuotePromo />

        <QuoteEstimatorClient />
      </div>
    </main>
  );
}
