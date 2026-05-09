import { type NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { trackPageViewIfEligible } from "@/lib/analytics/middleware-track";
import { FEATURES } from "@/lib/config";
import { getAdminAnalyticsSecret } from "@/lib/env";
import { updateSession } from "@/lib/supabase/middleware";
import { withAppLocaleHeaders } from "@/lib/request-locale";

/**
 * No `next-intl` rewriting here — this app serves Vietnamese routes from `app/*` root
 * and English from explicit `app/en/*` (e.g. `/en`, `/en/3d-printing-quote`).
 * `next-intl` middleware expects `app/[locale]/...`
 * and rewrites `/` to internal paths those trees never handle → homepage 404.
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const passLocale = () =>
    NextResponse.next({
      request: { headers: withAppLocaleHeaders(request) },
    });

  if (pathname === "/en" || pathname.startsWith("/en/")) {
    await trackPageViewIfEligible(request);
    return passLocale();
  }

  if (pathname.startsWith("/admin")) {
    const loginPath = "/admin/login";
    if (pathname !== loginPath) {
      const secret = getAdminAnalyticsSecret();
      if (secret && request.cookies.get("admin_access")?.value !== secret) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = loginPath;
        loginUrl.search = "";
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  await trackPageViewIfEligible(request);

  if (!FEATURES.AUTH_ENABLED) {
    return passLocale();
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    // Root must match explicitly — `(?!…)+.*` pattern alone often skips bare `/`.
    "/",
    "/((?!api/|en/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
