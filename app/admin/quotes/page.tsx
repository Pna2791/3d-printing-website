import Link from "next/link";
import { Activity, ArrowLeft, FileText, ImageIcon, LayoutDashboard, LogOut } from "lucide-react";

import {
  formatVietnamDateTime,
  loadQuoteCheckoutRequests,
  shortId,
} from "@/lib/admin/quote-checkout-requests";

export const dynamic = "force-dynamic";

function formatVnd(n: number): string {
  return `${n.toLocaleString("vi-VN")} ₫`;
}

export default async function AdminQuotesPage() {
  const { configured, rows, error } = await loadQuoteCheckoutRequests();

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-200">
              <Activity className="size-3.5" aria-hidden />
              Internal
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">Quote requests</h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
              Đơn từ báo giá STL (<code className="rounded bg-zinc-200 px-1 py-0.5 text-xs dark:bg-zinc-800">quote_checkout_requests</code>
              ). Khách gửi tên và SĐT — không lưu email trên form hiện tại. Giờ theo múi{" "}
              <span className="font-medium text-zinc-800 dark:text-zinc-200">Asia/Ho_Chi_Minh</span>.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-white dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              <LayoutDashboard className="size-4" aria-hidden />
              Dashboard
            </Link>
            <Link
              href="/admin/analytics"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-white dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              Analytics
            </Link>
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

        {!configured ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
            <p className="font-medium">Supabase service role is not configured.</p>
            <p className="mt-2 text-sm opacity-90">
              Set{" "}
              <code className="rounded bg-amber-100/80 px-1 py-0.5 text-xs dark:bg-amber-900/50">SUPABASE_SERVICE_ROLE_KEY</code>{" "}
              on the server, then restart.
            </p>
          </div>
        ) : (
          <>
            {error ? (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100">
                {error}
              </div>
            ) : null}

            {rows.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-700 dark:bg-zinc-900/50">
                <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/80">
                  <FileText className="size-7 text-zinc-400" aria-hidden />
                </div>
                <p className="mt-4 text-lg font-semibold text-zinc-800 dark:text-zinc-100">Chưa có yêu cầu báo giá</p>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  Khi khách gửi Đặt in theo báo giá trên trang STL, bản ghi sẽ xuất hiện ở đây.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-zinc-200 bg-zinc-50/80 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-400">
                        <th className="px-4 py-3">Thời gian / ID</th>
                        <th className="px-4 py-3">Khách</th>
                        <th className="px-4 py-3">Đơn</th>
                        <th className="w-24 px-4 py-3">Preview</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                      {rows.map((row) => (
                        <tr key={row.id} className="align-top hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
                          <td className="px-4 py-3">
                            <time
                              className="block font-medium tabular-nums text-zinc-900 dark:text-zinc-100"
                              dateTime={row.created_at}
                            >
                              {formatVietnamDateTime(row.created_at)}
                            </time>
                            <span
                              className="mt-1 block font-mono text-xs text-zinc-500"
                              title={row.id}
                            >
                              {shortId(row.id)}…
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-zinc-900 dark:text-zinc-100">{row.customer_name}</div>
                            <div className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-500">
                              Email:{" "}
                              <span className="text-zinc-400 dark:text-zinc-600" title="Form does not collect email">
                                —
                              </span>
                            </div>
                            <div className="mt-1 tabular-nums text-zinc-800 dark:text-zinc-200">{row.customer_phone}</div>
                            {row.customer_note?.trim() ? (
                              <p className="mt-2 max-w-xs text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                                {row.customer_note.length > 160
                                  ? `${row.customer_note.slice(0, 160)}…`
                                  : row.customer_note}
                              </p>
                            ) : null}
                          </td>
                          <td className="px-4 py-3">
                            <div className="max-w-[220px] truncate font-mono text-xs text-zinc-500 dark:text-zinc-400" title={row.filename}>
                              {row.filename}
                            </div>
                            <div className="mt-1 font-medium text-zinc-900 dark:text-zinc-100">{row.material}</div>
                            <div className="mt-1 text-zinc-600 dark:text-zinc-400">
                              SL:{" "}
                              <span className="tabular-nums font-medium text-zinc-800 dark:text-zinc-200">
                                {row.quantity.toLocaleString("vi-VN")}
                              </span>
                            </div>
                            <div className="mt-1 font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                              {formatVnd(row.total_vnd)}
                            </div>
                            {row.is_student ? (
                              <span className="mt-2 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">
                                Sinh viên
                              </span>
                            ) : null}
                          </td>
                          <td className="px-4 py-3">
                            {row.preview_image_url ? (
                              <a
                                href={row.preview_image_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group block"
                                title="Mở ảnh preview (tab mới)"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element -- external Supabase URL; avoids remotePatterns config */}
                                <img
                                  src={row.preview_image_url}
                                  alt=""
                                  className="size-14 rounded-lg border border-zinc-200 object-cover transition group-hover:border-emerald-500/60 dark:border-zinc-700"
                                  loading="lazy"
                                />
                                <span className="sr-only">Open preview</span>
                              </a>
                            ) : (
                              <span className="inline-flex size-14 items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/60">
                                <ImageIcon className="size-5 text-zinc-400" aria-hidden />
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
