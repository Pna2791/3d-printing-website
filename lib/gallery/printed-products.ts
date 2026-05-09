import "server-only";

import { normalizeGalleryImageUrl } from "@/lib/gallery/image-display";
import { getShowcaseImagesForLocale } from "@/lib/home-static-assets";
import type { ShowcaseGalleryItem } from "@/lib/gallery/showcase-types";
import type { AppLocale } from "@/lib/i18n-dictionary";
import { getDictionary } from "@/lib/i18n-dictionary";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service";

type PrintedRow = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  category: string;
  created_at: string;
};

function mapRowToShowcase(prefix: string, row: PrintedRow): ShowcaseGalleryItem {
  return {
    id: row.id,
    src: normalizeGalleryImageUrl(row.image_url),
    alt: `${prefix} — ${row.title}`,
    title: row.title,
    description: row.description,
    category: row.category,
  };
}

/**
 * Public landing gallery. Uses the service-role client (server-only) so reads succeed even if
 * RLS/grants for `anon` were not applied yet — same data the admin UI shows.
 * Falls back to `public/printed/` when Supabase is unconfigured, the table is missing/empty, or the query errors.
 */
export async function getPrintedGalleryForLocale(locale: AppLocale): Promise<ShowcaseGalleryItem[]> {
  const dict = getDictionary(locale);
  const prefix = dict.home.showcaseAltPrefix;

  const admin = createSupabaseServiceRoleClient();
  if (admin) {
    const { data, error } = await admin
      .from("printed_products")
      .select("id, title, description, image_url, category, created_at")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return (data as PrintedRow[]).map((row) => mapRowToShowcase(prefix, row));
    }
  }

  const supabase = await createSupabaseServerClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("printed_products")
      .select("id, title, description, image_url, category, created_at")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return (data as PrintedRow[]).map((row) => mapRowToShowcase(prefix, row));
    }
  }

  return (await getShowcaseImagesForLocale(locale)) as ShowcaseGalleryItem[];
}

/** Admin gallery grid (same ordering). */
export async function listPrintedProductsAdmin(): Promise<{
  configured: boolean;
  rows: PrintedRow[];
  error?: string;
}> {
  const admin = createSupabaseServiceRoleClient();
  if (!admin) {
    return { configured: false, rows: [] };
  }
  const { data, error } = await admin
    .from("printed_products")
    .select("id, title, description, image_url, category, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return { configured: true, rows: [], error: error.message };
  }
  return { configured: true, rows: (data ?? []) as PrintedRow[] };
}
