import type { MaterialWithPricing } from "@/lib/supabase/types";
import {
  PRICE_BEFORE_DISCOUNT,
  PRICING_RULES,
  STUDENT_PROMO,
  calculateMaterialPrice,
  isStudentPromoActive,
} from "@/lib/pricing";

type PricingPreviewProps = {
  materials: MaterialWithPricing[];
  onOpenPricing: () => void;
};

export function PricingPreview({ materials, onOpenPricing }: PricingPreviewProps) {
  const promoActive = isStudentPromoActive();
  const pla = calculateMaterialPrice({
    material: "PLA",
    weightGrams: STUDENT_PROMO.firstDiscountGrams,
    isStudent: true,
    usedDiscountGrams: 0,
  });
  const petg = calculateMaterialPrice({
    material: "PETG",
    weightGrams: STUDENT_PROMO.firstDiscountGrams,
    isStudent: true,
    usedDiscountGrams: 0,
  });
  const hasData = materials.length > 0;
  const afterDiscountClasses = promoActive
    ? "font-semibold text-emerald-700 dark:text-emerald-300"
    : "font-semibold text-zinc-500 dark:text-zinc-400";

  return (
    <section>
      <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Bảng giá nhanh
      </h2>

      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-700">
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
                <td className="px-4 py-3 font-medium text-zinc-800 dark:text-zinc-100">PLA</td>
                <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                  <span className="mr-2 text-red-600 line-through dark:text-red-400">
                    {PRICE_BEFORE_DISCOUNT.PLA.normalVndPerGram}đ/g
                  </span>
                  <span>{pla.normalVndPerGram}đ/g</span>
                </td>
                <td className="px-4 py-3">
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
                <td className="px-4 py-3 font-medium text-zinc-800 dark:text-zinc-100">PETG</td>
                <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                  <span className="mr-2 text-red-600 line-through dark:text-red-400">
                    {PRICE_BEFORE_DISCOUNT.PETG.normalVndPerGram}đ/g
                  </span>
                  <span>{petg.normalVndPerGram}đ/g</span>
                </td>
                <td className="px-4 py-3">
                  <span className="mr-2 text-red-600 line-through dark:text-red-400">
                    {PRICE_BEFORE_DISCOUNT.PETG.studentVndPerGram}đ/g
                  </span>
                  <span className={afterDiscountClasses}>{PRICING_RULES.PETG.studentVndPerGram}đ/g</span>
                  <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                    Sinh viên
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
          Ưu đãi áp dụng cho tất cả mọi người. Giá sinh viên chỉ áp dụng
          cho {STUDENT_PROMO.firstDiscountGrams / 1000}KG/tháng, phần vượt mức sẽ tính theo giá thường.
          {!hasData ? " Dữ liệu Supabase hiện chưa có vật liệu, nhưng giá đã theo cấu hình mới." : ""}
        </p>

        <button
          type="button"
          onClick={onOpenPricing}
          className="mt-6 rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Xem bảng giá chi tiết
        </button>
      </div>
    </section>
  );
}
