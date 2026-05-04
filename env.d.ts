declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_SUPABASE_URL?: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
    SUPABASE_SERVICE_ROLE_KEY?: string;
    ANALYTICS_IP_SALT?: string;
    ANALYTICS_ALLOWED_HOSTS?: string;
    ADMIN_ANALYTICS_SECRET?: string;
    DATABASE_URL?: string;
    /** Injected at `next build` via `next.config.ts` for drift detection (not a secret). */
    SUPABASE_PUBLIC_URL_AT_BUILD?: string;
    /** Base URL of the local Na 3D Slicer API (e.g. http://127.0.0.1:8000). Server-only. */
    SLICER_API_BASE_URL?: string;
  }
}
