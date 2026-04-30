import { NextResponse } from "next/server";

import { describePublicSupabaseEnvPresence, getPublicSupabaseConfig } from "@/lib/env";

export async function GET() {
  const cfg = getPublicSupabaseConfig();
  const presence = describePublicSupabaseEnvPresence();

  return NextResponse.json({
    ok: true,
    supabase: {
      configured: cfg !== null,
      hasUrl: presence.hasUrl,
      hasAnonKey: presence.hasAnonKey,
      anonKeyLength: presence.anonKeyLength,
      urlHost: presence.urlHost,
      urlParseError: presence.urlParseError,
    },
  });
}
