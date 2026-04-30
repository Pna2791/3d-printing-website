import { readdir } from "node:fs/promises";
import path from "node:path";

import { HomeLandingClient } from "@/components/landing/HomeLandingClient";
import { getMaterialsWithPricing } from "@/services/materialService";
import { getPrinters } from "@/services/printerService";
import { getWorkshopInfo } from "@/services/workshopService";

/** Always read Supabase-backed data at request time (runtime env in Docker / production). */
export const dynamic = "force-dynamic";

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

  return (
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
  );
}
