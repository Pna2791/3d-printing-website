import Link from "next/link";

import { HomeJsonLd } from "@/components/seo/HomeJsonLd";

export const dynamic = "force-dynamic";

export default function EnHomePage() {
  return (
    <main className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <HomeJsonLd />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <section className="grid gap-10 py-16 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1 text-sm font-medium text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-300">
              Nationwide COD shipping — student-friendly pricing
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
              Affordable 3D Printing in HCMC (Thu Duc) — NA 3D SHOP
            </h1>
            <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-300">
              Workshop near Vietnam National University area (Thu Duc), next to Di An. Transparent pricing for
              students and engineers, with engineering-grade materials and enclosed-chamber ABS printing.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/en/bao-gia-in-3d"
                className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
              >
                Instant 3D print quote
              </Link>
              <Link
                href="/en/bao-gia-in-3d"
                className="rounded-xl border border-zinc-300 px-5 py-3 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
              >
                Upload STL
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-zinc-100 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Why choose our workshop for global orders?
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
              <li>
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">Enclosed chamber</span>{" "}
                printing for ABS and engineering materials.
              </li>
              <li>
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">Strict QC</span> and clear
                communication for functional parts.
              </li>
              <li>
                Rapid prototyping to small-batch production with scalable capacity.
              </li>
            </ul>
            <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
              English pages are being expanded. The quoting tool is fully functional.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

