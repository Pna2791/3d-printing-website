import "server-only";

import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import { getPublicSupabaseConfig } from "@/lib/env";
import type { Database } from "@/lib/supabase/types";

/**
 * Returns null when public Supabase env is missing so `next build` / Docker builds
 * can prerender without secrets; callers should surface a configuration error.
 */
export async function createSupabaseServerClient(): Promise<SupabaseClient<Database> | null> {
  const cfg = getPublicSupabaseConfig();
  if (!cfg) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(cfg.url, cfg.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component without mutable cookies; middleware refreshes session.
        }
      },
    },
  });
}
