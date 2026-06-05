"use client";

import Image from "next/image";
import { ImageOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { ShowcaseGalleryItem } from "@/lib/gallery/showcase-types";
import { isRemoteImageSrc, normalizeGalleryImageUrl } from "@/lib/gallery/image-display";
import type { AppLocale } from "@/lib/i18n-dictionary";
import { getDictionary } from "@/lib/i18n-dictionary";

function ShowcaseTileImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [broken, setBroken] = useState(false);
  const normalized = normalizeGalleryImageUrl(src);
  const remote = isRemoteImageSrc(normalized);
  const mergedClassName = `bg-white ${className ?? ""}`.trim();

  if (broken) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 bg-zinc-100 text-center text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 ${className}`}
      >
        <ImageOff className="size-10 opacity-60" aria-hidden />
        <span>Không tải được ảnh</span>
      </div>
    );
  }

  // Remote URLs (Supabase Storage): native <img> avoids Next Image optimizer / remotePatterns mismatches.
  if (remote) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- intentional for arbitrary public Storage URLs
      <img
        src={normalized}
        alt={alt}
        className={mergedClassName}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setBroken(true)}
      />
    );
  }

  return (
    <Image
      src={normalized}
      alt={alt}
      width={1200}
      height={900}
      className={mergedClassName}
      onError={() => setBroken(true)}
    />
  );
}

type ShowcaseSectionProps = {
  locale: AppLocale;
  images?: ShowcaseGalleryItem[];
};

export function ShowcaseSection({ locale, images = [] }: ShowcaseSectionProps) {
  const s = getDictionary(locale).home.showcase;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [previewImage, setPreviewImage] = useState<ShowcaseGalleryItem | null>(null);
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
              key={image.id ?? image.src}
              type="button"
              onClick={() => setPreviewImage(image)}
              className="group w-[82%] shrink-0 snap-start overflow-hidden rounded-xl border border-zinc-200 bg-white text-left sm:w-[48%] lg:w-[calc((100%-2rem)/3)] dark:border-zinc-800"
              aria-label={s.enlargeTemplate.replace("{alt}", image.alt)}
            >
              <div className="relative h-64 w-full bg-white">
                <ShowcaseTileImage
                  src={image.src}
                  alt={image.alt}
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
          <div className="relative max-h-[92vh] max-w-[96vw] overflow-auto rounded-lg bg-white p-4 text-zinc-900 shadow-xl dark:bg-zinc-900 dark:text-zinc-50">
            <button
              type="button"
              className="absolute right-2 top-2 rounded-lg bg-white/90 px-3 py-1.5 text-sm font-semibold text-zinc-900 shadow-sm ring-1 ring-zinc-200 hover:bg-white dark:bg-zinc-950/80 dark:text-zinc-50 dark:ring-zinc-800 dark:hover:bg-zinc-950"
              onClick={() => setPreviewImage(null)}
            >
              {s.close}
            </button>
            {previewImage.title ? (
              <h3 className="text-lg font-semibold leading-snug">{previewImage.title}</h3>
            ) : null}
            {previewImage.category ? (
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                {previewImage.category}
              </p>
            ) : null}
            {previewImage.description ? (
              <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{previewImage.description}</p>
            ) : null}
            {/* eslint-disable-next-line @next/next/no-img-element -- lightbox; Supabase public URLs */}
            <img
              src={normalizeGalleryImageUrl(previewImage.src)}
              alt={previewImage.alt}
              className="mt-4 h-auto max-h-[70vh] w-full max-w-full rounded-md object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
