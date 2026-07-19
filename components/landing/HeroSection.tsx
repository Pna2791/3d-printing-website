"use client";

import Image from "next/image";
import { motion } from "framer-motion";

import type { AppLocale } from "@/lib/i18n-dictionary";
import { getDictionary } from "@/lib/i18n-dictionary";
import { isChannelLetterPromoActive } from "@/lib/channelLetterPromo";
import { QUOTE_EN_PATH, QUOTE_VI_SEO_PATH } from "@/lib/quote-paths";

type HeroSectionProps = {
  locale: AppLocale;
  onOpenPricing: () => void;
};

export function HeroSection({ locale, onOpenPricing }: HeroSectionProps) {
  const h = getDictionary(locale).home.hero;
  const quoteHref = locale === "en" ? QUOTE_EN_PATH : QUOTE_VI_SEO_PATH;
  const promo = isChannelLetterPromoActive();

  return (
    <section className="grid gap-10 py-16 lg:grid-cols-2 lg:items-center">
      <div>
        <p className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1 text-sm font-medium text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-300">
          {h.badge}
        </p>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
          {h.title}
        </h1>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-300">
          {h.leadBefore}{" "}
          <span className="font-medium text-zinc-800 dark:text-zinc-100">{h.leadHighlight}</span>{" "}
          {h.leadAfter}
        </p>

        {promo ? (
          <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-200">
            <span className="relative flex h-2 w-2" aria-hidden>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            {h.promoLive}
          </p>
        ) : null}

        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 dark:border-emerald-900/50 dark:bg-emerald-900/20">
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">{h.promoCardTitle}</p>
          <p className="mt-1 text-xs font-medium text-emerald-700/90 dark:text-emerald-300/90">{h.promoCardPeriod}</p>
          <p className="mt-2 text-sm text-emerald-800 dark:text-emerald-200">{h.promoCardContent}</p>
          <motion.p
            className="mt-3 inline-flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-xl px-4 py-2.5 leading-tight tracking-tight"
            animate={{
              scale: [1, 1.03, 1],
              boxShadow: [
                "0 0 0 0 rgba(16, 185, 129, 0.35)",
                "0 0 28px 6px rgba(16, 185, 129, 0.5)",
                "0 0 0 0 rgba(16, 185, 129, 0.35)",
              ],
            }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="text-base font-semibold text-emerald-800/70 line-through dark:text-emerald-200/60 sm:text-lg">
              {h.regularPrice}
            </span>
            <span className="text-xl font-extrabold text-emerald-950 sm:text-2xl md:text-3xl dark:text-emerald-50">
              {h.promoPrice}
            </span>
          </motion.p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={quoteHref}
            className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            {h.ctaQuote}
          </a>
          <button
            type="button"
            onClick={onOpenPricing}
            className="rounded-xl border border-zinc-300 px-5 py-3 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
          >
            {h.ctaPricing}
          </button>
          <a
            href={quoteHref}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-zinc-300 px-5 py-3 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
          >
            {h.ctaStlTool}
          </a>
        </div>
      </div>

      <div className="mx-auto w-full max-w-sm rounded-3xl border border-zinc-200 bg-zinc-100 p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="relative aspect-square">
          <Image
            src="/logo-na_3d.png"
            alt={h.logoAlt}
            fill
            className="object-cover object-center rounded-2xl"
            priority
          />
          {promo ? (
            <motion.div
              className="pointer-events-none absolute -right-1 -top-1 z-10 max-w-[9.5rem] rounded-lg border-2 border-dashed border-emerald-600 bg-white/95 px-2.5 py-1.5 text-center shadow-lg backdrop-blur-sm dark:border-emerald-400 dark:bg-zinc-900/95"
              animate={{
                y: [0, -5, 0],
                rotate: [-4, 4, -4],
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <p className="text-[8px] font-black uppercase leading-tight tracking-wide text-emerald-700 dark:text-emerald-300">
                {h.stickerLine1}
              </p>
              <p className="mt-0.5 text-[8px] font-bold uppercase leading-tight text-zinc-800 dark:text-zinc-100">
                {h.stickerLine2}
              </p>
            </motion.div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
