type WorkshopIntroProps = {
  name?: string;
  contactEmail?: string;
  timezone?: string;
  otherEntries: { key: string; value: string }[];
};

export function WorkshopIntro({
  name,
  contactEmail,
  timezone,
  otherEntries,
}: WorkshopIntroProps) {
  const title = name?.trim() || "Na 3D printing workshop";

  return (
    <section
      aria-labelledby="workshop-heading"
      className="rounded-2xl border border-zinc-200/80 bg-zinc-50/80 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40 sm:p-8"
    >
      <h2
        id="workshop-heading"
        className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
      >
        Na 3D printing workshop
      </h2>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
        {title}
      </p>
      <dl className="mt-6 grid gap-4 text-sm text-zinc-700 dark:text-zinc-300 sm:grid-cols-2">
        {contactEmail ? (
          <div>
            <dt className="font-medium text-zinc-500 dark:text-zinc-400">
              Contact
            </dt>
            <dd className="mt-1">
              <a
                className="text-emerald-700 underline decoration-emerald-700/30 underline-offset-2 hover:decoration-emerald-700 dark:text-emerald-400 dark:decoration-emerald-400/40"
                href={`mailto:${contactEmail}`}
              >
                {contactEmail}
              </a>
            </dd>
          </div>
        ) : null}
        {timezone ? (
          <div>
            <dt className="font-medium text-zinc-500 dark:text-zinc-400">
              Timezone
            </dt>
            <dd className="mt-1 font-mono text-xs sm:text-sm">{timezone}</dd>
          </div>
        ) : null}
      </dl>
      {otherEntries.length > 0 ? (
        <ul className="mt-6 divide-y divide-zinc-200 border-t border-zinc-200 pt-4 text-sm dark:divide-zinc-800 dark:border-zinc-800">
          {otherEntries.map((row) => (
            <li
              key={row.key}
              className="flex flex-col gap-1 py-3 first:pt-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="font-medium capitalize text-zinc-600 dark:text-zinc-400">
                {row.key.replaceAll("_", " ")}
              </span>
              <span className="text-zinc-900 dark:text-zinc-100">{row.value}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
