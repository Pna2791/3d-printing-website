"use client";

import { X } from "lucide-react";

type PricingModalProps = {
  open: boolean;
  onClose: () => void;
};

export function PricingModal({ open, onClose }: PricingModalProps) {
  if (!open) return null;

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
                <th className="px-4 py-3 font-semibold">Material</th>
                <th className="px-4 py-3 font-semibold">Giá</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
              <tr>
                <td className="px-4 py-3 text-zinc-800 dark:text-zinc-100">PLA</td>
                <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                  400đ/g
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-zinc-800 dark:text-zinc-100">
                  PLA (SV)
                </td>
                <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                  300đ/g
                </td>
              </tr>
            </tbody>
          </table>
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
