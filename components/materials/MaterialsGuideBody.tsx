import Link from "next/link";

import { MATERIAL_GUIDE } from "@/lib/materials";
import { pickMaterialStrings } from "@/lib/materials";
import type { AppLocale } from "@/lib/i18n-dictionary";
import { getDictionary } from "@/lib/i18n-dictionary";
import { QUOTE_EN_PATH } from "@/lib/quote-paths";
import { QUOTE_MATERIAL_OPTIONS } from "@/lib/pricing";

type MaterialsGuideBodyProps = {
  locale: AppLocale;
  /** Link wrapped around Vietnamese SEO quote slug. */
  viQuoteHref: string;
};

export function MaterialsGuideBody({ locale, viQuoteHref }: MaterialsGuideBodyProps) {
  const d = getDictionary(locale).materials;

  return (
    <>
      <header className="mb-10 border-b border-zinc-800 pb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400/90">{d.kicker}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">{d.title}</h1>
        <p className="mt-3 max-w-2xl text-zinc-400">{d.intro}</p>
        <p className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
          <Link
            href={viQuoteHref}
            className="text-sm font-semibold text-emerald-400 underline-offset-4 hover:text-emerald-300 hover:underline"
          >
            {d.linkToViQuote}
          </Link>
          <Link
            href={QUOTE_EN_PATH}
            className="text-sm font-semibold text-emerald-400/90 underline-offset-4 hover:text-emerald-300 hover:underline"
          >
            {d.linkToEnQuote}
          </Link>
        </p>
        <p className="mt-4">
          <Link
            href={locale === "vi" ? "/en/materials" : "/materials"}
            className="text-sm font-semibold text-emerald-400/90 underline-offset-4 hover:text-emerald-300 hover:underline"
          >
            {d.linkAlternateMaterialsPage}
          </Link>
        </p>
      </header>

      <section aria-labelledby="compare-heading" className="mb-14">
        <h2 id="compare-heading" className="text-xl font-semibold text-zinc-50">
          {d.compareTitle}
        </h2>
        <p className="mt-2 text-sm text-zinc-500">{d.compareHint}</p>
        <div className="mt-5 overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950/80">
          <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/90">
                <th scope="col" className="px-4 py-3 font-semibold text-zinc-300">
                  {d.thMaterial}
                </th>
                <th scope="col" className="px-4 py-3 font-semibold text-zinc-300">
                  {d.thStrength}
                </th>
                <th scope="col" className="px-4 py-3 font-semibold text-zinc-300">
                  {d.thFlex}
                </th>
                <th scope="col" className="px-4 py-3 font-semibold text-zinc-300">
                  {d.thHeat}
                </th>
                <th scope="col" className="px-4 py-3 font-semibold text-zinc-300">
                  {d.thPrice}
                </th>
              </tr>
            </thead>
            <tbody>
              {QUOTE_MATERIAL_OPTIONS.map((id) => {
                const strings = pickMaterialStrings(MATERIAL_GUIDE[id], locale);
                return (
                  <tr key={id} className="border-b border-zinc-800/80 last:border-0">
                    <th scope="row" className="px-4 py-3 font-semibold text-zinc-100">
                      {id}
                    </th>
                    <td className="px-4 py-3 text-zinc-400">{strings.comparison.strength}</td>
                    <td className="px-4 py-3 text-zinc-400">{strings.comparison.flexibility}</td>
                    <td className="px-4 py-3 text-zinc-400">{strings.comparison.heatResistance}</td>
                    <td className="px-4 py-3 text-zinc-400">{strings.comparison.priceLevel}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="cards-heading" className="space-y-8">
        <h2 id="cards-heading" className="text-xl font-semibold text-zinc-50">
          {d.detailTitle}
        </h2>
        {QUOTE_MATERIAL_OPTIONS.map((id) => {
          const g = MATERIAL_GUIDE[id];
          const strings = pickMaterialStrings(g, locale);
          return (
            <article
              key={id}
              className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6 shadow-sm shadow-black/20"
            >
              <h3 className="text-lg font-bold tracking-tight text-zinc-50">{id}</h3>
              <p className="mt-2 text-sm text-zinc-400">{strings.description}</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {strings.traits.map((t) => (
                  <li
                    key={t}
                    className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs font-medium text-zinc-300"
                  >
                    {t}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-zinc-400">
                <span className="font-medium text-zinc-300">{d.useCasesLabel} </span>
                {strings.useCases.join(" · ")}
              </p>
              <div className="mt-4 rounded-xl border border-emerald-500/50 bg-emerald-500/10 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300/95">{d.bestForKicker}</p>
                <p className="mt-1.5 text-sm font-medium leading-relaxed text-emerald-50/95">{strings.bestFor}</p>
              </div>
              <div className="mt-5">
                <p className="text-sm font-semibold text-zinc-200">{d.whenChoose}</p>
                <ul className="mt-2 list-inside list-disc space-y-1.5 text-sm text-zinc-400 marker:text-emerald-500">
                  {strings.whenBullets.map((b) => (
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
    </>
  );
}
