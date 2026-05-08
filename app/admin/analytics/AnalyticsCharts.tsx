"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type HourRow = { bucket: string; view_count: number };
type DayRow = { bucket: string; view_count: number };
type TopRow = { url: string; view_count: number };

/** X-axis: local time only (hour); instant `iso` is interpreted in the viewer's timezone. */
function formatHourAxisTick(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString(undefined, { hour: "2-digit", hour12: true });
  } catch {
    return String(iso);
  }
}

/** Tooltip label: include date where the axis is time-only (helps across midnight in the 24h window). */
function formatHourTooltipLabel(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return String(iso);
  }
}

function formatDayLabel(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}

type AnalyticsChartsProps = {
  byHour: HourRow[];
  byDay: DayRow[];
  topUrls: TopRow[];
};

export function AnalyticsCharts({ byHour, byDay, topUrls }: AnalyticsChartsProps) {
  const hourly = byHour.map((r) => ({
    bucket: r.bucket,
    views: r.view_count,
  }));

  const daily = byDay.map((r) => ({
    label: formatDayLabel(r.bucket),
    views: r.view_count,
  }));

  const top = topUrls.map((r) => ({
    label: r.url.length > 42 ? `${r.url.slice(0, 40)}…` : r.url,
    fullUrl: r.url,
    views: r.view_count,
  }));

  const chartClass =
    "rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950";

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className={chartClass}>
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Views by hour (last 24h)</h2>
        <div className="mt-4 h-72 w-full min-w-0">
          {hourly.length === 0 ? (
            <p className="text-sm text-zinc-500">No data in this window yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourly} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
                <XAxis
                  dataKey="bucket"
                  tickFormatter={formatHourAxisTick}
                  tick={{ fontSize: 11 }}
                  interval="preserveStartEnd"
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={36} />
                <Tooltip
                  labelFormatter={(label) => formatHourTooltipLabel(String(label))}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid rgb(228 228 231)",
                    fontSize: "12px",
                  }}
                />
                <Line type="monotone" dataKey="views" stroke="#059669" strokeWidth={2} dot={false} name="Views" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className={chartClass}>
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Views by day (last 7 days)</h2>
        <div className="mt-4 h-72 w-full min-w-0">
          {daily.length === 0 ? (
            <p className="text-sm text-zinc-500">No data in this window yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={daily} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={36} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid rgb(228 228 231)",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="views" fill="#10b981" radius={[6, 6, 0, 0]} name="Views" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className={`${chartClass} lg:col-span-2`}>
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Top pages (last 7 days)</h2>
        {top.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">No paths recorded yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-zinc-200 dark:divide-zinc-800">
            {top.map((row) => (
              <li key={row.fullUrl} className="flex items-center justify-between gap-4 py-3 text-sm first:pt-0">
                <span className="truncate font-mono text-zinc-700 dark:text-zinc-300" title={row.fullUrl}>
                  {row.label}
                </span>
                <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
                  {row.views}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
