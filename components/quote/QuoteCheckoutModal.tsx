"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FileText, Loader2, Phone, User, X } from "lucide-react";
import { useCallback, useEffect, useId, useState } from "react";

import { validateCustomerName, validateOrderNotes, validateVietnamesePhone } from "@/lib/validation";

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
};

type QuoteCheckoutModalProps = {
  open: boolean;
  onClose: () => void;
  quotePayload: QuoteCheckoutPayload | null;
};

export function QuoteCheckoutModal({ open, onClose, quotePayload }: QuoteCheckoutModalProps) {
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
      setClientError("Thiếu dữ liệu báo giá — vui lòng tải lại file.");
      return;
    }

    const n = validateCustomerName(name);
    if (!n.ok) {
      setClientError(n.message);
      return;
    }
    const p = validateVietnamesePhone(phone);
    if (!p.ok) {
      setClientError(p.message);
      return;
    }
    const t = validateOrderNotes(note);
    if (!t.ok) {
      setClientError(t.message);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders/checkout-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: n.name,
          customer_phone: phone,
          customer_note: t.note,
          ...quotePayload,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; phone_display?: string };
      if (!res.ok || !data.ok) {
        setClientError(data.error ?? `Lỗi ${res.status}`);
        return;
      }
      setSuccessPhone(data.phone_display ?? p.digits);
    } catch {
      setClientError("Lỗi mạng — thử lại sau.");
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
            aria-label="Đóng"
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
                Đặt in theo báo giá
              </h2>
              <button
                type="button"
                disabled={submitting}
                onClick={onClose}
                className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100 disabled:opacity-40"
                aria-label="Đóng form"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {successPhone ? (
              <div className="space-y-4 px-4 py-6 sm:px-6">
                <p className="text-sm leading-relaxed text-emerald-100/95">
                  Cảm ơn bạn! Xưởng <span className="font-semibold text-emerald-400">NA 3D SHOP</span> sẽ liên hệ
                  xác nhận đơn hàng qua SĐT{" "}
                  <span className="font-semibold tabular-nums text-emerald-300">{successPhone}</span> trong vòng
                  15–30 phút.
                </p>
                {quotePayload?.is_student ? (
                  <p className="rounded-lg border border-amber-500/30 bg-amber-950/40 px-3 py-2 text-xs leading-relaxed text-amber-100/95">
                    Bạn đã chọn mức <strong className="font-semibold">sinh viên</strong> — khi xưởng gọi lại, vui
                    lòng chuẩn bị thẻ / giấy tờ sinh viên để xác minh và giữ ưu đãi.
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400"
                >
                  Đóng
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4 px-4 py-5 sm:px-6">
                <div>
                  <label htmlFor="qc-name" className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                    <User className="h-3.5 w-3.5 text-emerald-500" aria-hidden />
                    Họ và tên
                  </label>
                  <input
                    id="qc-name"
                    name="customer_name"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 outline-none ring-emerald-500/40 focus:ring-2"
                    placeholder="Nguyễn Văn A"
                    maxLength={120}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="qc-phone" className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                    <Phone className="h-3.5 w-3.5 text-emerald-500" aria-hidden />
                    Số điện thoại
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
                    placeholder="09xxxxxxxx"
                    maxLength={20}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="qc-note" className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                    <FileText className="h-3.5 w-3.5 text-emerald-500" aria-hidden />
                    Ghi chú (màu sắc, giao hàng…)
                  </label>
                  <textarea
                    id="qc-note"
                    name="customer_note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    className="mt-1.5 w-full resize-y rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 outline-none ring-emerald-500/40 focus:ring-2"
                    placeholder="Ví dụ: màu đen, giao buổi tối…"
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
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !quotePayload}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                        Đang gửi…
                      </>
                    ) : (
                      "Gửi đơn"
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
