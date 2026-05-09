"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map } from "lucide-react";

import { getDictionary } from "@/lib/i18n-dictionary";
import { QUOTE_EN_PATH, QUOTE_VI_SEO_PATH } from "@/lib/quote-paths";
import {
  WORKSHOP_FULL_ADDRESS_VI,
  WORKSHOP_MAPS_SHARE_URL,
  WORKSHOP_PUBLIC_NAME,
} from "@/lib/workshop-location";

/** Sitewide trust + local discovery (short strip under main content). */
export function SiteFooter() {
  const year = new Date().getFullYear();
  const pathname = usePathname() || "/";
  const isEn = pathname === "/en" || pathname.startsWith("/en/");
  const locale = isEn ? "en" : "vi";
  const quoteLabel = getDictionary(locale).footer.quoteLabel;
  const homeHref = isEn ? "/en" : "/";
  const quoteHref = isEn ? QUOTE_EN_PATH : QUOTE_VI_SEO_PATH;

  return (
    <footer className="border-t border-zinc-200/90 bg-white/90 backdrop-blur dark:border-zinc-800/90 dark:bg-zinc-950/90">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{WORKSHOP_PUBLIC_NAME}</p>
          <a
            href={WORKSHOP_MAPS_SHARE_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-2 inline-flex max-w-xl flex-wrap items-start gap-2 text-sm text-zinc-600 underline-offset-4 transition hover:text-emerald-700 hover:underline dark:text-zinc-400 dark:hover:text-emerald-400"
          >
            <Map className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-500" aria-hidden />
            <span>{WORKSHOP_FULL_ADDRESS_VI}</span>
          </a>
        </div>
        <p className="shrink-0 text-xs text-zinc-500 dark:text-zinc-500">
          © {year}{" "}
          <Link
            href={homeHref}
            className="font-medium text-zinc-600 underline-offset-2 hover:text-emerald-700 hover:underline dark:text-zinc-400 dark:hover:text-emerald-400"
          >
            {WORKSHOP_PUBLIC_NAME}
          </Link>
          <span aria-hidden className="mx-1 align-middle">
            ·
          </span>
          <Link
            href={quoteHref}
            className="font-medium text-zinc-600 underline-offset-2 hover:text-emerald-700 hover:underline dark:text-zinc-400 dark:hover:text-emerald-400"
          >
            {quoteLabel}
          </Link>
        </p>
      </div>
    </footer>
  );
}
