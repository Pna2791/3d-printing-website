"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FileText, Loader2, Phone, User, X } from "lucide-react";
import { useCallback, useEffect, useId, useState } from "react";

import { naLocaleHeaders, type NaLocale } from "@/lib/quote-paths";
import {
  estimateCostFromSlicer,
  QUOTE_MATERIAL_OPTIONS,
  type SupportedMaterial,
} from "@/lib/pricing";
import { quoteMoneyFromUnitLineVnd } from "@/lib/quote-checkout-totals";
import {
  validateCustomerName,
  validateOrderNotes,
  type ValidationLocale,
  validateVietnamesePhone,
} from "@/lib/validation";

function isQuoteCheckoutMaterial(value: string): value is SupportedMaterial {
  return (QUOTE_MATERIAL_OPTIONS as readonly string[]).includes(value);
}

type CheckoutQuoteJson = {
  ok?: boolean;
  error?: string;
  code?: string;
  error_code?: string;
  phone_display?: string;
};

export type QuoteCheckoutPayload = {
  slicer_task_id: string;
  filename: string;
  material: string;
  is_student: boolean;
  quantity: number;
  model_scale: number;
  model_dimensions: { x_mm: number; y_mm: number; z_mm: number };
  filament_used_mm: number;
  estimated_print_time: string;
  total_vnd: number;
  quote_asset_id?: string;
  stl_storage_path?: string;
  preview_image_url?: string | null;
};

type QuoteCheckoutModalProps = {
  open: boolean;
  onClose: () => void;
  quotePayload: QuoteCheckoutPayload | null;
  locale?: NaLocale;
};

function checkoutCopy(locale: ValidationLocale) {
  const en = locale === "en";
  return {
    close: en ? "Close" : "Đóng",
    closeForm: en ? "Close form" : "Đóng form",
    title: en ? "Place order from quote" : "Đặt in theo báo giá",
    missingQuote: en ? "Quote data is incomplete — please reload the STL." : "Thiếu dữ liệu báo giá — vui lòng tải lại file.",
    thanks: en
      ? "Thank you! NA 3D SHOP — Global Support will confirm your order at"
      : "Cảm ơn bạn! Xưởng NA 3D SHOP sẽ liên hệ xác nhận đơn hàng qua SĐT",
    thanksWindow: en ? "within 15–30 minutes." : "trong vòng 15–30 phút.",
    studentNote: en
      ? "You selected the student tier — when the workshop calls back, please keep a valid student ID handy to keep the promo."
      : "Bạn đã chọn mức sinh viên — khi xưởng gọi lại, vui lòng chuẩn bị thẻ / giấy tờ sinh viên để xác minh và giữ ưu đãi.",
    nameLabel: en ? "Full name" : "Họ và tên",
    phoneLabel: en ? "Mobile number" : "Số điện thoại",
    noteLabel: en ? "Notes (colour, delivery…)" : "Ghi chú (màu sắc, giao hàng…)",
    namePh: en ? "Jane Nguyen" : "Nguyễn Văn A",
    phonePh: en ? "093xxxxxxx" : "09xxxxxxxx",
    notePh: en ? "Example: matte black, evening delivery…" : "Ví dụ: màu đen, giao buổi tối…",
    cancel: en ? "Cancel" : "Hủy",
    submit: en ? "Submit order" : "Gửi đơn",
    sending: en ? "Sending…" : "Đang gửi…",
    network: en ? "Network issue — try again." : "Lỗi mạng — thử lại sau.",
    staleQuote: en
      ? "Quoted total is out of date — refresh the STL quote and submit again."
      : "Tổng báo giá đã lệch — vui lòng làm mới báo giá STL rồi gửi lại.",
  };
}

