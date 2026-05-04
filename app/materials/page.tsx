import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { MATERIAL_GUIDE } from "@/lib/materials";
import { QUOTE_MATERIAL_OPTIONS } from "@/lib/pricing";
import { getSiteUrl, SEO_KEYWORDS, SITE_BRAND } from "@/lib/seo";

const materialsTitleAbsolute =
  "Chọn nhựa in 3D: PLA, PETG, PETG-CF, TPU & ABS — NA 3D SHOP toàn quốc";
const materialsDescription =
  "So sánh vật liệu in 3D giá rẻ: PLA, PETG, PETG-CF, TPU; gợi ý ABS & nhựa kỹ thuật với máy buồng kín. Ship COD toàn quốc, ưu đãi sinh viên — khớp bảng báo giá online.";

export const metadata: Metadata = {
  title: { absolute: materialsTitleAbsolute },
  description: materialsDescription,
  keywords: [...SEO_KEYWORDS, "so sánh nhựa in 3D", "PETG vs PLA", SITE_BRAND],
  alternates: {
    canonical: "/materials",
  },
  openGraph: {
    title: materialsTitleAbsolute,
    description: materialsDescription,
    url: `${getSiteUrl()}/materials`,
    type: "website",
  },
  twitter: {
    title: materialsTitleAbsolute,
    description: materialsDescription,
  },
};

export default function MaterialsGuidePage() {
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
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400/90">
            Hướng dẫn vật liệu
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
            Chọn loại nhựa phù hợp
          </h1>
          <p className="mt-3 max-w-2xl text-zinc-400">
            Bảng so sánh nhanh các loại nhựa NA 3D SHOP đang phục vụ — ship COD toàn quốc, ưu đãi sinh viên. Giá
            theo gam trên trang báo giá luôn khớp bảng giá hiện hành; ABS & nhựa kỹ thuật in buồng kín theo từng
            đơn.
          </p>
          <p className="mt-4">
            <Link
              href="/bao-gia-in-3d"
              className="text-sm font-semibold text-emerald-400 underline-offset-4 hover:text-emerald-300 hover:underline"
            >
              Đi tới báo giá STL →
            </Link>
          </p>
        </header>

        <section aria-labelledby="compare-heading" className="mb-14">
          <h2 id="compare-heading" className="text-xl font-semibold text-zinc-50">
            Bảng so sánh
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            Mô tả mang tính tham khảo thực tế in FDM; từng máy và thông số có thể ảnh hưởng nhẹ.
          </p>
          <div className="mt-5 overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950/80">
            <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/90">
                  <th scope="col" className="px-4 py-3 font-semibold text-zinc-300">
                    Loại nhựa
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold text-zinc-300">
                    Độ cứng / bền
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold text-zinc-300">
                    Độ dẻo
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold text-zinc-300">
                    Chịu nhiệt
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold text-zinc-300">
                    Mức giá (theo bảng)
                  </th>
                </tr>
              </thead>
              <tbody>
                {QUOTE_MATERIAL_OPTIONS.map((id) => {
                  const row = MATERIAL_GUIDE[id];
                  const c = row.comparison;
                  return (
                    <tr key={id} className="border-b border-zinc-800/80 last:border-0">
                      <th scope="row" className="px-4 py-3 font-semibold text-zinc-100">
                        {id}
                      </th>
                      <td className="px-4 py-3 text-zinc-400">{c.strengthVi}</td>
                      <td className="px-4 py-3 text-zinc-400">{c.flexibilityVi}</td>
                      <td className="px-4 py-3 text-zinc-400">{c.heatResistanceVi}</td>
                      <td className="px-4 py-3 text-zinc-400">{c.priceLevelVi}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="cards-heading" className="space-y-8">
          <h2 id="cards-heading" className="text-xl font-semibold text-zinc-50">
            Chi tiết từng loại
          </h2>
          {QUOTE_MATERIAL_OPTIONS.map((id) => {
            const g = MATERIAL_GUIDE[id];
            return (
              <article
                key={id}
                className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6 shadow-sm shadow-black/20"
              >
                <h3 className="text-lg font-bold tracking-tight text-zinc-50">{id}</h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {g.traitsVi.map((t) => (
                    <li
                      key={t}
                      className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs font-medium text-zinc-300"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-sm text-zinc-400">
                  <span className="font-medium text-zinc-300">Gợi ý ứng dụng: </span>
                  {g.useCasesVi.join(" · ")}
                </p>
                <div className="mt-4 rounded-xl border border-emerald-500/50 bg-emerald-500/10 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300/95">
                    Phù hợp nhất cho
                  </p>
                  <p className="mt-1.5 text-sm font-medium leading-relaxed text-emerald-50/95">
                    {g.bestForVi}
                  </p>
                </div>
                <div className="mt-5">
                  <p className="text-sm font-semibold text-zinc-200">Khi nào nên chọn?</p>
                  <ul className="mt-2 list-inside list-disc space-y-1.5 text-sm text-zinc-400 marker:text-emerald-500">
                    {g.whenToChooseBulletsVi.map((b) => (
                      <li key={b} className="pl-0.5">
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}
