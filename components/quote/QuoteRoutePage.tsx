import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { GrandOpeningQuotePromo } from "@/components/quote/GrandOpeningQuotePromo";
import { QuoteEstimatorClient } from "@/components/quote/QuoteEstimatorClient";
import { QuotePageBrand } from "@/components/quote/QuotePageBrand";
import { getWorkshopInfo } from "@/services/workshopService";

/**
 * Shared server UI for `/quote` and `/bao-gia-in-3d` (single implementation, two routes).
 */
export async function QuoteRoutePage() {
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
