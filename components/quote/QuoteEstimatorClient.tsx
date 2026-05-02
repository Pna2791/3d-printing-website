"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useDropzone } from "react-dropzone";
import { Box, Clock, Info, Loader2, Minus, Plus, Ruler, Scaling, Upload, Weight } from "lucide-react";

import { fireQuoteMetadataConfetti } from "@/lib/confetti";
import { FEATURES, OFFLINE_ORDER_CONTACT } from "@/lib/config";
import {
  applyMinimumOrderFloor,
  clampUniformModelScale,
  estimateCostFromSlicer,
  isStudentPromoActive,
  MODEL_SCALE_DEFAULT,
  MODEL_SCALE_MAX,
  MODEL_SCALE_MIN,
  MODEL_SCALE_STEP,
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
  /** Server hint when `preview_image` is null (thumb microservice / env). */
  preview_error?: string | null;
  preview_pending?: boolean;
  uniform_scale?: number;
  skip_preview?: boolean;
};

type QuoteSliceMetadata = {
  task_id: string;
  filename: string;
  filament_used_mm: number;
  estimated_print_time: string;
  model_dimensions: { x_mm: number; y_mm: number; z_mm: number };
};

type PreviewLoadStatus = "idle" | "loading" | "ready" | "error";

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

const vndPlain = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 });

function formatVndPlain(amount: number): string {
  return `${vndPlain.format(Math.round(amount))} đ`;
}

/** Định dạng `XxYxZ mm` — làm tròn lên số nguyên mm mỗi trục (vd 61.389 → 62). */
function formatDimensionsXyzMm(x: number, y: number, z: number): string {
  if (![x, y, z].every((v) => Number.isFinite(v))) return "—";
  const a = Math.ceil(x);
  const b = Math.ceil(y);
  const c = Math.ceil(z);
  return `${a}x${b}x${c} mm`;
}

const MAX_QUANTITY = 9999;
const DEFAULT_QUANTITY = 1;

function StatCardSkeleton() {
  return (
    <li className="flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3">
      <div className="mt-0.5 h-5 w-5 shrink-0 animate-pulse rounded-md bg-zinc-700/80" aria-hidden />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-3 w-28 max-w-full animate-pulse rounded bg-zinc-700/70" />
        <div className="h-4 w-36 max-w-full animate-pulse rounded bg-zinc-600/60" />
      </div>
    </li>
  );
}

function PreviewGeneratingPlaceholder({
  headline = "Generating 3D Preview…",
  subline,
}: {
  headline?: string;
  subline?: string;
}) {
  return (
    <div
      className="flex min-h-[240px] flex-col items-center justify-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6"
      aria-busy
      aria-label="Generating 3D preview"
    >
      <Loader2 className="h-9 w-9 animate-spin text-emerald-500" aria-hidden />
      <div className="h-40 w-full max-w-sm animate-pulse rounded-xl bg-gradient-to-r from-zinc-800 via-zinc-700/80 to-zinc-800" />
      <p className="text-center text-sm font-medium text-zinc-300">{headline}</p>
      {subline ? <p className="text-center text-xs text-zinc-500">{subline}</p> : null}
    </div>
  );
}

function PriceBlockSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
      <div className="h-3 w-40 animate-pulse rounded bg-zinc-700/70" />
      <div className="mt-3 h-9 w-48 animate-pulse rounded-lg bg-zinc-700/60" />
      <div className="mt-3 h-3 w-full max-w-[220px] animate-pulse rounded bg-zinc-600/50" />
    </div>
  );
}

