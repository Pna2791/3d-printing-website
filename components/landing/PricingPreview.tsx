import type { MaterialWithPricing } from "@/lib/supabase/types";

type PricingPreviewProps = {
  materials: MaterialWithPricing[];
  onOpenPricing: () => void;
};

function hasStudentPrice(materials: MaterialWithPricing[]) {
  return materials.some((item) => Number(item.unit_price) <= 300);
}

export function PricingPreview({ materials, onOpenPricing }: PricingPreviewProps) {
  const basePrice = materials.length > 0 ? Number(materials[0].unit_price) : 400;
  const studentPrice = hasStudentPrice(materials) ? 300 : 300;

  return (
    <section>
      <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Bảng giá nhanh
      </h2>

      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <ul className="space-y-3 text-zinc-700 dark:text-zinc-200">
          <li className="flex items-center justify-between gap-4 border-b border-zinc-200 pb-3 dark:border-zinc-700">
            <span className="font-medium">PLA: từ 400đ/g</span>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              Hiện tại: {Math.round(basePrice)}đ/g
            </span>
          </li>
          <li className="flex items-center justify-between gap-4">
            <span className="font-medium">Sinh viên: 300đ/g</span>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              Ưu đãi: {studentPrice}đ/g
            </span>
          </li>
        </ul>

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
