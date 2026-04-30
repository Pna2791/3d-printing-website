"use client";

import { useState } from "react";

import { AboutSection } from "@/components/landing/AboutSection";
import { ContactSection } from "@/components/landing/ContactSection";
import { HeroSection } from "@/components/landing/HeroSection";
import { PricingPreview } from "@/components/landing/PricingPreview";
import { PrinterStatusLive } from "@/components/landing/PrinterStatusLive";
import { QueryError } from "@/components/landing/QueryError";
import { ShowcaseSection } from "@/components/landing/ShowcaseSection";
import { PricingModal } from "@/components/pricing/PricingModal";
import type { MaterialWithPricing, PrinterRow, WorkshopInfoRow } from "@/lib/supabase/types";

type HomeLandingClientProps = {
  workshopRows: WorkshopInfoRow[];
  workshopError: string | null;
  materials: MaterialWithPricing[];
  materialsError: string | null;
  printers: PrinterRow[];
  printersError: string | null;
};

export function HomeLandingClient({
  workshopRows,
  workshopError,
  materials,
  materialsError,
  printers,
  printersError,
}: HomeLandingClientProps) {
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  const workshopMap = Object.fromEntries(
    workshopRows.map((row) => [row.key, row.value]),
  );

  return (
    <main className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <HeroSection onOpenPricing={() => setIsPricingOpen(true)} />

        <AboutSection />

        <ShowcaseSection />

        <section className="py-16">
          {printersError ? (
            <QueryError title="Không tải được tình trạng máy in" message={printersError} />
          ) : (
            <PrinterStatusLive initialPrinters={printers} />
          )}
        </section>

        <section className="py-16">
          {materialsError ? (
            <QueryError title="Không tải được bảng giá nhanh" message={materialsError} />
          ) : (
            <PricingPreview
              materials={materials}
              onOpenPricing={() => setIsPricingOpen(true)}
            />
          )}
        </section>

        <section className="py-16">
          {workshopError ? (
            <QueryError title="Không tải được phần liên hệ" message={workshopError} />
          ) : (
            <ContactSection email={workshopMap.contact_email} />
          )}
        </section>
      </div>

      <PricingModal
        open={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
      />
    </main>
  );
}
