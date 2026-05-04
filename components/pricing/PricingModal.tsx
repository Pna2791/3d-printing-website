"use client";

import { X } from "lucide-react";
import {
  PRICE_BEFORE_DISCOUNT,
  PRICING_RULES,
  STUDENT_PROMO,
  isStudentPromoActive,
} from "@/lib/pricing";

type PricingModalProps = {
  open: boolean;
  onClose: () => void;
};

export function PricingModal({ open, onClose }: PricingModalProps) {
  if (!open) return null;
  const promoActive = isStudentPromoActive();
  const afterDiscountClasses = promoActive
    ? "font-semibold text-emerald-700 dark:text-emerald-300"
    : "font-semibold text-zinc-500 dark:text-zinc-400";

  return (
    <div className="fixed inset-0 z-50 bg-black/50 px-4 py-8" role="dialog" aria-modal="true">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Bảng giá chi tiết
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            aria-label="Đóng bảng giá"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-700">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-zinc-50 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              <tr>
                <th className="px-4 py-3 font-semibold">Vật liệu</th>
                <th className="px-4 py-3 font-semibold">Giá thường</th>
                <th className="px-4 py-3 font-semibold">Giá sinh viên</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
              <tr>
                <td className="px-4 py-3 text-zinc-800 dark:text-zinc-100">PLA</td>
                <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                  <span className="mr-2 text-red-600 line-through dark:text-red-400">
                    {PRICE_BEFORE_DISCOUNT.PLA.normalVndPerGram}đ/g
                  </span>
                  <span>{PRICING_RULES.PLA.normalVndPerGram}đ/g</span>
                </td>
                <td className="px-4 py-3 text-zinc-900 dark:text-zinc-50">
                  <span className="mr-2 text-red-600 line-through dark:text-red-400">
                    {PRICE_BEFORE_DISCOUNT.PLA.studentVndPerGram}đ/g
                  </span>
                  <span className={afterDiscountClasses}>{PRICING_RULES.PLA.studentVndPerGram}đ/g</span>
                  <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                    Sinh viên
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-zinc-800 dark:text-zinc-100">PETG</td>
                <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                  <span className="mr-2 text-red-600 line-through dark:text-red-400">
                    {PRICE_BEFORE_DISCOUNT.PETG.normalVndPerGram}đ/g
                  </span>
                  <span>{PRICING_RULES.PETG.normalVndPerGram}đ/g</span>
                </td>
                <td className="px-4 py-3 text-zinc-900 dark:text-zinc-50">
                  <span className="mr-2 text-red-600 line-through dark:text-red-400">
                    {PRICE_BEFORE_DISCOUNT.PETG.studentVndPerGram}đ/g
                  </span>
                  <span className={afterDiscountClasses}>{PRICING_RULES.PETG.studentVndPerGram}đ/g</span>
                  <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                    Sinh viên
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-zinc-800 dark:text-zinc-100">PETG-CF</td>
                <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                  <span className="mr-2 text-red-600 line-through dark:text-red-400">
                    {PRICE_BEFORE_DISCOUNT["PETG-CF"].normalVndPerGram}đ/g
                  </span>
                  <span>{PRICING_RULES["PETG-CF"].normalVndPerGram}đ/g</span>
                </td>
                <td className="px-4 py-3 text-zinc-900 dark:text-zinc-50">
                  <span className="mr-2 text-red-600 line-through dark:text-red-400">
                    {PRICE_BEFORE_DISCOUNT["PETG-CF"].studentVndPerGram}đ/g
                  </span>
                  <span className={afterDiscountClasses}>{PRICING_RULES["PETG-CF"].studentVndPerGram}đ/g</span>
                  <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                    Sinh viên
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-zinc-800 dark:text-zinc-100">TPU</td>
                <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                  <span className="mr-2 text-red-600 line-through dark:text-red-400">
                    {PRICE_BEFORE_DISCOUNT.TPU.normalVndPerGram}đ/g
                  </span>
                  <span>{PRICING_RULES.TPU.normalVndPerGram}đ/g</span>
                </td>
                <td className="px-4 py-3 text-zinc-900 dark:text-zinc-50">
                  <span className="mr-2 text-red-600 line-through dark:text-red-400">
                    {PRICE_BEFORE_DISCOUNT.TPU.studentVndPerGram}đ/g
                  </span>
                  <span className={afterDiscountClasses}>{PRICING_RULES.TPU.studentVndPerGram}đ/g</span>
                  <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                    Sinh viên
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 space-y-2 text-xs text-zinc-600 dark:text-zinc-300">
          <p>
            Ưu đãi áp dụng cho tất cả mọi người.
          </p>
          <p>
            Giá sinh viên chỉ áp dụng cho {STUDENT_PROMO.firstDiscountGrams / 1000}KG/tháng;
            phần vượt mức sẽ tính theo giá thường.
          </p>
          {promoActive ? (
            <p className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-1 font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              Đang trong thời gian ưu đãi
            </p>
          ) : (
            <p className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-1 font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
              Ngoài thời gian ưu đãi, áp dụng giá thường
            </p>
          )}
        </div>
      </div>
      <button
        type="button"
        className="fixed inset-0 -z-10 h-full w-full cursor-default"
        onClick={onClose}
        aria-label="Đóng bảng giá"
      />
    </div>
  );
}
