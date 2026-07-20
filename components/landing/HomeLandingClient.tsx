"use client";

import { useState } from "react";

import { AboutSection } from "@/components/landing/AboutSection";
import { EnclosedPrintingSection } from "@/components/landing/EnclosedPrintingSection";
import { ContactSection } from "@/components/landing/ContactSection";
import { GrandOpeningBar } from "@/components/landing/GrandOpeningBar";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { PricingPreview } from "@/components/landing/PricingPreview";
import { PrinterStatusLive } from "@/components/landing/PrinterStatusLive";
import { QueryError } from "@/components/landing/QueryError";
import { GlobalOrdersSection } from "@/components/landing/GlobalOrdersSection";
import { ShowcaseSection } from "@/components/landing/ShowcaseSection";
import { TextSlicerSection } from "@/components/landing/TextSlicerSection";
import { WorkshopLocationSection } from "@/components/landing/WorkshopLocationSection";
import { CreateOrderForm } from "@/components/orders/CreateOrderForm";
import { PricingModal } from "@/components/pricing/PricingModal";
import type { AppLocale } from "@/lib/i18n-dictionary";
import { getDictionary } from "@/lib/i18n-dictionary";
import { FEATURES, OFFLINE_ORDER_CONTACT } from "@/lib/config";
import type { ShowcaseGalleryItem } from "@/lib/gallery/showcase-types";
import type { MaterialWithPricing, PrinterRow, WorkshopInfoRow } from "@/lib/supabase/types";

type HomeLandingClientProps = {
  locale: AppLocale;
  workshopRows: WorkshopInfoRow[];
  workshopError: string | null;
  materials: MaterialWithPricing[];
  materialsError: string | null;
  printers: PrinterRow[];
  printersError: string | null;
  showcaseImages: ShowcaseGalleryItem[];
  printerImages: { src: string; alt: string }[];
};

export function HomeLandingClient({
  locale,
  workshopRows,
  workshopError,
  materials,
  materialsError,
  printers,
  printersError,
  showcaseImages,
  printerImages,
}: HomeLandingClientProps) {
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const qe = getDictionary(locale).home.queryError;
  const order = getDictionary(locale).home.order;

  const workshopMap = Object.fromEntries(
    workshopRows.map((row) => [row.key, row.value]),
  );

  return (
    <main className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <GrandOpeningBar locale={locale} />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <HeroSection locale={locale} onOpenPricing={() => setIsPricingOpen(true)} />

        <div className="py-8">
          <TextSlicerSection locale={locale} />
        </div>

        <div className="pb-8">
          <HowItWorksSection locale={locale} />
        </div>

        <div className="py-8">
          <EnclosedPrintingSection locale={locale} />
        </div>

        <ShowcaseSection locale={locale} images={showcaseImages} />

        <AboutSection locale={locale} images={printerImages} />

        <section className="py-16">
          {printersError ? (
            <QueryError title={qe.printers} message={printersError} />
          ) : (
            <PrinterStatusLive initialPrinters={printers} />
          )}
        </section>

        <section className="py-16">
          {materialsError ? (
            <QueryError title={qe.materials} message={materialsError} />
          ) : (
            <PricingPreview
              locale={locale}
              materials={materials}
              onOpenPricing={() => setIsPricingOpen(true)}
            />
          )}
        </section>

        <div className="py-16">
          <GlobalOrdersSection locale={locale} />
        </div>

        <WorkshopLocationSection locale={locale} />

        <section className="py-16">
          {workshopError ? (
            <QueryError title={qe.workshop} message={workshopError} />
          ) : (
            <ContactSection locale={locale} email={workshopMap.contact_email} />
          )}
        </section>

        <section
          id="dat-hang"
          className="scroll-mt-24 border-t border-zinc-200 py-16 dark:border-zinc-800"
        >
          <div className="mx-auto max-w-2xl">
            <h2 className="text-center text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {order.title}
            </h2>
            <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">{order.subtitle}</p>
            <div className="mt-8">
              <CreateOrderForm materials={materials} printers={printers} />
              {!FEATURES.ORDER_ENABLED || !FEATURES.AUTH_ENABLED ? (
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-6 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
                  <p>{order.disabledLead}</p>
                  <p className="mt-3 flex flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-6">
                    <a
                      href={OFFLINE_ORDER_CONTACT.zaloTelHref}
                      className="font-semibold text-emerald-700 underline-offset-2 hover:underline dark:text-emerald-400"
                    >
                      Zalo: {OFFLINE_ORDER_CONTACT.zaloDisplay}
                    </a>
                    <a
                      href={OFFLINE_ORDER_CONTACT.fanpageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-emerald-700 underline-offset-2 hover:underline dark:text-emerald-400"
                    >
                      {OFFLINE_ORDER_CONTACT.fanpageLabel}
                    </a>
                  </p>
                  <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-500">{order.disabledHint}</p>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </div>

      <PricingModal
        open={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
      />
    </main>
  );
}
