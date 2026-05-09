import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { FEATURES } from "@/lib/config";
import { getPublicSupabaseConfig } from "@/lib/env";
import { withAppLocaleHeaders } from "@/lib/request-locale";
import type { Database } from "@/lib/supabase/types";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: { headers: withAppLocaleHeaders(request) },
  });

  // FEATURE DISABLED: auth cookie refresh skipped in public read-only mode.
  if (!FEATURES.AUTH_ENABLED) {
    return supabaseResponse;
  }

  const cfg = getPublicSupabaseConfig();
  if (!cfg) {
    return supabaseResponse;
  }

  const supabase = createServerClient<Database>(cfg.url, cfg.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({
          request: { headers: withAppLocaleHeaders(request) },
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  await supabase.auth.getUser();

  return supabaseResponse;
}
