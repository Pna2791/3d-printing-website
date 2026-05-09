import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { GrandOpeningQuotePromo } from "@/components/quote/GrandOpeningQuotePromo";
import { QuoteEstimatorClient } from "@/components/quote/QuoteEstimatorClient";
import { QuotePageBrand } from "@/components/quote/QuotePageBrand";
import type { NaLocale } from "@/lib/quote-paths";
import { getWorkshopInfo } from "@/services/workshopService";

export type QuoteRoutePageProps = {
  /** Homepage for “back” nav — use `/en` on English routes. */
  homeHref?: string;
  /** Link to the material guide (localized). */
  materialsHref?: string;
  /** UI + API locale for shared quote components. */
  locale?: NaLocale;
};

/**
 * Shared server UI for `/quote`, `/bao-gia-in-3d`, and `/en/3d-printing-quote`.
 */
export async function QuoteRoutePage({
  homeHref = "/",
  materialsHref = "/materials",
  locale = "vi",
}: QuoteRoutePageProps) {
  const workshopRes = await getWorkshopInfo();
  const isEn = locale === "en";

  return (
    <main className="min-h-screen bg-zinc-900 px-4 py-12 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <Link
            href={homeHref}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-zinc-100 transition hover:border-emerald-500 hover:bg-zinc-900"
          >
            <ArrowLeft className="h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
            {isEn ? "Back to homepage" : "Về trang chủ"}
          </Link>
        </div>

        <header className="mb-10 border-b border-zinc-800 pb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
            {isEn ? "STL 3D printing quote" : "Báo giá file in 3D"}
          </h1>
          <p className="mt-3 max-w-2xl text-zinc-400">
            {isEn ? (
              <>
                Upload an STL—we slice automatically and estimate time, filament usage, and price for PLA, PETG,
                PETG-CF, and TPU (standard vs student tiers). Affordable ABS/engineering workflows use our enclosed
                chamber line; see the{" "}
                <Link href={materialsHref} className="font-semibold text-emerald-400 hover:text-emerald-300">
                  material guide
                </Link>
                .
              </>
            ) : (
              <>
                Tải file STL để hệ thống slice và ước tính thời gian, lượng nhựa và giá theo bảng giá PLA,
                PETG, PETG-CF, TPU (người thường / sinh viên).{" "}
                <Link href={materialsHref} className="font-semibold text-emerald-400 hover:text-emerald-300">
                  Hướng dẫn chọn nhựa
                </Link>
                .
              </>
            )}
          </p>
        </header>

        <QuotePageBrand
          locale={locale}
          workshopRows={workshopRes.data ?? []}
          workshopError={workshopRes.error}
          surface="dark"
        />

        <GrandOpeningQuotePromo locale={locale} />

        <QuoteEstimatorClient locale={locale} materialsHref={materialsHref} />
      </div>
    </main>
  );
}
