"use client";

import { useEffect, useState } from "react";
import { ArrowDown, Boxes, FileText, PackageCheck, Upload } from "lucide-react";

import { TEXT_SLICER_URL, resolveTextSlicerUrl } from "@/config/urls";
import type { AppLocale } from "@/lib/i18n-dictionary";
import { getDictionary } from "@/lib/i18n-dictionary";

const YOUTUBE_SHORT_EMBED_URL = "https://www.youtube-nocookie.com/embed/cMWcgyS9WNk";

const STEP_ICONS = [Upload, Boxes, FileText, PackageCheck] as const;

type HowItWorksSectionProps = {
  locale: AppLocale;
};

export function HowItWorksSection({ locale }: HowItWorksSectionProps) {
  const t = getDictionary(locale).home.howItWorks;

  // Dev auto-detect needs `window.location` — resolve after mount so SSR/client match.
  const [slicerUrl, setSlicerUrl] = useState(TEXT_SLICER_URL);
  useEffect(() => {
    setSlicerUrl(resolveTextSlicerUrl());
  }, []);

  return (
    <section
      aria-labelledby="how-it-works-heading"
      className="rounded-3xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-emerald-50/40 p-8 shadow-sm dark:border-zinc-800 dark:from-zinc-900 dark:to-emerald-950/30 dark:shadow-none sm:p-10"
    >
      <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:gap-14">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            {t.kicker}
          </p>
          <h2
            id="how-it-works-heading"
            className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl"
          >
            {t.title}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
            {t.subtitle}
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {t.seoBody}
          </p>

          <ol aria-label={t.stepsAria} className="mt-8 space-y-2">
            {t.steps.map((step, index) => {
              const Icon = STEP_ICONS[index];
              return (
                <li key={step.title}>
                  <div className="flex items-start gap-4 rounded-xl border border-emerald-200 bg-white/70 px-4 py-3 dark:border-emerald-900/50 dark:bg-zinc-900/50">
                    <span
                      aria-hidden
                      className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                        {index + 1}. {step.title}
                      </p>
                      <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  {index < t.steps.length - 1 ? (
                    <div aria-hidden className="flex justify-center py-1">
                      <ArrowDown className="h-4 w-4 text-emerald-500/70 dark:text-emerald-400/60" />
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </div>

        <div className="mx-auto flex w-full max-w-xs flex-col items-center lg:mx-0">
          <div className="aspect-[9/16] w-full overflow-hidden rounded-2xl border border-zinc-200 shadow-lg dark:border-zinc-800">
            <iframe
              src={YOUTUBE_SHORT_EMBED_URL}
              title={t.videoTitle}
              loading="lazy"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              className="h-full w-full"
            />
          </div>
          <a
            href={slicerUrl}
            aria-label={t.ctaAria}
            className="mt-6 inline-flex w-full justify-center rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:bg-emerald-500 dark:text-emerald-950 dark:hover:bg-emerald-400 dark:focus-visible:outline-emerald-400"
          >
            {t.cta}
          </a>
        </div>
      </div>
    </section>
  );
}
