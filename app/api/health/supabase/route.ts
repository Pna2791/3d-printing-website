import { NextResponse } from "next/server";

import {
  describePublicSupabaseEnvPresence,
  getPublicSupabaseConfig,
  warnIfPublicSupabaseUrlDiffersFromBuild,
} from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function isMissingPrintersTable(message: string, code?: string): boolean {
  const m = message.toLowerCase();
  if (
    m.includes("schema cache") ||
    m.includes("does not exist") ||
    m.includes("could not find the table")
  ) {
    return true;
  }
  return code === "PGRST205" || code === "42P01";
}

/**
 * Verifies anon server access to Supabase (PostgREST) using NEXT_PUBLIC_* only.
 * Queries `public.printers` with a head count (no row payload).
 */
export async function GET() {
  const presence = describePublicSupabaseEnvPresence();
  console.info("[api/health/supabase]", {
    ...presence,
    connection: "pending",
  });

  try {
    const cfg = getPublicSupabaseConfig();
    if (!cfg) {
      console.info("[api/health/supabase]", { connection: "skipped_missing_env" });
      return NextResponse.json(
        {
          ok: false,
          error:
            "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Set both in the container environment (and as Docker build args for the client bundle).",
          code: "MISSING_ENV",
        },
        { status: 503 },
      );
    }

    if (presence.urlParseError) {
      console.info("[api/health/supabase]", { connection: "invalid_url" });
      return NextResponse.json(
        {
          ok: false,
          error:
            "NEXT_PUBLIC_SUPABASE_URL is set but is not a valid URL. Fix your environment and rebuild the image if needed.",
          code: "INVALID_URL",
        },
        { status: 503 },
      );
    }

    warnIfPublicSupabaseUrlDiffersFromBuild();

    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      console.info("[api/health/supabase]", { connection: "client_null" });
      return NextResponse.json(
        {
          ok: false,
          error: "Supabase server client could not be created.",
          code: "CLIENT_INIT",
        },
        { status: 503 },
      );
    }

    const { error, count } = await supabase
      .from("printers")
      .select("*", { count: "exact", head: true });

    if (error) {
      const code =
        typeof error === "object" && error !== null && "code" in error
          ? String((error as { code?: string }).code)
          : undefined;

      const missingTable = isMissingPrintersTable(error.message, code);

      console.info("[api/health/supabase]", {
        connection: "supabase_error",
        message: error.message,
        code: code ?? null,
        hint: "hint" in error ? (error as { hint?: string }).hint : undefined,
        details: "details" in error ? (error as { details?: string }).details : undefined,
        missingTable,
      });

      return NextResponse.json(
        {
          ok: false,
          error: error.message,
          code: missingTable ? "MISSING_TABLE" : "SUPABASE_ERROR",
        },
        { status: 503 },
      );
    }

    const printerCount = count ?? 0;
    console.info("[api/health/supabase]", {
      connection: "ok",
      printerCount,
    });

    return NextResponse.json({ ok: true, printerCount });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.info("[api/health/supabase]", { connection: "exception", message });
    return NextResponse.json(
      { ok: false, error: message, code: "UNEXPECTED" },
      { status: 503 },
    );
  }
}
