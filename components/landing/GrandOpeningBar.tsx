"use client";

import { useEffect, useState } from "react";

import type { AppLocale } from "@/lib/i18n-dictionary";
import { getDictionary } from "@/lib/i18n-dictionary";
import { getCountdownToPromoEnd, isGrandOpeningPromoActive } from "@/lib/grandOpening";
import { SITE_BRAND } from "@/lib/seo";

type GrandOpeningBarProps = {
  locale: AppLocale;
};

export function GrandOpeningBar({ locale }: GrandOpeningBarProps) {
  const d = getDictionary(locale).home.grandOpeningBar;
  const [tick, setTick] = useState(0);
  const active = isGrandOpeningPromoActive();

  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, [active]);

  if (!active) return null;

  void tick;
  const { days, hours, minutes, seconds, ended } = getCountdownToPromoEnd(new Date());

  return (
    <div
      className="grand-opening-bar sticky top-0 z-[100] border-b border-emerald-900/30 shadow-md"
      role="region"
      aria-label={d.aria}
    >
      <div className="grand-opening-bar-bg px-4 py-2.5 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-2 text-center sm:flex-row sm:flex-wrap sm:gap-x-4 sm:gap-y-1 sm:text-left">
          <p className="text-xs font-semibold tracking-wide text-white drop-shadow-sm sm:text-sm">
            🎉 {d.lineStart} {SITE_BRAND} {d.lineEnd}
          </p>
          <div
            className="flex shrink-0 items-center gap-2 rounded-full border border-white/25 bg-black/20 px-3 py-1 text-[11px] font-bold tabular-nums text-white backdrop-blur-sm sm:text-xs"
            aria-live="polite"
          >
            {ended ? (
              <span>{d.lastDay}</span>
            ) : (
              <>
                <span className="text-emerald-200/90">{d.remaining}</span>
                <span>
                  {days}d {String(hours).padStart(2, "0")}h {String(minutes).padStart(2, "0")}m{" "}
                  {String(seconds).padStart(2, "0")}s
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
