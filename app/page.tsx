import { readdir } from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";

import { HomeJsonLd } from "@/components/seo/HomeJsonLd";
import { HomeLandingClient } from "@/components/landing/HomeLandingClient";
import { getSiteUrl, SEO_KEYWORDS, SITE_BRAND } from "@/lib/seo";
import { getMaterialsWithPricing } from "@/services/materialService";
import { getPrinters } from "@/services/printerService";
import { getWorkshopInfo } from "@/services/workshopService";

/** Always read Supabase-backed data at request time (runtime env in Docker / production). */
export const dynamic = "force-dynamic";

const homeTitle = `In 3D Giá Rẻ Toàn Quốc | Ưu Đãi Sinh Viên | ${SITE_BRAND}`;
const homeDescription =
  "Dịch vụ in 3D chuyên nghiệp, giá rẻ cho sinh viên. Hỗ trợ ship toàn quốc, ưu đãi lớn tại TP.HCM. Chuyên in ABS, PLA, PETG-CF với máy in buồng kín hiện đại.";

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
  },
  twitter: {
    title: homeTitle,
    description: homeDescription,
  },
};

async function getShowcaseImagesFromPublic() {
  const folderAbsolutePath = path.join(process.cwd(), "public", "printed");
  try {
    const names = await readdir(folderAbsolutePath, { withFileTypes: true });
    const imageNames = names
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((name) => /\.(png|jpe?g|webp|gif)$/i.test(name))
      .sort((a, b) => a.localeCompare(b));

    return imageNames.map((name) => ({
      src: `/printed/${name}`,
      alt: `Mẫu in 3D ${name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ")}`,
    }));
  } catch {
    return [];
  }
}

async function getPrinterImagesFromPublic() {
  const folderAbsolutePath = path.join(process.cwd(), "public", "printers");
  try {
    const names = await readdir(folderAbsolutePath, { withFileTypes: true });
    const imageNames = names
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((name) => /\.(png|jpe?g|webp|gif)$/i.test(name))
      .sort((a, b) => a.localeCompare(b))
      .slice(0, 2);

    return imageNames.map((name) => ({
      src: `/printers/${name}`,
      alt: `Máy in 3D ${name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ")}`,
    }));
  } catch {
    return [];
  }
}

export default async function Home() {
  const [workshopRes, materialsRes, printersRes, showcaseImages, printerImages] = await Promise.all([
    getWorkshopInfo(),
    getMaterialsWithPricing(),
    getPrinters(),
    getShowcaseImagesFromPublic(),
    getPrinterImagesFromPublic(),
  ]);

  const workshopMap = Object.fromEntries((workshopRes.data ?? []).map((row) => [row.key, row.value]));

  return (
    <>
      <HomeJsonLd email={workshopMap.contact_email} />
      <HomeLandingClient
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
