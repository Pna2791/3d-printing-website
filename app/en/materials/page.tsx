import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { MaterialsGuideBody } from "@/components/materials/MaterialsGuideBody";
import { getDictionary } from "@/lib/i18n-dictionary";
import { QUOTE_VI_SEO_PATH } from "@/lib/quote-paths";
import { getSiteUrl, SITE_BRAND } from "@/lib/seo";

const titleAbsolute =
  `Filament guide: PLA, PETG, PETG-CF, TPU & ABS (${SITE_BRAND}) — Vietnam 3D printing`;

const materialsDescription =
  "Compare PLA, PETG, PETG-CF, and TPU before you quote. Guidance matches NA 3D SHOP workshop practice; prices on the STL quote tool stay authoritative.";

export const metadata: Metadata = {
  title: { absolute: titleAbsolute },
  description: materialsDescription,
  keywords: [
    "Vietnam 3D printing service",
    "Affordable PLA",
    "PETG-CF printing",
    "Online 3D printing quote",
    SITE_BRAND,
  ],
  alternates: {
    canonical: "/en/materials",
    languages: {
      "vi-VN": "/materials",
      "en-US": "/en/materials",
      "x-default": "/materials",
    },
  },
  openGraph: {
    title: titleAbsolute,
    description: materialsDescription,
    url: `${getSiteUrl()}/en/materials`,
    type: "website",
    locale: "en_US",
  },
};

export default function EnMaterialsGuidePage() {
  const d = getDictionary("en").materials;

  return (
    <main className="min-h-screen bg-zinc-900 px-4 py-12 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <Link
            href="/en"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-zinc-100 transition hover:border-emerald-500 hover:bg-zinc-900"
          >
            <ArrowLeft className="h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
            {d.back}
          </Link>
        </div>

        <MaterialsGuideBody locale="en" viQuoteHref={QUOTE_VI_SEO_PATH} />
      </div>
    </main>
  );
}
