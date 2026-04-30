"use client";

import { useEffect, useMemo, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { PrinterRow } from "@/lib/supabase/types";

type PrinterStatusLiveProps = {
  initialPrinters: PrinterRow[];
};

function sortPrinters(rows: PrinterRow[]) {
  return [...rows].sort((a, b) => a.name.localeCompare(b.name));
}

function statusBadgeClasses(status: PrinterRow["status"]) {
  switch (status) {
    case "ready":
      return "border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200";
    case "busy":
      return "border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-100";
    case "maintenance":
      return "border-red-500/40 bg-red-500/10 text-red-800 dark:text-red-200";
    default:
      return "border-zinc-300 bg-zinc-100 text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200";
  }
}

function statusLabel(status: PrinterRow["status"]) {
  switch (status) {
    case "ready":
      return "Sẵn sàng";
    case "busy":
      return "Đang bận";
    case "maintenance":
      return "Bảo trì";
    default:
      return status;
  }
}

export function PrinterStatusLive({ initialPrinters }: PrinterStatusLiveProps) {
  const [printers, setPrinters] = useState<PrinterRow[]>(() =>
    sortPrinters(initialPrinters),
  );
  const [error, setError] = useState<string | null>(null);

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  useEffect(() => {
    setPrinters(sortPrinters(initialPrinters));
  }, [initialPrinters]);

  useEffect(() => {
    if (!supabase) {
      setError(
        "Cần NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_ANON_KEY để bật realtime phía trình duyệt.",
      );
      return;
    }

    let cancelled = false;

    const refresh = async () => {
      const { data, error: fetchError } = await supabase
        .from("printers")
        .select("*")
        .order("name", { ascending: true });

      if (cancelled) return;
      if (fetchError) {
        setError(fetchError.message);
        return;
      }
      setError(null);
      setPrinters(sortPrinters((data ?? []) as PrinterRow[]));
    };

    const channel = supabase
      .channel("public-printers")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "printers" },
        () => {
          void refresh();
        },
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          setError("Lỗi kênh realtime (kiểm tra cấu hình Supabase Realtime cho `printers`).");
        }
      });

    void refresh();

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [supabase]);

  if (printers.length === 0) {
    return (
      <section aria-labelledby="printers-heading" className="py-16">
        <h2
          id="printers-heading"
          className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
        >
          Tình trạng máy in
        </h2>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          Chưa có dữ liệu máy in công khai. Thêm dữ liệu trong Supabase để hiển thị.
        </p>
        {error ? (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        ) : null}
      </section>
    );
  }

  return (
    <section
      aria-labelledby="printers-heading"
      className="rounded-3xl border border-zinc-200 bg-zinc-50/70 p-8 dark:border-zinc-800 dark:bg-zinc-900/30"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <h2
          id="printers-heading"
          className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
        >
          Tình trạng máy in
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Cập nhật realtime qua Supabase (dữ liệu ban đầu lấy từ server).
        </p>
      </div>
      {error ? (
        <p className="mt-2 text-sm text-amber-700 dark:text-amber-300" role="status">
          {error}
        </p>
      ) : null}
      <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {printers.map((printer) => (
          <li
            key={printer.id}
            className="flex flex-col rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                  {printer.name}
                </p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {printer.model}
                </p>
              </div>
              <span
                className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${statusBadgeClasses(printer.status)}`}
              >
                {statusLabel(printer.status)}
              </span>
            </div>
            <p className="mt-4 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Thể tích in (mm)
            </p>
            <p className="mt-1 font-mono text-sm text-zinc-800 dark:text-zinc-200">
              {printer.build_volume_x} × {printer.build_volume_y} ×{" "}
              {printer.build_volume_z}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
