import Link from "next/link";
import { Activity, ArrowLeft, BarChart3, Eye, LineChart, LogOut } from "lucide-react";

import { loadAnalyticsDashboard } from "@/lib/analytics/dashboard-data";

import { AnalyticsCharts } from "./AnalyticsCharts";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const data = await loadAnalyticsDashboard();

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-200">
              <Activity className="size-3.5" aria-hidden />
              Internal analytics
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">Traffic overview</h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
              Page views are recorded in middleware (hashed IPs). Configure{" "}
              <code className="rounded bg-zinc-200 px-1 py-0.5 text-xs dark:bg-zinc-800">SUPABASE_SERVICE_ROLE_KEY</code>{" "}
              on the server to load charts. Protected access is controlled by{" "}
              <code className="rounded bg-zinc-200 px-1 py-0.5 text-xs dark:bg-zinc-800">ADMIN_ANALYTICS_SECRET</code>{" "}
              with an HttpOnly auth cookie.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <form action="/api/admin/logout" method="post">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-white dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
              >
                <LogOut className="size-4" aria-hidden />
                Logout
              </button>
            </form>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-white dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              <ArrowLeft className="size-4" aria-hidden />
              Home
            </Link>
          </div>
        </div>

        {!data.configured ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
            <p className="font-medium">Supabase service role is not configured.</p>
            <p className="mt-2 text-sm opacity-90">
              Set <code className="rounded bg-amber-100/80 px-1 py-0.5 text-xs dark:bg-amber-900/50">SUPABASE_SERVICE_ROLE_KEY</code>{" "}
              alongside your existing public Supabase variables, then redeploy or restart the dev server.
            </p>
          </div>
        ) : (
          <>
            {data.error ? (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100">
                {data.error}
              </div>
            ) : null}

            <div className="mb-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  <Eye className="size-4 text-emerald-600 dark:text-emerald-400" aria-hidden />
                  Total views
                </div>
                <p className="mt-2 text-3xl font-semibold tabular-nums">{data.total.toLocaleString()}</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  <LineChart className="size-4 text-emerald-600 dark:text-emerald-400" aria-hidden />
                  Today (UTC)
                </div>
                <p className="mt-2 text-3xl font-semibold tabular-nums">{data.today.toLocaleString()}</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  <BarChart3 className="size-4 text-emerald-600 dark:text-emerald-400" aria-hidden />
                  Last 7 days
                </div>
                <p className="mt-2 text-3xl font-semibold tabular-nums">{data.last7days.toLocaleString()}</p>
              </div>
            </div>

            <AnalyticsCharts byHour={data.byHour} byDay={data.byDay} topUrls={data.topUrls} />
          </>
        )}
      </div>
    </div>
  );
}
