import { type NextRequest } from "next/server";
import { NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";

import { trackPageViewIfEligible } from "@/lib/analytics/middleware-track";
import { FEATURES } from "@/lib/config";
import { getAdminAnalyticsSecret } from "@/lib/env";
import { updateSession } from "@/lib/supabase/middleware";

const intlMiddleware = createIntlMiddleware({
  locales: ["vi", "en"],
  defaultLocale: "vi",
  localePrefix: "as-needed",
});

export async function middleware(request: NextRequest) {
  const intlResponse = intlMiddleware(request);
  // If next-intl wants to redirect (e.g. add/remove locale prefix), return early.
  if (intlResponse.status !== 200) return intlResponse;

  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith("/admin")) {
    const loginPath = "/admin/login";
    if (pathname !== loginPath) {
      const secret = getAdminAnalyticsSecret();
      // If secret is configured, require matching secure cookie for /admin/* routes.
      if (secret && request.cookies.get("admin_access")?.value !== secret) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = loginPath;
        loginUrl.search = "";
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  await trackPageViewIfEligible(request);

  // Preserve next-intl rewrites/cookies — `updateSession` alone returns plain `next()` when auth is off.
  if (!FEATURES.AUTH_ENABLED) {
    return intlResponse;
  }

  const sessionResponse = await updateSession(request);
  intlResponse.cookies.getAll().forEach((c) => {
    sessionResponse.cookies.set(c.name, c.value);
  });
  return sessionResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
