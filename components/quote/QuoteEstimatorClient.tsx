"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useDropzone } from "react-dropzone";
import { Box, Clock, Info, Loader2, Minus, Plus, Ruler, Upload, Weight } from "lucide-react";

import { FEATURES, OFFLINE_ORDER_CONTACT } from "@/lib/config";
import {
  applyMinimumOrderFloor,
  estimateCostFromSlicer,
  isStudentPromoActive,
  type SupportedMaterial,
} from "@/lib/pricing";

type SliceOkResponse = {
  ok: true;
  task_id: string;
  filename: string;
  filament_used_mm: number;
  estimated_print_time: string;
  model_dimensions: { x_mm: number; y_mm: number; z_mm: number };
  preview_image: string | null;
};

type SliceErrResponse = {
  ok?: false;
  code?: string;
  error?: string;
};

const vnd = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

/** Định dạng `XxYxZ mm` — làm tròn lên số nguyên mm mỗi trục (vd 61.389 → 62). */
function formatDimensionsXyzMm(x: number, y: number, z: number): string {
  if (![x, y, z].every((v) => Number.isFinite(v))) return "—";
  const a = Math.ceil(x);
  const b = Math.ceil(y);
  const c = Math.ceil(z);
  return `${a}x${b}x${c} mm`;
}

const MAX_QUANTITY = 9999;