export function QuoteCheckoutModal({
  open,
  onClose,
  quotePayload,
  locale = "vi",
}: QuoteCheckoutModalProps) {
  const vl: ValidationLocale = locale;
  const t = checkoutCopy(vl);
  const titleId = useId();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [clientError, setClientError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successPhone, setSuccessPhone] = useState<string | null>(null);

  const reset = useCallback(() => {
    setName("");
    setPhone("");
    setNote("");
    setClientError(null);
    setSubmitting(false);
    setSuccessPhone(null);
  }, []);

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);
    if (!quotePayload) {
      setClientError(t.missingQuote);
      return;
    }

    const n = validateCustomerName(name, vl);
    if (!n.ok) {
      setClientError(n.message);
      return;
    }
    const p = validateVietnamesePhone(phone, vl);
    if (!p.ok) {
      setClientError(p.message);
      return;
    }
    const notes = validateOrderNotes(note, vl);
    if (!notes.ok) {
      setClientError(notes.message);
      return;
    }

    if (!isQuoteCheckoutMaterial(quotePayload.material)) {
      setClientError(t.missingQuote);
      return;
    }
    const unitCost = estimateCostFromSlicer(
      quotePayload.filament_used_mm,
      quotePayload.material,
      quotePayload.is_student,
    );
    const money = quoteMoneyFromUnitLineVnd(unitCost.totalVnd, quotePayload.quantity, quotePayload.is_student);
    if (money.totalVnd !== quotePayload.total_vnd) {
      setClientError(t.staleQuote);
      console.warn("[QuoteCheckoutModal] total_vnd mismatch", {
        payload: quotePayload.total_vnd,
        recomputed: money.totalVnd,
        qty: money.qty,
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders/checkout-quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...naLocaleHeaders(locale),
        },
        body: JSON.stringify({
          customer_name: n.name,
          customer_phone: phone,
          customer_note: notes.note,
          ...quotePayload,
        }),
      });
      const raw = await res.text();
      let data: CheckoutQuoteJson;
      try {
        data = raw ? (JSON.parse(raw) as CheckoutQuoteJson) : {};
      } catch {
        console.error("[QuoteCheckoutModal] non-JSON response", {
          status: res.status,
          snippet: raw.slice(0, 800),
        });
        setClientError(
          locale === "en"
            ? `Server response was not JSON (${res.status}). Check network / deployment logs.`
            : `Phản hồi máy chủ không phải JSON (${res.status}). Xem log triển khai.`,
        );
        return;
      }
      if (!res.ok || !data.ok) {
        console.error("[QuoteCheckoutModal] checkout-quote failed", {
          status: res.status,
          code: data.code,
          error_code: data.error_code,
          error: data.error,
        });
        setClientError(data.error ?? `${locale === "en" ? "Error " : "Lỗi "}${res.status}`);
        return;
      }
      setSuccessPhone(data.phone_display ?? p.digits);
    } catch (err) {
      console.error("[QuoteCheckoutModal] fetch error", err);
      setClientError(t.network);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[200] flex items-end justify-center p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <button
            type="button"
            aria-label={t.close}
            className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
            onClick={() => {
              if (!submitting) onClose();
            }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-950 shadow-2xl shadow-black/50"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
              <h2 id={titleId} className="text-lg font-semibold text-zinc-50">
                {t.title}
              </h2>
              <button
                type="button"
                disabled={submitting}
                onClick={onClose}
                className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100 disabled:opacity-40"
                aria-label={t.closeForm}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {successPhone ? (
              <div className="space-y-4 px-4 py-6 sm:px-6">
                <p className="text-sm leading-relaxed text-emerald-100/95">
                  {t.thanks}{" "}
                  <span className="font-semibold tabular-nums text-emerald-300">{successPhone}</span>{" "}
                  {t.thanksWindow}
                </p>
                {quotePayload?.is_student ? (
                  <p className="rounded-lg border border-amber-500/30 bg-amber-950/40 px-3 py-2 text-xs leading-relaxed text-amber-100/95">
                    {t.studentNote}
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400"
                >
                  {t.close}
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4 px-4 py-5 sm:px-6">
                <div>
                  <label htmlFor="qc-name" className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                    <User className="h-3.5 w-3.5 text-emerald-500" aria-hidden />
                    {t.nameLabel}
                  </label>
                  <input
                    id="qc-name"
                    name="customer_name"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 outline-none ring-emerald-500/40 focus:ring-2"
                    placeholder={t.namePh}
                    maxLength={120}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="qc-phone" className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                    <Phone className="h-3.5 w-3.5 text-emerald-500" aria-hidden />
                    {t.phoneLabel}
                  </label>
                  <input
                    id="qc-phone"
                    name="customer_phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 outline-none ring-emerald-500/40 focus:ring-2"
                    placeholder={t.phonePh}
                    maxLength={20}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="qc-note" className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                    <FileText className="h-3.5 w-3.5 text-emerald-500" aria-hidden />
                    {t.noteLabel}
                  </label>
                  <textarea
                    id="qc-note"
                    name="customer_note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    className="mt-1.5 w-full resize-y rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 outline-none ring-emerald-500/40 focus:ring-2"
                    placeholder={t.notePh}
                    maxLength={2000}
                  />
                </div>

                {clientError ? (
                  <p role="alert" className="text-sm text-red-300">
                    {clientError}
                  </p>
                ) : null}

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={onClose}
                    className="flex-1 rounded-xl border border-zinc-600 py-3 text-sm font-semibold text-zinc-200 transition hover:bg-zinc-800 disabled:opacity-50"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !quotePayload}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                        {t.sending}
                      </>
                    ) : (
                      t.submit
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
