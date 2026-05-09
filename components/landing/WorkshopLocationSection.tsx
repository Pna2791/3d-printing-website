"use client";

import { ExternalLink, MapPinned } from "lucide-react";

import type { AppLocale } from "@/lib/i18n-dictionary";
import { getDictionary } from "@/lib/i18n-dictionary";
import {
  WORKSHOP_FULL_ADDRESS_VI,
  WORKSHOP_LEGAL_SUFFIX,
  WORKSHOP_MAPS_SHARE_URL,
  WORKSHOP_MAP_EMBED_SRC,
  WORKSHOP_PUBLIC_NAME,
} from "@/lib/workshop-location";

type WorkshopLocationSectionProps = {
  locale: AppLocale;
};

export function WorkshopLocationSection({ locale }: WorkshopLocationSectionProps) {
  const w = getDictionary(locale).home.workshop;

  const iframeTitle = `${w.mapIframeLead} ${WORKSHOP_PUBLIC_NAME} ${w.mapIframeAt} ${WORKSHOP_FULL_ADDRESS_VI}`;

  return (
    <section
      aria-labelledby="workshop-location-heading"
      id="xuong-vi-tri"
      className="py-16"
    >
      <div className="overflow-hidden rounded-3xl border border-emerald-500/35 bg-zinc-950 shadow-lg shadow-black/30 ring-1 ring-emerald-500/15">
        <div className="border-b border-zinc-800/90 px-5 py-6 sm:px-8 sm:py-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400/90">{w.kicker}</p>
          <h2
            id="workshop-location-heading"
            className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl"
          >
            <MapPinned className="h-8 w-8 shrink-0 text-emerald-500" aria-hidden />
            {w.titleMiddle} {WORKSHOP_PUBLIC_NAME} {WORKSHOP_LEGAL_SUFFIX}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-400">{w.subtitle}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={WORKSHOP_MAPS_SHARE_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-zinc-950 shadow-md shadow-emerald-500/20 transition hover:bg-emerald-400"
            >
              {w.directions}
              <ExternalLink className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
            </a>
            <a
              href={WORKSHOP_MAPS_SHARE_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center justify-center rounded-xl border border-zinc-600 bg-zinc-900/90 px-4 py-3 text-sm font-medium text-zinc-200 transition hover:border-emerald-500/50 hover:bg-zinc-800"
            >
              {w.openMaps}
            </a>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="group overflow-hidden rounded-2xl border-2 border-emerald-500/45 bg-black shadow-inner grayscale transition duration-500 hover:grayscale-0">
            <iframe
              title={iframeTitle}
              src={WORKSHOP_MAP_EMBED_SRC}
              className="h-[min(55vh,420px)] min-h-[240px] w-full border-0 sm:h-[min(62vh,480px)]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
          <p className="mt-4 text-xs leading-snug text-zinc-500">{WORKSHOP_FULL_ADDRESS_VI}</p>
        </div>
      </div>
    </section>
  );
}
