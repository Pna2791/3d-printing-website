"use client";

import { useEffect, useState } from "react";

import { TEXT_SLICER_URL, resolveTextSlicerUrl } from "@/config/urls";
import { isChannelLetterPromoActive } from "@/lib/channelLetterPromo";
import type { AppLocale } from "@/lib/i18n-dictionary";
import { getDictionary } from "@/lib/i18n-dictionary";

type TextSlicerSectionProps = {
  locale: AppLocale;
};

export function TextSlicerSection({ locale }: TextSlicerSectionProps) {
  const t = getDictionary(locale).home.textSlicer;
  const promo = isChannelLetterPromoActive();

  // Dev auto-detect needs `window.location` — resolve after mount so SSR/client match.
  const [slicerUrl, setSlicerUrl] = useState(TEXT_SLICER_URL);
  useEffect(() => {
    setSlicerUrl(resolveTextSlicerUrl());
  }, []);

  return (
    <section
      aria-labelledby="text-slicer-heading"
      className="rounded-3xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-emerald-50/40 p-8 shadow-sm dark:border-zinc-800 dark:from-zinc-900 dark:to-emerald-950/30 dark:shadow-none sm:p-10"
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
        {t.kicker}
      </p>
      <h2
        id="text-slicer-heading"
        className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl"
      >
        {t.title}
      </h2>
      <p className="mt-4 max-w-3xl text-base leading-relaxed text-zinc-700 dark:text-zinc-300">{t.body}</p>
      <div className="mt-5 inline-flex flex-col gap-1 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-5 py-3 dark:border-emerald-900/50 dark:bg-emerald-900/20">
        <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">{t.priceLabel}</span>
          {promo ? (
            <>
              <span className="text-base font-semibold text-emerald-800/60 line-through dark:text-emerald-200/50">
                {t.regularPrice}
              </span>
              <span className="text-2xl font-extrabold tracking-tight text-emerald-950 dark:text-emerald-50 sm:text-3xl">
                {t.promoPrice}
              </span>
            </>
          ) : (
            <span className="text-2xl font-extrabold tracking-tight text-emerald-950 dark:text-emerald-50 sm:text-3xl">
              {t.regularPrice}
            </span>
          )}
        </p>
        {promo ? (
          <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">{t.promoNote}</p>
        ) : null}
      </div>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {t.highlights.map((highlight) => (
          <li
            key={highlight}
            className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-white/70 px-4 py-3 text-sm font-medium text-zinc-800 dark:border-emerald-900/50 dark:bg-zinc-900/50 dark:text-zinc-100"
          >
            <span className="text-emerald-600 dark:text-emerald-400" aria-hidden>
              ✓
            </span>
            {highlight}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => {
          window.location.href = slicerUrl;
        }}
        className="mt-8 inline-flex rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 dark:bg-emerald-500 dark:text-emerald-950 dark:hover:bg-emerald-400"
      >
        {t.cta}
      </button>
    </section>
  );
}
