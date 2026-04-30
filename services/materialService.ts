import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { MaterialRow, MaterialWithPricing } from "@/lib/supabase/types";

export type { MaterialRow } from "@/lib/supabase/types";

export async function getMaterials(): Promise<{
  data: MaterialRow[] | null;
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
    .from("materials")
    .select("*")
    .order("name", { ascending: true });

  return { data, error: error?.message ?? null };
}

export async function getMaterialsWithPricing(): Promise<{
  data: MaterialWithPricing[] | null;
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
    .from("materials")
    .select("*, pricing_rules(*)")
    .order("name", { ascending: true });

  return {
    data: data as MaterialWithPricing[] | null,
    error: error?.message ?? null,
  };
}
