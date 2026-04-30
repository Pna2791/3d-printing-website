"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getPublicSupabaseConfig } from "@/lib/env";
import type { Database } from "@/lib/supabase/types";

/** Returns null when env is missing (e.g. during `next build` prerender of client tree). */
export function createSupabaseBrowserClient(): SupabaseClient<Database> | null {
  const cfg = getPublicSupabaseConfig();
  if (!cfg) {
    return null;
  }

  return createBrowserClient<Database>(cfg.url, cfg.anonKey);
}
