import Image from "next/image";

import type { AppLocale } from "@/lib/i18n-dictionary";
import { getDictionary } from "@/lib/i18n-dictionary";

type AboutSectionProps = {
  locale: AppLocale;
  images?: { src: string; alt: string }[];
};

export function AboutSection({ locale, images = [] }: AboutSectionProps) {
  const about = getDictionary(locale).home.about;

  return (
    <section className="py-16">
      <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{about.title}</h2>
      <p className="mt-4 max-w-3xl text-zinc-600 dark:text-zinc-300 lg:max-w-4xl lg:text-lg lg:leading-relaxed">
        {about.intro}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {about.machineGroups.map((group) => (
          <article
            key={group.title}
            className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{group.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{group.description}</p>
          </article>
        ))}
      </div>

      <div className="mt-8">
        {images.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {images.map((image) => (
              <article
                key={image.src}
                className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={1200}
                  height={900}
                  className="h-64 w-full object-cover"
                />
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {(() => {
              const code = "public/printers";
              if (!about.printerPlaceholder.includes(code)) return about.printerPlaceholder;
              const [before, ...afterParts] = about.printerPlaceholder.split(code);
              return (
                <>
                  {before}
                  <code className="font-mono text-xs">{code}</code>
                  {afterParts.join(code)}
                </>
              );
            })()}
          </p>
        )}
      </div>
    </section>
  );
}
