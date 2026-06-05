import type { Metadata } from "next";

import { HomeJsonLd } from "@/components/seo/HomeJsonLd";
import { HomeLandingClient } from "@/components/landing/HomeLandingClient";
import { getPrintedGalleryForLocale } from "@/lib/gallery/printed-products";
import { getPrinterImagesForLocale } from "@/lib/home-static-assets";
import { getSiteUrl, SITE_BRAND } from "@/lib/seo";
import { getMaterialsWithPricing } from "@/services/materialService";
import { getPrinters } from "@/services/printerService";
import { getWorkshopInfo } from "@/services/workshopService";

export const dynamic = "force-dynamic";

const title = `Affordable 3D printing HCMC (Thu Duc) | Instant quote | ${SITE_BRAND}`;
const description =
  "NA 3D SHOP near Vietnam National University village (Di An / Thu Duc). Student-friendly FDM pricing, nationwide COD, enclosed ABS & engineering materials — PLA, PETG, PETG-CF, TPU.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  keywords: ["Vietnam 3D printing", "HCMC 3D print", "Thu Duc 3D printing", "STL quote", SITE_BRAND],
  alternates: {
    canonical: "/en",
    languages: {
      "vi-VN": "/",
      "en-US": "/en",
      "x-default": "/",
    },
  },
  openGraph: {
    title,
    description,
    url: `${getSiteUrl()}/en`,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    title,
    description,
  },
};

export default async function EnHomePage() {
  const [workshopRes, materialsRes, printersRes, showcaseImages, printerImages] = await Promise.all([
    getWorkshopInfo(),
    getMaterialsWithPricing(),
    getPrinters(),
    getPrintedGalleryForLocale("en"),
    getPrinterImagesForLocale("en"),
  ]);

  const workshopMap = Object.fromEntries((workshopRes.data ?? []).map((row) => [row.key, row.value]));

  return (
    <>
      <HomeJsonLd email={workshopMap.contact_email} />
      <HomeLandingClient
        locale="en"
        workshopRows={workshopRes.data ?? []}
        workshopError={workshopRes.error}
        materials={materialsRes.data ?? []}
        materialsError={materialsRes.error}
        printers={printersRes.data ?? []}
        printersError={printersRes.error}
        showcaseImages={showcaseImages}
        printerImages={printerImages}
      />
    </>
  );
}
