/** English SEO slug for the online quote tool (no Vietnamese words in the path). */
export const QUOTE_EN_PATH = "/en/3d-printing-quote" as const;

/** Canonical Vietnamese SEO slug for the same tool. */
export const QUOTE_VI_SEO_PATH = "/bao-gia-in-3d" as const;

export const NA_LOCALE_HEADER = "x-na-locale" as const;

export type NaLocale = "vi" | "en";

export function parseNaLocaleHeader(request: Request): NaLocale {
  const raw = request.headers.get(NA_LOCALE_HEADER)?.trim().toLowerCase();
  return raw === "en" ? "en" : "vi";
}

/** Client fetch: attach so API routes can localize `error` payloads. */
export function naLocaleHeaders(locale: NaLocale): HeadersInit {
  if (locale !== "en") return {};
  return { [NA_LOCALE_HEADER]: "en" };
}

/**
 * Map a Vietnamese pathname to its English equivalent (language switcher → EN).
 */
export function vietnamesePathToEnglish(pathname: string): string {
  if (pathname === "/") return "/en";
  if (pathname === QUOTE_VI_SEO_PATH || pathname.startsWith(`${QUOTE_VI_SEO_PATH}/`)) {
    return pathname.replace(/^\/bao-gia-in-3d/, QUOTE_EN_PATH);
  }
  if (pathname === "/quote" || pathname.startsWith("/quote/")) {
    return pathname.replace(/^\/quote/, QUOTE_EN_PATH);
  }
  if (pathname === "/materials" || pathname.startsWith("/materials/")) {
    return pathname.replace(/^\/materials/, "/en/materials");
  }
  return `/en${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

/**
 * Map an English pathname back to Vietnamese (switcher → VI).
 */
export function englishPathToVietnamese(pathname: string): string {
  if (pathname === "/en") return "/";
  if (pathname === QUOTE_EN_PATH || pathname.startsWith(`${QUOTE_EN_PATH}/`)) {
    return pathname.replace(/^\/en\/3d-printing-quote/, QUOTE_VI_SEO_PATH);
  }
  if (pathname === "/en/bao-gia-in-3d" || pathname.startsWith("/en/bao-gia-in-3d/")) {
    return pathname.replace(/^\/en\/bao-gia-in-3d/, QUOTE_VI_SEO_PATH);
  }
  if (pathname === "/en/materials" || pathname.startsWith("/en/materials/")) {
    return pathname.replace(/^\/en\/materials/, "/materials");
  }
  const stripped = pathname.replace(/^\/en(?=\/|$)/, "");
  return stripped.startsWith("/") ? stripped : stripped ? `/${stripped}` : "/";
}

export function isEnglishQuotePath(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname === QUOTE_EN_PATH || pathname.startsWith(`${QUOTE_EN_PATH}/`);
}
