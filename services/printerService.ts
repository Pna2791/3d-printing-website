import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { PrinterRow } from "@/lib/supabase/types";

export type { PrinterRow } from "@/lib/supabase/types";

export async function getPrinters(): Promise<{
  data: PrinterRow[] | null;
  error: string | null;
}> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return {
      data: null,
      error:
        "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
    };
  }
  const { data, error } = await supabase
    .from("printers")
    .select("*")
    .order("name", { ascending: true });

  return { data, error: error?.message ?? null };
}
