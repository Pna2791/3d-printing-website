import type { AppLocale } from "@/lib/i18n-dictionary";
import { getDictionary } from "@/lib/i18n-dictionary";

type EnclosedPrintingSectionProps = {
  locale: AppLocale;
};

export function EnclosedPrintingSection({ locale }: EnclosedPrintingSectionProps) {
  const e = getDictionary(locale).home.enclosed;

  return (
    <section
      aria-labelledby="enclosed-print-heading"
      className="rounded-3xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-emerald-50/40 p-8 shadow-sm dark:border-zinc-800 dark:from-zinc-900 dark:to-emerald-950/30 dark:shadow-none sm:p-10"
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
        {e.kicker}
      </p>
      <h2
        id="enclosed-print-heading"
        className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl"
      >
        {e.title}
      </h2>
      <p className="mt-4 max-w-3xl text-base leading-relaxed text-zinc-700 dark:text-zinc-300">{e.body}</p>
      <p className="mt-3 text-sm font-medium text-emerald-800 dark:text-emerald-300/95">{e.cta}</p>
    </section>
  );
}
