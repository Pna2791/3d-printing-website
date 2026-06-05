import "server-only";

import { cookies } from "next/headers";

import { getAdminAnalyticsSecret } from "@/lib/env";

export type AdminSessionResult =
  | { ok: true }
  | { ok: false; status: number; message: string; code?: string };

/**
 * Validates the HttpOnly `admin_access` cookie matches `ADMIN_ANALYTICS_SECRET`
 * (same gate as `middleware.ts` for `/admin/*`).
 */
export async function requireAdminSession(): Promise<AdminSessionResult> {
  const secret = getAdminAnalyticsSecret();
  if (!secret) {
    return { ok: false, status: 503, message: "Admin secret is not configured on the server.", code: "SERVER_CONFIG" };
  }
  const cookie = (await cookies()).get("admin_access")?.value;
  if (cookie !== secret) {
    return { ok: false, status: 401, message: "Unauthorized.", code: "UNAUTHORIZED" };
  }
  return { ok: true };
}
