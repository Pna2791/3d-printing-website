import type { MaterialWithPricing } from "@/lib/supabase/types";

type MaterialsPricingTableProps = {
  materials: MaterialWithPricing[];
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatDensity(value: number) {
  return `${value.toFixed(2)} g/cm³`;
}

export function MaterialsPricingTable({ materials }: MaterialsPricingTableProps) {
  if (materials.length === 0) {
    return (
      <section aria-labelledby="materials-heading">
        <h2
          id="materials-heading"
          className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
        >
          Materials &amp; pricing
        </h2>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          No materials are published yet. Add rows in Supabase to see them here.
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby="materials-heading">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <h2
          id="materials-heading"
          className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
        >
          Materials &amp; pricing
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Prices are loaded from your Supabase project (no mock data).
        </p>
      </div>
      <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200/80 shadow-sm dark:border-zinc-800">
        <table className="min-w-full divide-y divide-zinc-200 text-left text-sm dark:divide-zinc-800">
          <thead className="bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:bg-zinc-900/60 dark:text-zinc-400">
            <tr>
              <th scope="col" className="px-4 py-3 sm:px-6">
                Material
              </th>
              <th scope="col" className="px-4 py-3 sm:px-6">
                Type
              </th>
              <th scope="col" className="px-4 py-3 sm:px-6">
                Color
              </th>
              <th scope="col" className="px-4 py-3 sm:px-6">
                Density
              </th>
              <th scope="col" className="px-4 py-3 text-right sm:px-6">
                Price / unit
              </th>
              <th scope="col" className="hidden px-4 py-3 text-right sm:table-cell sm:px-6">
                Rule base
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
            {materials.map((m) => {
              const rule = m.pricing_rules?.[0];
              return (
                <tr key={m.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/50">
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100 sm:px-6">
                    {m.name}
                  </td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300 sm:px-6">
                    {m.type}
                  </td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300 sm:px-6">
                    {m.color}
                  </td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300 sm:px-6">
                    {formatDensity(m.density)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums text-zinc-900 dark:text-zinc-50 sm:px-6">
                    {currency.format(m.unit_price)}
                  </td>
                  <td className="hidden px-4 py-3 text-right text-zinc-600 tabular-nums dark:text-zinc-400 sm:table-cell sm:px-6">
                    {rule ? currency.format(rule.base_price) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
