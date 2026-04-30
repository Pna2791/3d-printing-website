declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_SUPABASE_URL?: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
    SUPABASE_SERVICE_ROLE_KEY?: string;
    ANALYTICS_IP_SALT?: string;
    ADMIN_ANALYTICS_SECRET?: string;
    DATABASE_URL?: string;
    /** Injected at `next build` via `next.config.ts` for drift detection (not a secret). */
    SUPABASE_PUBLIC_URL_AT_BUILD?: string;
  }
}
