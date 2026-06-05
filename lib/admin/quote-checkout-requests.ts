import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service";
import type { Database } from "@/lib/supabase/types";

export type QuoteCheckoutRequestRow = Database["public"]["Tables"]["quote_checkout_requests"]["Row"];

export async function loadQuoteCheckoutRequests(): Promise<{
  configured: boolean;
  rows: QuoteCheckoutRequestRow[];
  error?: string;
}> {
  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) {
    return { configured: false, rows: [] };
  }

  const { data, error } = await supabase
    .from("quote_checkout_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return { configured: true, rows: [], error: error.message };
  }

  return { configured: true, rows: data ?? [] };
}

/** Vietnam time (ICT, UTC+7) for admin display. */
export function formatVietnamDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function shortId(id: string): string {
  return id.replace(/-/g, "").slice(0, 8);
}