export function QuoteEstimatorClient() {
  const [material, setMaterial] = useState<SupportedMaterial>("PLA");
  const [isStudent, setIsStudent] = useState(false);
  const [quantity, setQuantity] = useState(DEFAULT_QUANTITY);
  const [isSlicing, setIsSlicing] = useState(false);
  const [pendingFileName, setPendingFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<QuoteSliceMetadata | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewStatus, setPreviewStatus] = useState<PreviewLoadStatus>("idle");
  const [previewHint, setPreviewHint] = useState<string | null>(null);
  const [modelScale, setModelScale] = useState(MODEL_SCALE_DEFAULT);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [isRescaling, setIsRescaling] = useState(false);
  const lastSyncedScaleRef = useRef(MODEL_SCALE_DEFAULT);

  const onDrop = useCallback(async (accepted: File[]) => {
    const file = accepted[0];
    if (!file) return;
    setError(null);
    setMetadata(null);
    setPreviewUrl(null);
    setPreviewStatus("idle");
    setPreviewHint(null);
    setModelScale(MODEL_SCALE_DEFAULT);
    setSourceFile(null);
    lastSyncedScaleRef.current = MODEL_SCALE_DEFAULT;
    setPendingFileName(file.name);
    setIsSlicing(true);
    try {
      // multipart/form-data: chỉ truyền FormData — trình duyệt tự gắn boundary, không set Content-Type thủ công.
      const body = new FormData();
      body.append("file", file, file.name);
      body.append("uniform_scale", String(MODEL_SCALE_DEFAULT));
      const res = await fetch("/api/slicer", {
        method: "POST",
        body,
      });
      const json = (await res.json()) as SliceOkResponse | SliceErrResponse;
      if (!res.ok || !("ok" in json) || json.ok !== true) {
        const err = json as SliceErrResponse;
        setError(err.error ?? `Lỗi ${res.status}`);
        setPendingFileName(null);
        return;
      }
      const data = json;
      setMetadata({
        task_id: data.task_id,
        filename: data.filename,
        filament_used_mm: data.filament_used_mm,
        estimated_print_time: data.estimated_print_time,
        model_dimensions: data.model_dimensions,
      });
      lastSyncedScaleRef.current = clampUniformModelScale(MODEL_SCALE_DEFAULT);
      setSourceFile(file);
      setPendingFileName(null);
      fireQuoteMetadataConfetti();
      if (data.preview_image) {
        setPreviewUrl(data.preview_image);
        setPreviewStatus("ready");
        setPreviewHint(null);
      } else {
        setPreviewUrl(null);
        setPreviewStatus("ready");
        setPreviewHint(typeof data.preview_error === "string" && data.preview_error ? data.preview_error : null);
      }
      setQuantity(DEFAULT_QUANTITY);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi mạng");
      setPendingFileName(null);
    } finally {
      setIsSlicing(false);
    }
  }, []);

  useEffect(() => {
    if (!sourceFile) return;
    const scale = clampUniformModelScale(modelScale);
    if (scale === lastSyncedScaleRef.current) return;

    const ac = new AbortController();
    const tid = window.setTimeout(() => {
      void (async () => {
        setIsRescaling(true);
        setError(null);
        try {
          const body = new FormData();
          body.append("file", sourceFile, sourceFile.name);
          body.append("skip_preview", "1");
          body.append("uniform_scale", String(scale));
          const res = await fetch("/api/slicer", {
            method: "POST",
            body,
            signal: ac.signal,
          });
          const json = (await res.json()) as SliceOkResponse | SliceErrResponse;
          if (!res.ok || !("ok" in json) || json.ok !== true) {
            const err = json as SliceErrResponse;
            setError(err.error ?? `Lỗi ${res.status}`);
            setModelScale(lastSyncedScaleRef.current);
            return;
          }
          const data = json;
          setMetadata((prev) =>
            prev
              ? {
                  ...prev,
                  task_id: data.task_id,
                  filename: data.filename,
                  filament_used_mm: data.filament_used_mm,
                  estimated_print_time: data.estimated_print_time,
                  model_dimensions: data.model_dimensions,
                }
              : null,
          );
          lastSyncedScaleRef.current = scale;
        } catch (e) {
          if (e instanceof DOMException && e.name === "AbortError") return;
          setError(e instanceof Error ? e.message : "Lỗi mạng");
          setModelScale(lastSyncedScaleRef.current);
        } finally {
          setIsRescaling(false);
        }
      })();
    }, 650);

    return () => {
      window.clearTimeout(tid);
      ac.abort();
    };
  }, [modelScale, sourceFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "model/stl": [".stl"], "application/sla": [".stl"] },
    maxFiles: 1,
    disabled: isSlicing || isRescaling,
    multiple: false,
  });

  const cost = useMemo(() => {
    if (!metadata) return null;
    return estimateCostFromSlicer(metadata.filament_used_mm, material, isStudent);
  }, [metadata, material, isStudent]);

  const unitWeightGramsCeil = cost ? Math.ceil(cost.weightGrams) : 0;

  const quoteTotals = useMemo(() => {
    if (!cost) return null;
    const q0 = Number.isFinite(quantity) && quantity >= 1 ? quantity : DEFAULT_QUANTITY;
    const qty = Math.min(MAX_QUANTITY, Math.max(1, Math.floor(q0)));
    const lineSubtotal = Math.round(cost.totalVnd * qty);
    const floor = applyMinimumOrderFloor(lineSubtotal, isStudent);
    return { qty, lineSubtotal, ...floor };
  }, [cost, quantity, isStudent]);

  const totalWeightGrams = cost ? unitWeightGramsCeil * (quoteTotals?.qty ?? 1) : 0;

  const floorExplanation = useMemo(() => {
    if (!quoteTotals?.floorApplied) return null;
    return isStudent
      ? "Giá đã được điều chỉnh về mức tối thiểu 30.000đ cho sinh viên."
      : "Giá đã được điều chỉnh về mức tối thiểu 50.000đ cho người dùng thường.";
  }, [quoteTotals, isStudent]);

  const orderLinkHref = useMemo(() => {
    if (!quoteTotals || !cost) return "/#dat-hang";
    const q = new URLSearchParams({
      quote_qty: String(quoteTotals.qty),
      quote_unit_g: String(unitWeightGramsCeil),
      quote_material: material,
      quote_student: isStudent ? "1" : "0",
      quote_total_vnd: String(quoteTotals.totalVnd),
      quote_scale: clampUniformModelScale(modelScale).toFixed(2),
    });
    return `/?${q.toString()}#dat-hang`;
  }, [quoteTotals, cost, unitWeightGramsCeil, material, isStudent, modelScale]);

  const promoOn = isStudentPromoActive();

  const onPreviewImageError = useCallback(() => {
    setPreviewUrl(null);
    setPreviewStatus("error");
  }, []);

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

  const displayFilename = metadata?.filename ?? pendingFileName ?? "";
  const showWorkspace = Boolean(pendingFileName || metadata);
  const showStatSkeletons = isSlicing || !metadata || isRescaling;
  const previewGenerating = isSlicing;

  return (
    <div className="space-y-8">
      <div
        {...getRootProps()}
        className={[
          "relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-14 transition",
          isDragActive
            ? "border-emerald-500 bg-emerald-500/10"
            : "border-zinc-600 bg-zinc-950/50 hover:border-emerald-500/70 hover:bg-zinc-900/60",
          isSlicing ? "pointer-events-none opacity-60" : "",
        ].join(" ")}
      >
        <input {...getInputProps()} />
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
          <Upload className="h-7 w-7" aria-hidden />
        </div>
        <p className="mt-4 text-center text-sm font-medium text-zinc-100">
          {isDragActive ? "Thả file STL vào đây" : "Kéo thả file STL hoặc bấm để chọn"}
        </p>
        <p className="mt-1 text-center text-xs text-zinc-500">
          Tối đa 50 MB · chỉ định dạng .stl
        </p>
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-2xl border border-red-900/50 bg-red-950/50 px-4 py-3 text-sm text-red-200"
        >
          {error}
        </div>
      ) : null}

      {showWorkspace ? (
        <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5 shadow-xl shadow-black/30 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,300px)]">
            <div className="space-y-6">
              {previewUrl ? (
                <div className="space-y-2">
                  <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt={`Xem trước ${displayFilename}`}
                      className="mx-auto max-h-80 w-full object-contain"
                      onError={onPreviewImageError}
                    />
                  </div>
                  {modelScale !== MODEL_SCALE_DEFAULT ? (
                    <p className="text-center text-[11px] leading-snug text-zinc-500">
                      Ảnh là file gốc đã tải; giá và kích thước bên dưới theo tỷ lệ{" "}
                      <span className="font-semibold text-zinc-400">
                        {(clampUniformModelScale(modelScale) * 100).toFixed(0)}%
                      </span>
                      .
                    </p>
                  ) : null}
                </div>
              ) : previewGenerating ? (
                <PreviewGeneratingPlaceholder
                  headline="Generating 3D Preview…"
                  subline="Đang lấy metadata slicer và dựng ảnh xem trước…"
                />
              ) : previewStatus === "error" ? (
                <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/40 px-4 text-center text-sm text-zinc-400">
                  <p>Ảnh xem trước chưa sẵn sàng.</p>
                  <p className="text-xs text-zinc-500">
                    Ảnh không hiển thị được hoặc máy chủ chưa cấu hình bộ dựng thumbnail. Báo giá bên vẫn dùng
                    metadata đã nhận.
                  </p>
                </div>
              ) : (
                <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-zinc-700 px-4 py-6 text-center">
                  <p className="text-sm font-medium text-zinc-400">Chưa có ảnh xem trước 3D</p>
                  <p className="max-w-md text-xs leading-relaxed text-zinc-500">
                    Ảnh được tạo bởi dịch vụ <span className="text-zinc-400">thumb-service</span> (FastAPI), không
                    phải slicer. Khi chạy <span className="text-zinc-400">next dev</span> trên máy, đặt{" "}
                    <code className="rounded bg-zinc-800 px-1 py-0.5 text-[11px] text-emerald-400/90">
                      STL2THUMB_SERVICE_URL=http://127.0.0.1:8887
                    </code>{" "}
                    nếu API thumbnail chạy cổng 8887; trong Docker Compose dùng{" "}
                    <code className="rounded bg-zinc-800 px-1 py-0.5 text-[11px] text-emerald-400/90">
                      http://thumb-service:8887
                    </code>
                    .
                  </p>
                  {previewHint ? (
                    <p
                      className="mt-1 max-w-full break-words font-mono text-[11px] text-zinc-600"
                      title={previewHint}
                    >
                      {previewHint}
                    </p>
                  ) : null}
                </div>
              )}

              <p className="flex gap-2 rounded-xl border border-amber-500/20 bg-amber-950/25 px-3 py-2 text-xs leading-relaxed text-amber-100/90">
                <Info className="mt-0.5 h-4 w-4 shrink-0 opacity-80" aria-hidden />
                <span>
                  <strong className="font-semibold">Xem trước (beta):</strong> chất lượng hình ảnh có thể
                  chưa tốt; đây chỉ là minh họa từ geometry STL,{" "}
                  <strong className="font-semibold">không phải thành phẩm in</strong> thực tế.
                </span>
              </p>

              <div>
                <h2 className="text-lg font-semibold text-zinc-50">{displayFilename}</h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {showStatSkeletons ? (
                    <>
                      <StatCardSkeleton />
                      <StatCardSkeleton />
                      <StatCardSkeleton />
                      <StatCardSkeleton />
                    </>
                  ) : metadata ? (
                      <>
                        <li className="flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3">
                          <Ruler className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" aria-hidden />
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                              Kích thước (XYZ)
                            </p>
                            <p className="text-sm font-semibold text-zinc-100">
                              {formatDimensionsXyzMm(
                                metadata.model_dimensions.x_mm,
                                metadata.model_dimensions.y_mm,
                                metadata.model_dimensions.z_mm,
                              )}
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3">
                          <Clock className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" aria-hidden />
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                              Thời gian in (ước tính)
                            </p>
                            <p className="text-sm font-semibold text-zinc-100">
                              {metadata.estimated_print_time || "—"}
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3">
                          <Box className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" aria-hidden />
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                              Độ dài nhựa đùn (1 mẫu)
                            </p>
                            <p className="text-sm font-semibold text-zinc-100">
                              {Number.isFinite(metadata.filament_used_mm)
                                ? `${metadata.filament_used_mm.toFixed(0)} mm`
                                : "—"}
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3">
                          <Weight className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" aria-hidden />
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                              Khối lượng ước tính (1 mẫu)
                            </p>
                            <p className="text-sm font-semibold text-zinc-100">
                              {cost ? `${unitWeightGramsCeil} g (${material})` : "—"}
                            </p>
                          </div>
                        </li>
                      </>
                  ) : null}
                </ul>
              </div>
            </div>

            <aside className="space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6">
              {metadata ? (
                <div>
                  <div className="flex items-center gap-2">
                    <Scaling className="h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                      Tỷ lệ mô hình (hộp giới hạn)
                    </p>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <input
                      type="range"
                      aria-label="Tỷ lệ mô hình"
                      min={MODEL_SCALE_MIN}
                      max={MODEL_SCALE_MAX}
                      step={MODEL_SCALE_STEP}
                      value={clampUniformModelScale(modelScale)}
                      disabled={isSlicing || isRescaling}
                      onChange={(e) => setModelScale(clampUniformModelScale(Number.parseFloat(e.target.value)))}
                      className="h-2 min-w-[140px] flex-1 cursor-pointer appearance-none rounded-full bg-zinc-700 accent-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
                    />
                    <span className="min-w-[3.5rem] text-right text-sm font-bold tabular-nums text-emerald-400">
                      {(clampUniformModelScale(modelScale) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ) : null}

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Đối tượng</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsStudent(false)}
                    className={[
                      "rounded-xl px-3 py-2 text-sm font-semibold transition",
                      !isStudent
                        ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/20"
                        : "border border-zinc-700 bg-zinc-950 text-zinc-200 hover:border-emerald-500/40",
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
                        ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/20"
                        : "border border-zinc-700 bg-zinc-950 text-zinc-200 hover:border-emerald-500/40",
                    ].join(" ")}
                  >
                    Sinh viên
                  </button>
                </div>
                {isStudent && !promoOn ? (
                  <p className="mt-2 text-xs text-amber-400/90">
                    Giá ưu đãi sinh viên (trong đợt khuyến mãi) có thể chưa áp dụng theo ngày.
                  </p>
                ) : null}
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Loại nhựa</p>
                <div className="mt-2 flex flex-wrap gap-3">
                  {(["PLA", "PETG"] as const).map((m) => (
                    <label
                      key={m}
                      className={[
                        "flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition",
                        material === m
                          ? "border-emerald-500 bg-emerald-500/15 text-emerald-100"
                          : "border-zinc-700 bg-zinc-950 text-zinc-200 hover:border-emerald-500/40",
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
                <div className="mt-2 flex max-w-[240px] items-stretch gap-0 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950">
                  <button
                    type="button"
                    aria-label="Giảm số lượng"
                    disabled={quantity <= 1}
                    onClick={() => bumpQuantity(-1)}
                    className="flex w-11 shrink-0 items-center justify-center border-r border-zinc-700 text-zinc-100 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    <Minus className="h-4 w-4 text-emerald-500" aria-hidden />
                  </button>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={MAX_QUANTITY}
                    value={quantity}
                    onChange={(e) => onQuantityInput(e.target.value)}
                    className="min-w-0 flex-1 border-0 bg-transparent py-2.5 text-center text-sm font-bold tabular-nums text-zinc-50 outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500/50"
                  />
                  <button
                    type="button"
                    aria-label="Tăng số lượng"
                    disabled={quantity >= MAX_QUANTITY}
                    onClick={() => bumpQuantity(1)}
                    className="flex w-11 shrink-0 items-center justify-center border-l border-zinc-700 text-zinc-100 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    <Plus className="h-4 w-4 text-emerald-500" aria-hidden />
                  </button>
                </div>
                <p className="mt-1 text-xs text-zinc-500">
                  Tối thiểu {DEFAULT_QUANTITY} · tối đa {MAX_QUANTITY}
                </p>
              </div>

              {cost && quoteTotals ? (
                <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-emerald-300/90">
                    Ước tính giá in (Tổng)
                  </p>
                  <p className="mt-1 text-2xl font-bold tracking-tight text-emerald-50">
                    {vnd.format(quoteTotals.totalVnd)}
                  </p>
                  <p className="mt-2 text-sm font-medium tabular-nums text-emerald-100/85">
                    {formatVndPlain(cost.totalVnd)} × {quoteTotals.qty} = {formatVndPlain(quoteTotals.lineSubtotal)}
                  </p>
                  {floorExplanation ? (
                    <p
                      className="mt-2 flex gap-1.5 text-xs leading-snug text-zinc-400"
                      role="status"
                    >
                      <Info
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500/70"
                        aria-hidden
                      />
                      <span>{floorExplanation}</span>
                    </p>
                  ) : null}
                  {cost.isStudentDiscountApplied ? (
                    <p className="mt-2 text-xs text-emerald-200/80">
                      Giá 1 mẫu: áp dụng {cost.discountedGrams.toFixed(0)} g theo giá sinh viên trong đợt
                      khuyến mãi (trên 1 mẫu).
                    </p>
                  ) : null}
                </div>
              ) : (
                <PriceBlockSkeleton />
              )}

              <div className="space-y-2">
                <Link
                  href={orderLinkHref}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400"
                >
                  Đặt in mẫu này
                </Link>
                {!FEATURES.ORDER_ENABLED || !FEATURES.AUTH_ENABLED ? (
                  <div className="space-y-2 text-center text-xs text-zinc-400">
                    <p>Đặt hàng trực tuyến đang tắt — vui lòng liên hệ:</p>
                    <p className="flex flex-col items-center gap-1 sm:flex-row sm:justify-center sm:gap-x-4 sm:gap-y-0">
                      <a
                        href={OFFLINE_ORDER_CONTACT.zaloTelHref}
                        className="font-medium text-emerald-400 underline-offset-2 hover:underline"
                      >
                        Zalo: {OFFLINE_ORDER_CONTACT.zaloDisplay}
                      </a>
                      <span className="hidden text-zinc-600 sm:inline" aria-hidden>
                        ·
                      </span>
                      <a
                        href={OFFLINE_ORDER_CONTACT.fanpageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-emerald-400 underline-offset-2 hover:underline"
                      >
                        {OFFLINE_ORDER_CONTACT.fanpageLabel}
                      </a>
                    </p>
                    <p className="text-zinc-500">
                      Ghi chú báo giá: số lượng {quoteTotals?.qty ?? "—"}, khối lượng tổng ~
                      {cost ? `${totalWeightGrams} g` : "…"} ({material}
                      {quoteTotals?.floorApplied
                        ? `, tổng thanh toán tối thiểu ${vnd.format(quoteTotals.totalVnd)}`
                        : ""}
                      ).
                    </p>
                  </div>
                ) : (
                  <p className="text-center text-xs text-zinc-500">
                    Mở form đặt hàng trên trang chủ; tham khảo tổng khối lượng ~
                    {cost ? `${totalWeightGrams} g` : "…"} ({unitWeightGramsCeil} g/mẫu ×{" "}
                    {quoteTotals?.qty ?? "—"}), tổng tiền ước tính{" "}
                    {quoteTotals ? vnd.format(quoteTotals.totalVnd) : "—"}.
                  </p>
                )}
              </div>
            </aside>
          </div>

          <footer className="mt-8 flex items-center justify-center gap-2 border-t border-zinc-800 pt-5">
            <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            <span className="text-xs font-medium text-zinc-400">Xưởng đang hoạt động</span>
          </footer>
        </section>
      ) : null}
    </div>
  );
}
