import { type NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { trackPageViewIfEligible } from "@/lib/analytics/middleware-track";
import { getAdminAnalyticsSecret } from "@/lib/env";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
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

  const response = await updateSession(request);
  await trackPageViewIfEligible(request);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
