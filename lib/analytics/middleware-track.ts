import { createServerClient } from "@supabase/ssr";
import { type NextRequest } from "next/server";

import { getPublicSupabaseConfig, getAnalyticsIpSalt } from "@/lib/env";
import type { Database } from "@/lib/supabase/types";

import { hashIpForAnalytics } from "./ip-hash";

const MAX_URL_LEN = 4000;
const MAX_AGENT_LEN = 500;
const MAX_REF_LEN = 2000;

function normalizeHost(rawHost: string | null): string {
  if (!rawHost) return "";
  return rawHost.trim().toLowerCase().replace(/:\d+$/, "");
}

function isAnalyticsEnvironmentAllowed(request: NextRequest): boolean {
  if (process.env.NODE_ENV !== "production") return false;

  const host = normalizeHost(request.headers.get("host"));
  if (!host) return false;
  if (host === "localhost" || host === "127.0.0.1" || host === "::1") return false;

  // Optional domain allow-list: comma-separated hosts (e.g. "yourdomain.com,www.yourdomain.com").
  const allowedHostsRaw = process.env.ANALYTICS_ALLOWED_HOSTS?.trim() ?? "";
  if (!allowedHostsRaw) return true;

  const allowedHosts = allowedHostsRaw
    .split(",")
    .map((v) => normalizeHost(v))
    .filter(Boolean);

  if (allowedHosts.length === 0) return true;
  return allowedHosts.includes(host);
}

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "unknown";
}

function buildPageUrl(request: NextRequest): string {
  const { pathname, search } = request.nextUrl;
  const full = `${pathname}${search}`;
  if (full.length <= MAX_URL_LEN) return full;
  return full.slice(0, MAX_URL_LEN);
}

export function shouldTrackPageView(request: NextRequest): boolean {
  if (request.method !== "GET") return false;

  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith("/api") || pathname.startsWith("/_next")) return false;
  if (pathname === "/favicon.ico") return false;
  if (/\.(?:ico|png|jpe?g|gif|webp|svg|txt|xml|webmanifest|json|map|woff2?|ttf|eot)$/i.test(pathname)) {
    return false;
  }

  if (request.headers.get("RSC") === "1") return false;
  if (request.headers.get("Next-Router-Prefetch") === "1") return false;
  if (request.headers.get("Sec-Purpose") === "prefetch") return false;

  return true;
}

/**
 * Inserts one row into `page_views` using the anon key (insert-only RLS).
 * Safe to call from Edge middleware; failures are swallowed to avoid breaking navigation.
 */
export async function trackPageViewIfEligible(request: NextRequest): Promise<void> {
  if (!isAnalyticsEnvironmentAllowed(request)) return;
  if (!shouldTrackPageView(request)) return;

  const cfg = getPublicSupabaseConfig();
  if (!cfg) return;

  const supabase = createServerClient<Database>(cfg.url, cfg.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll() {
        /* no session writes from analytics */
      },
    },
  });

  const salt = getAnalyticsIpSalt();
  const ipHash = await hashIpForAnalytics(clientIp(request), salt);
  const url = buildPageUrl(request);
  const referrer = request.headers.get("referer")?.slice(0, MAX_REF_LEN) ?? null;
  const userAgent = request.headers.get("user-agent")?.slice(0, MAX_AGENT_LEN) ?? null;

  const { error } = await supabase.from("page_views").insert({
    url,
    referrer,
    user_agent: userAgent,
    ip_hash: ipHash,
  });

  if (error && process.env.NODE_ENV === "development") {
    console.warn("[analytics] page_views insert failed", error.message);
  }
}
