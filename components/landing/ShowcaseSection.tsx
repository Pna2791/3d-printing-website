"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import type { AppLocale } from "@/lib/i18n-dictionary";
import { getDictionary } from "@/lib/i18n-dictionary";

type ShowcaseItem = {
  src: string;
  alt: string;
};

type ShowcaseSectionProps = {
  locale: AppLocale;
  images?: ShowcaseItem[];
};

export function ShowcaseSection({ locale, images = [] }: ShowcaseSectionProps) {
  const s = getDictionary(locale).home.showcase;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [previewImage, setPreviewImage] = useState<ShowcaseItem | null>(null);
  const displayImages = images;

  const scrollByPage = (direction: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) return;

    const oneCardWidth = container.clientWidth / 3;
    const delta = oneCardWidth * 3;
    container.scrollBy({
      left: direction === "right" ? delta : -delta,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || displayImages.length <= 1) return;

    const intervalId = window.setInterval(() => {
      const oneCardWidth = container.clientWidth / 3;
      const delta = oneCardWidth * 3;
      const nextLeft = container.scrollLeft + delta;
      const maxLeft = container.scrollWidth - container.clientWidth;

      if (nextLeft >= maxLeft - 1) {
        container.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        container.scrollBy({ left: delta, behavior: "smooth" });
      }
    }, 3000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [displayImages.length]);

  if (displayImages.length === 0) return null;

  return (
    <section className="py-16">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {s.title}
        </h2>
        <div className="hidden items-center gap-2 sm:flex">
          <button
            type="button"
            onClick={() => scrollByPage("left")}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            aria-label={s.scrollLeft}
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => scrollByPage("right")}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            aria-label={s.scrollRight}
          >
            →
          </button>
        </div>
      </div>

      <div className="mt-8 overflow-hidden">
        <div
          ref={scrollRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {displayImages.map((image) => (
            <button
              key={image.src}
              type="button"
              onClick={() => setPreviewImage(image)}
              className="group w-[82%] shrink-0 snap-start overflow-hidden rounded-xl border border-zinc-200 bg-white text-left sm:w-[48%] lg:w-[calc((100%-2rem)/3)] dark:border-zinc-800"
              aria-label={s.enlargeTemplate.replace("{alt}", image.alt)}
            >
              <div className="h-64 w-full bg-white">
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={1200}
                  height={900}
                  className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      {previewImage ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={s.dialogLabel}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-lg bg-white/90 px-3 py-1.5 text-sm font-semibold text-zinc-900 hover:bg-white"
            onClick={() => setPreviewImage(null)}
          >
            {s.close}
          </button>
          <img
            src={previewImage.src}
            alt={previewImage.alt}
            className="h-auto max-h-[92vh] w-auto max-w-[96vw] rounded-lg bg-white p-2"
          />
        </div>
      ) : null}
    </section>
  );
}
