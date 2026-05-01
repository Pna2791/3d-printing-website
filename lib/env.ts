/**
 * Centralized environment reads (docs/rules.md).
 * - NEXT_PUBLIC_*: safe to reference by name in client bundles; values are still secrets—never log them.
 * - DATABASE_URL: server-only; never import helpers that use it from client components.
 */

export type PublicSupabaseConfig = {
  url: string;
  anonKey: string;
};

const MISSING_PUBLIC_SUPABASE =
  "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
  "For Docker: define them in `.env`, pass them as Compose `build.args` (for `next build` / client bundle) " +
  "and as `web.environment` (for `next start` / SSR), then rebuild the image after any change.";

/** Returns null if either value is missing or whitespace-only. */
export type ServiceRoleSupabaseConfig = PublicSupabaseConfig & {
  serviceRoleKey: string;
};

/** Server-only: requires SUPABASE_SERVICE_ROLE_KEY plus public Supabase URL. */
export function getServiceRoleSupabaseConfig(): ServiceRoleSupabaseConfig | null {
  const pub = getPublicSupabaseConfig();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
  if (!pub || !serviceRoleKey) {
    return null;
  }
  return { ...pub, serviceRoleKey };
}

/**
 * Salt for IP hashing (middleware). Prefer a long random string in production.
 * Empty string is allowed but reduces collision resistance versus salted hashing.
 */
export function getAnalyticsIpSalt(): string {
  return process.env.ANALYTICS_IP_SALT?.trim() ?? "";
}

/** Server-only admin login secret for `/admin/*` access. */
export function getAdminAnalyticsSecret(): string {
  return process.env.ADMIN_ANALYTICS_SECRET?.trim() ?? "";
}

export function getPublicSupabaseConfig(): PublicSupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  if (!url || !anonKey) {
    return null;
  }
  return { url, anonKey };
}

/** Use only where missing config must abort (e.g. guarded API); prefer null + JSON for HTTP handlers. */
export function assertPublicSupabaseConfig(): PublicSupabaseConfig {
  const cfg = getPublicSupabaseConfig();
  if (!cfg) {
    throw new Error(MISSING_PUBLIC_SUPABASE);
  }
  return cfg;
}

/** Safe diagnostics: booleans, anon key length, URL host only—never log the anon key. */
export function describePublicSupabaseEnvPresence(): {
  hasUrl: boolean;
  hasAnonKey: boolean;
  anonKeyLength: number;
  urlHost: string | null;
  urlParseError: boolean;
} {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  let urlHost: string | null = null;
  let urlParseError = false;
  try {
    if (url) urlHost = new URL(url).host;
  } catch {
    urlParseError = true;
    urlHost = null;
  }
  return {
    hasUrl: Boolean(url),
    hasAnonKey: Boolean(anonKey),
    anonKeyLength: anonKey.length,
    urlHost,
    urlParseError,
  };
}

/**
 * Direct Postgres URL (migrations, server tooling). Not a Next public var—never use on the client.
 */
export function getDatabaseUrl(): string | undefined {
  if (typeof window !== "undefined") {
    throw new Error("DATABASE_URL must not be read in the browser.");
  }
  const v = process.env.DATABASE_URL?.trim();
  return v || undefined;
}

/**
 * Server-only: Na 3D Slicer service (`POST /v1/slice`, `GET /v1/tasks/{id}`).
 * No trailing slash.
 */
export function getSlicerApiBaseUrl(): string | null {
  if (typeof window !== "undefined") {
    throw new Error("SLICER_API_BASE_URL must not be read in the browser.");
  }
  const raw = process.env.SLICER_API_BASE_URL?.trim() ?? "";
  if (!raw) return null;
  return raw.replace(/\/+$/, "");
}

/**
 * Compare runtime `NEXT_PUBLIC_SUPABASE_URL` with the value captured at `next build`
 * (`SUPABASE_PUBLIC_URL_AT_BUILD` via `next.config.ts`). Logs a warning if they differ.
 */
export function warnIfPublicSupabaseUrlDiffersFromBuild(): void {
  if (typeof window !== "undefined") return;

  const runtimeUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const buildUrl = process.env.SUPABASE_PUBLIC_URL_AT_BUILD?.trim() ?? "";

  if (!buildUrl || !runtimeUrl) return;
  if (buildUrl === runtimeUrl) return;

  console.warn(
    "[env] NEXT_PUBLIC_SUPABASE_URL at runtime differs from the URL baked at `next build`. " +
      "Rebuild the Docker image (`docker compose build --no-cache web`) so the client bundle matches SSR, " +
      "or use the same values for Compose `build.args` and `web.environment`.",
  );
}
