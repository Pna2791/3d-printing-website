import { QUOTE_MATERIAL_OPTIONS, type SupportedMaterial } from "@/lib/pricing";

export function parseQuoteMaterialFromForm(form: FormData): SupportedMaterial {
  const raw = form.get("quote_material");
  if (typeof raw !== "string") return "PLA";
  const s = raw.trim();
  return (QUOTE_MATERIAL_OPTIONS as readonly string[]).includes(s) ? (s as SupportedMaterial) : "PLA";
}

/**
 * Alt text for quote STL thumbnails (API + client). Keeps model name + quote material in sync with SEO.
 */
export function quoteStlPreviewImageAlt(filename: string, material: SupportedMaterial): string {
  const trimmed = filename.trim();
  const base = (trimmed ? trimmed.replace(/\.[^.]+$/i, "") : "mô hình STL")
    .replace(/[-_]+/g, " ")
    .trim();
  return `Xem trước 3D ${base}, nhựa ${material} — NA 3D SHOP (ship COD toàn quốc)`;
}
