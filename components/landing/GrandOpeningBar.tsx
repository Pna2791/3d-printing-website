"use client";

import type { AppLocale } from "@/lib/i18n-dictionary";
import { getDictionary } from "@/lib/i18n-dictionary";
import { isChannelLetterPromoActive } from "@/lib/channelLetterPromo";
import { SITE_BRAND } from "@/lib/seo";

type GrandOpeningBarProps = {
  locale: AppLocale;
};

/** Top promo strip — channel-letter discount (no countdown). */
export function GrandOpeningBar({ locale }: GrandOpeningBarProps) {
  const d = getDictionary(locale).home.promoBar;

  if (!isChannelLetterPromoActive()) return null;

  return (
    <div
      className="grand-opening-bar sticky top-0 z-[100] border-b border-emerald-900/30 shadow-md"
      role="region"
      aria-label={d.aria}
    >
      <div className="grand-opening-bar-bg px-4 py-2.5 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-1 text-center sm:flex-row sm:flex-wrap sm:gap-x-3 sm:text-left">
          <p className="text-xs font-semibold tracking-wide text-white drop-shadow-sm sm:text-sm">
            {d.title} · {SITE_BRAND}
          </p>
          <p className="text-[11px] font-medium text-emerald-100/95 sm:text-xs">
            {d.period} — {d.content}
          </p>
        </div>
      </div>
    </div>
  );
}
