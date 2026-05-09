import { readdir } from "node:fs/promises";
import path from "node:path";

import type { AppLocale } from "@/lib/i18n-dictionary";
import { getDictionary } from "@/lib/i18n-dictionary";

function basenameNoExt(filename: string): string {
  return filename.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
}

export async function getShowcaseImagesForLocale(locale: AppLocale): Promise<{ src: string; alt: string }[]> {
  const dict = getDictionary(locale);
  const prefix = dict.home.showcaseAltPrefix;
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
      alt: `${prefix} ${basenameNoExt(name)}`,
    }));
  } catch {
    return [];
  }
}

export async function getPrinterImagesForLocale(locale: AppLocale): Promise<{ src: string; alt: string }[]> {
  const dict = getDictionary(locale);
  const prefix = dict.home.printerAltPrefix;
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
      alt: `${prefix} ${basenameNoExt(name)}`,
    }));
  } catch {
    return [];
  }
}
