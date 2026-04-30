import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service";

export type AnalyticsDashboardData = {
  configured: boolean;
  total: number;
  today: number;
  last7days: number;
  byHour: { bucket: string; view_count: number }[];
  byDay: { bucket: string; view_count: number }[];
  topUrls: { url: string; view_count: number }[];
  error?: string;
};

function startOfTodayUtc(): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export async function loadAnalyticsDashboard(): Promise<AnalyticsDashboardData> {
  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) {
    return {
      configured: false,
      total: 0,
      today: 0,
      last7days: 0,
      byHour: [],
      byDay: [],
      topUrls: [],
    };
  }

  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const todayStart = startOfTodayUtc();

  const since7dIso = since7d.toISOString();
  const since24hIso = since24h.toISOString();
  const todayIso = todayStart.toISOString();

  const [totalRes, todayRes, weekRes, hourRes, dayRes, topRes] = await Promise.all([
    supabase.from("page_views").select("id", { count: "exact", head: true }),
    supabase.from("page_views").select("id", { count: "exact", head: true }).gte("created_at", todayIso),
    supabase.from("page_views").select("id", { count: "exact", head: true }).gte("created_at", since7dIso),
    supabase.rpc("analytics_page_views_by_hour", { p_since: since24hIso }),
    supabase.rpc("analytics_page_views_by_day", { p_since: since7dIso }),
    supabase.rpc("analytics_top_urls", { p_since: since7dIso, p_limit: 10 }),
  ]);

  const errors = [hourRes.error, dayRes.error, topRes.error, totalRes.error, todayRes.error, weekRes.error].filter(
    (e): e is NonNullable<typeof e> => Boolean(e),
  );

  return {
    configured: true,
    total: totalRes.count ?? 0,
    today: todayRes.count ?? 0,
    last7days: weekRes.count ?? 0,
    byHour: hourRes.data ?? [],
    byDay: dayRes.data ?? [],
    topUrls: topRes.data ?? [],
    error: errors.length ? errors.map((e) => e.message).join("; ") : undefined,
  };
}