export function QuoteEstimatorClient() {
  const [material, setMaterial] = useState<SupportedMaterial>("PLA");
  const [isStudent, setIsStudent] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SliceOkResponse | null>(null);

  const onDrop = useCallback(async (accepted: File[]) => {
    const file = accepted[0];
    if (!file) return;
    setError(null);
    setResult(null);
    setBusy(true);
    try {
      const body = new FormData();
      body.set("file", file, file.name);
      const res = await fetch("/api/slicer", {
        method: "POST",
        body,
      });
      const json = (await res.json()) as SliceOkResponse | SliceErrResponse;
      if (!res.ok || !("ok" in json) || json.ok !== true) {
        const err = json as SliceErrResponse;
        setError(err.error ?? `Lỗi ${res.status}`);
        return;
      }
      setResult(json);
      setQuantity(1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi mạng");
    } finally {
      setBusy(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "model/stl": [".stl"], "application/sla": [".stl"] },
    maxFiles: 1,
    disabled: busy,
    multiple: false,
  });

  const cost = useMemo(() => {
    if (!result) return null;
    return estimateCostFromSlicer(result.filament_used_mm, material, isStudent);
  }, [result, material, isStudent]);

  const unitWeightGramsCeil = cost ? Math.ceil(cost.weightGrams) : 0;

  const quoteTotals = useMemo(() => {
    if (!cost) return null;
    const q0 = Number.isFinite(quantity) && quantity >= 1 ? quantity : 1;
    const qty = Math.min(MAX_QUANTITY, Math.max(1, Math.floor(q0)));
    const lineSubtotal = Math.round(cost.totalVnd * qty);
    const floor = applyMinimumOrderFloor(lineSubtotal, isStudent);
    return { qty, lineSubtotal, ...floor };
  }, [cost, quantity, isStudent]);

  const totalWeightGrams = cost ? unitWeightGramsCeil * (quoteTotals?.qty ?? 1) : 0;

  const floorExplanation = useMemo(() => {
    if (!quoteTotals?.floorApplied) return null;
    return isStudent
      ? "Giá đã được điều chỉnh về mức tối thiểu 30.000đ dành cho sinh viên."
      : "Giá đã được điều chỉnh về mức tối thiểu 50.000đ cho đơn hàng phổ thông.";
  }, [quoteTotals, isStudent]);

  const orderLinkHref = useMemo(() => {
    if (!quoteTotals || !cost) return "/#dat-hang";
    const q = new URLSearchParams({
      quote_qty: String(quoteTotals.qty),
      quote_unit_g: String(unitWeightGramsCeil),
      quote_material: material,
      quote_student: isStudent ? "1" : "0",
      quote_total_vnd: String(quoteTotals.totalVnd),
    });
    return `/?${q.toString()}#dat-hang`;
  }, [quoteTotals, cost, unitWeightGramsCeil, material, isStudent]);

  const promoOn = isStudentPromoActive();

  const bumpQuantity = (delta: number) => {
    setQuantity((q) => {
      const next = Math.min(MAX_QUANTITY, Math.max(1, q + delta));
      return next;
    });
  };

  const onQuantityInput = (raw: string) => {
    const n = parseInt(raw, 10);
    if (Number.isNaN(n) || n < 1) {
      setQuantity(1);
      return;
    }
    setQuantity(Math.min(MAX_QUANTITY, n));
  };

  return (
    <div className="space-y-10">
      <div
        {...getRootProps()}
        className={[
          "relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-14 transition",
          isDragActive
            ? "border-emerald-500 bg-emerald-50/80 dark:border-emerald-400 dark:bg-emerald-950/30"
            : "border-zinc-300 bg-zinc-50/50 hover:border-emerald-400/80 hover:bg-emerald-50/40 dark:border-zinc-600 dark:bg-zinc-900/40 dark:hover:border-emerald-500/50",
          busy ? "pointer-events-none opacity-70" : "",
        ].join(" ")}
      >
        <input {...getInputProps()} />
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200">
          <Upload className="h-7 w-7" aria-hidden />
        </div>
        <p className="mt-4 text-center text-sm font-medium text-zinc-800 dark:text-zinc-100">
          {isDragActive ? "Thả file STL vào đây" : "Kéo thả file STL hoặc bấm để chọn"}
        </p>
        <p className="mt-1 text-center text-xs text-zinc-500 dark:text-zinc-400">
          Tối đa 50 MB · chỉ định dạng .stl
        </p>
      </div>

      {busy ? (
        <div className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3 text-sm font-medium text-emerald-800 dark:text-emerald-200">
            <Loader2 className="h-5 w-5 shrink-0 animate-spin" aria-hidden />
            Đang slice mô hình…
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 animate-quote-slicer-progress" />
          </div>
        </div>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
        >
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,280px)]">
          <div className="space-y-6">
            {result.preview_image ? (
              <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={result.preview_image}
                  alt={`Xem trước ${result.filename}`}
                  className="mx-auto max-h-80 w-full object-contain"
                />
              </div>
            ) : (
              <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-zinc-300 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                Không có ảnh xem trước từ slicer.
              </div>
            )}

            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {result.filename}
              </h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                <li className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
                  <Ruler className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                      Kích thước (XYZ)
                    </p>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {formatDimensionsXyzMm(
                        result.model_dimensions.x_mm,
                        result.model_dimensions.y_mm,
                        result.model_dimensions.z_mm,
                      )}
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
                  <Clock className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                      Thời gian in (ước tính)
                    </p>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {result.estimated_print_time || "—"}
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
                  <Box className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                      Độ dài nhựa đùn (1 mẫu)
                    </p>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {Number.isFinite(result.filament_used_mm)
                        ? `${result.filament_used_mm.toFixed(0)} mm`
                        : "—"}
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
                  <Weight className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                      Khối lượng ước tính (1 mẫu)
                    </p>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {cost ? `${unitWeightGramsCeil} g (${material})` : "—"}
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <aside className="space-y-6 rounded-2xl border border-zinc-200 bg-zinc-50/80 p-6 dark:border-zinc-800 dark:bg-zinc-900/60">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Đối tượng
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsStudent(false)}
                  className={[
                    "rounded-xl px-3 py-2 text-sm font-semibold transition",
                    !isStudent
                      ? "bg-emerald-600 text-white shadow-sm dark:bg-emerald-500"
                      : "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-200",
                  ].join(" ")}
                >
                  Người dùng thường
                </button>
                <button
                  type="button"
                  onClick={() => setIsStudent(true)}
                  className={[
                    "rounded-xl px-3 py-2 text-sm font-semibold transition",
                    isStudent
                      ? "bg-emerald-600 text-white shadow-sm dark:bg-emerald-500"
                      : "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-200",
                  ].join(" ")}
                >
                  Sinh viên
                </button>
              </div>
              {isStudent && !promoOn ? (
                <p className="mt-2 text-xs text-amber-700 dark:text-amber-300/90">
                  Giá ưu đãi sinh viên (trong đợt khuyến mãi) có thể chưa áp dụng theo ngày.
                </p>
              ) : null}
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Loại nhựa
              </p>
              <div className="mt-2 flex flex-wrap gap-3">
                {(["PLA", "PETG"] as const).map((m) => (
                  <label
                    key={m}
                    className={[
                      "flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition",
                      material === m
                        ? "border-emerald-600 bg-emerald-50 text-emerald-900 dark:border-emerald-500 dark:bg-emerald-950/50 dark:text-emerald-100"
                        : "border-zinc-300 bg-white text-zinc-700 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-200",
                    ].join(" ")}
                  >
                    <input
                      type="radio"
                      name="material"
                      value={m}
                      checked={material === m}
                      onChange={() => setMaterial(m)}
                      className="sr-only"
                    />
                    {m}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Số lượng</p>
              <div className="mt-2 flex max-w-[220px] items-center gap-2">
                <button
                  type="button"
                  aria-label="Giảm số lượng"
                  disabled={quantity <= 1}
                  onClick={() => bumpQuantity(-1)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-300 bg-white text-zinc-800 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
                >
                  <Minus className="h-4 w-4" aria-hidden />
                </button>
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={MAX_QUANTITY}
                  value={quantity}
                  onChange={(e) => onQuantityInput(e.target.value)}
                  className="h-10 w-full min-w-0 rounded-xl border border-zinc-300 bg-white text-center text-sm font-semibold tabular-nums text-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50"
                />
                <button
                  type="button"
                  aria-label="Tăng số lượng"
                  disabled={quantity >= MAX_QUANTITY}
                  onClick={() => bumpQuantity(1)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-300 bg-white text-zinc-800 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
                >
                  <Plus className="h-4 w-4" aria-hidden />
                </button>
              </div>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Tối thiểu 1 · tối đa {MAX_QUANTITY}</p>
            </div>

            {cost && quoteTotals ? (
              <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/90 p-4 dark:border-emerald-800 dark:bg-emerald-950/40">
                <p className="text-xs font-medium uppercase tracking-wide text-emerald-800 dark:text-emerald-300/90">
                  Ước tính giá in (tổng)
                </p>
                <p className="mt-1 text-2xl font-bold tracking-tight text-emerald-950 dark:text-emerald-100">
                  {vnd.format(quoteTotals.totalVnd)}
                </p>
                {floorExplanation ? (
                  <p
                    className="mt-2 flex gap-1.5 text-xs leading-snug text-zinc-500 dark:text-zinc-400"
                    role="status"
                  >
                    <Info
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600/50 dark:text-emerald-400/40"
                      aria-hidden
                    />
                    <span>{floorExplanation}</span>
                  </p>
                ) : null}
                <p className="mt-2 text-xs text-emerald-900/85 dark:text-emerald-200/80">
                  {vnd.format(cost.totalVnd)} × {quoteTotals.qty} = {vnd.format(quoteTotals.lineSubtotal)}
                </p>
                {cost.isStudentDiscountApplied ? (
                  <p className="mt-2 text-xs text-emerald-800/90 dark:text-emerald-200/80">
                    Giá 1 mẫu: áp dụng {cost.discountedGrams.toFixed(0)} g theo giá sinh viên trong đợt
                    khuyến mãi (trên 1 mẫu).
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="space-y-2">
              <Link
                href={orderLinkHref}
                className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400"
              >
                Đặt in mẫu này
              </Link>
              {!FEATURES.ORDER_ENABLED || !FEATURES.AUTH_ENABLED ? (
                <div className="space-y-2 text-center text-xs text-zinc-600 dark:text-zinc-400">
                  <p>Đặt hàng trực tuyến đang tắt — vui lòng liên hệ:</p>
                  <p className="flex flex-col items-center gap-1 sm:flex-row sm:justify-center sm:gap-x-4 sm:gap-y-0">
                    <a
                      href={OFFLINE_ORDER_CONTACT.zaloTelHref}
                      className="font-medium text-emerald-700 underline-offset-2 hover:underline dark:text-emerald-400"
                    >
                      Zalo: {OFFLINE_ORDER_CONTACT.zaloDisplay}
                    </a>
                    <span className="hidden text-zinc-300 sm:inline dark:text-zinc-600" aria-hidden>
                      ·
                    </span>
                    <a
                      href={OFFLINE_ORDER_CONTACT.fanpageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-emerald-700 underline-offset-2 hover:underline dark:text-emerald-400"
                    >
                      {OFFLINE_ORDER_CONTACT.fanpageLabel}
                    </a>
                  </p>
                  <p className="text-zinc-500 dark:text-zinc-500">
                    Ghi chú báo giá: số lượng {quoteTotals?.qty ?? "—"}, khối lượng tổng ~{cost ? `${totalWeightGrams} g` : "…"}{" "}
                    ({material}
                    {quoteTotals?.floorApplied
                      ? `, tổng thanh toán tối thiểu ${vnd.format(quoteTotals.totalVnd)}`
                      : ""}
                    ).
                  </p>
                </div>
              ) : (
                <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
                  Mở form đặt hàng trên trang chủ; tham khảo tổng khối lượng ~{cost ? `${totalWeightGrams} g` : "…"}{" "}
                  ({unitWeightGramsCeil} g/mẫu × {quoteTotals?.qty ?? "—"}), tổng tiền ước tính{" "}
                  {quoteTotals ? vnd.format(quoteTotals.totalVnd) : "—"}.
                </p>
              )}
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
