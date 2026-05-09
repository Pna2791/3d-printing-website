"use client";

import { Loader2, X } from "lucide-react";
import { useCallback, useEffect, useId, useState } from "react";

import { naLocaleHeaders, type NaLocale } from "@/lib/quote-paths";

type QuoteBulkRfqModalProps = {
  open: boolean;
  onClose: () => void;
  defaultQuantity?: number;
  locale?: NaLocale;
};

function rfqCopy(locale: NaLocale) {
  const en = locale === "en";
  return {
    close: en ? "Close" : "Đóng",
    closeFormAria: en ? "Close form" : "Đóng form",
    title: en ? "High-volume RFQ" : "Yêu cầu báo giá số lượng lớn (RFQ)",
    qtyInvalid: en ? "Quantity must be greater than 500." : "Số lượng RFQ phải lớn hơn 500.",
    nameInvalid: en ? "Please enter a valid name." : "Vui lòng nhập họ tên hợp lệ.",
    emailInvalid: en ? "Email is not valid." : "Email không hợp lệ.",
    network: en ? "Network issue — try again." : "Lỗi mạng — thử lại sau.",
    intro: en
      ? "For orders above 500 pcs attach drawings (STEP/STL/PDF), tolerances, finishes, and shipment notes."
      : "Áp dụng khi đơn > 500 mắt nhắt. Đính kèm bản vẽ (STEP/STL/PDF) và yêu cầu chi tiết (dung sai, màu, hoàn thiện bề mặt…).",
    name: en ? "Full name *" : "Họ tên *",
    email: en ? "Email *" : "Email *",
    phone: en ? "Phone" : "Điện thoại",
    company: en ? "Company" : "Công ty",
    qty: en ? "Estimated qty *" : "Số lượng dự kiến *",
    tech: en ? "Technical requirements" : "Yêu cầu kỹ thuật",
    techPh: en ? "e.g. PETG-CF, matte finish, warp control…" : "VD: PETG-CF, độ bóng nhám, không cong biên...",
    files: en
      ? "Attachments (max 5 files, STL/STEP/PDF/images/ZIP — 15 MB each)"
      : "Tài liệu đính kèm (tối đa 5 file, STL/STEP/PDF/ảnh/ZIP — mỗi file ≤ 15 MB)",
    sending: en ? "Sending…" : "Đang gửi…",
    submit: en ? "Send RFQ" : "Gửi RFQ",
    success: en
      ? "RFQ submitted. NA 3D SHOP — Global Support replies within 1–2 business days (pricing may require file review)."
      : "Đã gửi RFQ. Xưởng NA 3D SHOP sẽ phản hồi trong 1–2 ngày làm việc (kỹ thuật + giá có thể cần rà file).",
  };
}

export function QuoteBulkRfqModal({
  open,
  onClose,
  defaultQuantity = 501,
  locale = "vi",
}: QuoteBulkRfqModalProps) {
  const t = rfqCopy(locale);
  const titleId = useId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [quantity, setQuantity] = useState(String(Math.max(defaultQuantity, 501)));
  const [requirements, setRequirements] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [successLine, setSuccessLine] = useState<string | null>(null);

  useEffect(() => {
    if (open) setQuantity(String(Math.max(defaultQuantity, 501)));
  }, [open, defaultQuantity]);

  const reset = useCallback(() => {
    setName("");
    setEmail("");
    setPhone("");
    setCompany("");
    setRequirements("");
    setFiles(null);
    setClientError(null);
    setSubmitting(false);
    setSent(false);
    setSuccessLine(null);
  }, []);

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);
    const q = Number.parseInt(quantity, 10);
    if (!Number.isFinite(q) || q <= 500) {
      setClientError(t.qtyInvalid);
      return;
    }
    if (!name.trim() || name.trim().length > 160) {
      setClientError(t.nameInvalid);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setClientError(t.emailInvalid);
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.set("contact_name", name.trim());
      fd.set("email", email.trim());
      fd.set("phone", phone.trim().slice(0, 40));
      fd.set("company", company.trim().slice(0, 200));
      fd.set("quantity_estimate", String(q));
      fd.set("technical_requirements", requirements.trim().slice(0, 12000));
      if (files?.length) {
        for (const f of Array.from(files)) {
          fd.append("attachments", f, f.name);
        }
      }

      const res = await fetch("/api/rfq/bulk-upload", {
        method: "POST",
        body: fd,
        headers: naLocaleHeaders(locale),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; message?: string };
      if (!res.ok || !data.ok) {
        setClientError(data.error ?? `${locale === "en" ? "Error " : "Lỗi "}${res.status}`);
        return;
      }
      setSuccessLine(typeof data.message === "string" && data.message.trim() ? data.message : t.success);
      setSent(true);
    } catch {
      setClientError(t.network);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[220] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label={t.close}
        className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
        onClick={() => {
          if (!submitting) onClose();
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-950 shadow-2xl"
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
            aria-label={t.closeFormAria}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {sent ? (
          <div className="space-y-3 px-4 py-6 sm:px-6">
            <p className="text-sm leading-relaxed text-emerald-100/95">
              {successLine ?? t.success}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400"
            >
              {t.close}
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-3 px-4 py-4 sm:px-6 sm:py-5">
            <p className="text-xs leading-relaxed text-zinc-500">{t.intro}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="space-y-1 text-xs font-medium text-zinc-400">
                {t.name}
                <input
                  required
                  value={name}
                  maxLength={160}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </label>
              <label className="space-y-1 text-xs font-medium text-zinc-400">
                {t.email}
                <input
                  required
                  type="email"
                  value={email}
                  maxLength={200}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </label>
              <label className="space-y-1 text-xs font-medium text-zinc-400">
                {t.phone}
                <input
                  value={phone}
                  maxLength={40}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </label>
              <label className="space-y-1 text-xs font-medium text-zinc-400">
                {t.company}
                <input
                  value={company}
                  maxLength={200}
                  onChange={(e) => setCompany(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </label>
            </div>
            <label className="block space-y-1 text-xs font-medium text-zinc-400">
              {t.qty}
              <input
                required
                type="number"
                inputMode="numeric"
                min={501}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm tabular-nums text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </label>
            <label className="block space-y-1 text-xs font-medium text-zinc-400">
              {t.tech}
              <textarea
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                rows={4}
                maxLength={12000}
                placeholder={t.techPh}
                className="mt-1 w-full resize-y rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </label>
            <label className="block space-y-1 text-xs font-medium text-zinc-400">
              {t.files}
              <input
                type="file"
                multiple
                accept=".stl,.step,.stp,.pdf,.png,.jpg,.jpeg,.zip"
                onChange={(e) => setFiles(e.target.files)}
                className="mt-2 block w-full text-xs text-zinc-400 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-500/15 file:px-3 file:py-2 file:text-emerald-200"
              />
            </label>
            {clientError ? (
              <p role="alert" className="text-sm text-red-300">
                {clientError}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400 disabled:opacity-50"
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
          </form>
        )}
      </div>
    </div>
  );
}
