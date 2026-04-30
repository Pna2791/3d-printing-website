import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { WorkshopInfoRow } from "@/lib/supabase/types";

export async function getWorkshopInfo(): Promise<{
  data: WorkshopInfoRow[] | null;
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
    .from("workshop_info")
    .select("*")
    .order("key", { ascending: true });

  return { data, error: error?.message ?? null };
}
