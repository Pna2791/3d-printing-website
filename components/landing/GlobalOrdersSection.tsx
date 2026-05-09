import type { AppLocale } from "@/lib/i18n-dictionary";
import { getDictionary } from "@/lib/i18n-dictionary";

type GlobalOrdersSectionProps = {
  locale: AppLocale;
};

export function GlobalOrdersSection({ locale }: GlobalOrdersSectionProps) {
  const g = getDictionary(locale).home.globalOrders;

  return (
    <section
      aria-labelledby="global-orders-heading"
      className="rounded-3xl border border-zinc-200 bg-gradient-to-br from-zinc-950 to-emerald-950/40 p-8 text-zinc-100 shadow-sm dark:border-zinc-800 sm:p-10"
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400/90">{g.kicker}</p>
      <h2 id="global-orders-heading" className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
        {g.title}
      </h2>
      <ul className="mt-5 space-y-3 text-sm leading-relaxed text-zinc-300">
        {g.bullets.map((item) => (
          <li key={item.lead}>
            <span className="font-semibold text-emerald-400">{item.lead}</span>
            {item.rest}
          </li>
        ))}
      </ul>
    </section>
  );
}
