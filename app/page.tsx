import type { Metadata } from "next";

import { HomeJsonLd } from "@/components/seo/HomeJsonLd";
import { HomeLandingClient } from "@/components/landing/HomeLandingClient";
import { getPrinterImagesForLocale, getShowcaseImagesForLocale } from "@/lib/home-static-assets";
import { getSiteUrl, SEO_KEYWORDS, SITE_BRAND } from "@/lib/seo";
import { getMaterialsWithPricing } from "@/services/materialService";
import { getPrinters } from "@/services/printerService";
import { getWorkshopInfo } from "@/services/workshopService";

/** Always read Supabase-backed data at request time (runtime env in Docker / production). */
export const dynamic = "force-dynamic";

const homeTitle = `In 3D giá rẻ HCM (Thủ Đức) | Báo giá online | ${SITE_BRAND}`;
const homeDescription =
  "Dịch vụ in 3D giá rẻ HCM, Thủ Đức cho sinh viên & kỹ sư. Báo giá online lấy liền, ship COD toàn quốc. Chuyên in ABS buồng kín, PLA, PETG-CF.";

export const metadata: Metadata = {
  title: { absolute: homeTitle },
  description: homeDescription,
  keywords: [...SEO_KEYWORDS, SITE_BRAND],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: homeTitle,
    description: homeDescription,
    url: getSiteUrl(),
    type: "website",
    locale: "vi_VN",
  },
  twitter: {
    title: homeTitle,
    description: homeDescription,
  },
};

export default async function Home() {
  const [workshopRes, materialsRes, printersRes, showcaseImages, printerImages] = await Promise.all([
    getWorkshopInfo(),
    getMaterialsWithPricing(),
    getPrinters(),
    getShowcaseImagesForLocale("vi"),
    getPrinterImagesForLocale("vi"),
  ]);

  const workshopMap = Object.fromEntries((workshopRes.data ?? []).map((row) => [row.key, row.value]));

  return (
    <>
      <HomeJsonLd email={workshopMap.contact_email} />
      <HomeLandingClient
        locale="vi"
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
