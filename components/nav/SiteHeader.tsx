"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function isEnglishPath(pathname: string): boolean {
  return pathname === "/en" || pathname.startsWith("/en/");
}

function toggleLocalePath(pathname: string): { href: string; label: "EN" | "VI" } {
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const href = pathname === "/en" ? "/" : pathname.replace(/^\/en/, "");
    return { href: href || "/", label: "VI" };
  }
  return { href: pathname === "/" ? "/en" : `/en${pathname}`, label: "EN" };
}

export function SiteHeader() {
  const pathname = usePathname() || "/";
  const isEn = isEnglishPath(pathname);
  const { href, label } = toggleLocalePath(pathname);
  const homeHref = isEn ? "/en" : "/";
  const quoteHref = isEn ? "/en/bao-gia-in-3d" : "/bao-gia-in-3d";
  const quoteLabel = isEn ? "Quote" : "Báo giá";

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/70 bg-white/85 backdrop-blur dark:border-zinc-800/70 dark:bg-zinc-950/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href={homeHref}
          className="inline-flex items-center gap-2 font-semibold tracking-tight text-zinc-900 hover:text-emerald-700 dark:text-zinc-100 dark:hover:text-emerald-300"
          aria-label={isEn ? "Go to homepage" : "Về trang chủ"}
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-sm font-black text-zinc-950">
            NA
          </span>
          <span className="hidden sm:inline">NA 3D SHOP</span>
          <span className="sm:hidden">NA 3D</span>
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            href={quoteHref}
            className="rounded-xl px-3 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
          >
            {quoteLabel}
          </Link>
          <Link
            href={href}
            className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-500/15 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-200 dark:hover:bg-emerald-500/15"
            aria-label={isEn ? `Switch language (${label})` : `Đổi ngôn ngữ (${label})`}
          >
            {label}
          </Link>
        </nav>
      </div>
    </header>
  );
}

