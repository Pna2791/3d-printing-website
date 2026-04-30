import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getServiceRoleSupabaseConfig } from "@/lib/env";
import type { Database } from "@/lib/supabase/types";

/**
 * Service-role client for server-only operations (bypasses RLS).
 * Returns null when URL or SUPABASE_SERVICE_ROLE_KEY is missing.
 */
export function createSupabaseServiceRoleClient() {
  const cfg = getServiceRoleSupabaseConfig();
  if (!cfg) {
    return null;
  }

  return createClient<Database>(cfg.url, cfg.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
