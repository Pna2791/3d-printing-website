import type { NextRequest } from "next/server";

import type { AppLocale } from "@/lib/i18n-dictionary";

export function appLocaleFromPathname(pathname: string): AppLocale {
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : "vi";
}

/** Merged inbound headers consumed by root `layout.tsx` (<html lang>) and SSR. */
export function withAppLocaleHeaders(request: NextRequest): Headers {
  const merged = new Headers(request.headers);
  merged.set("x-app-locale", appLocaleFromPathname(request.nextUrl.pathname));
  return merged;
}
