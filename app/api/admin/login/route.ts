import { timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getAdminAnalyticsSecret } from "@/lib/env";

type LoginBody = {
  key?: unknown;
};

function safeEqual(a: string, b: string): boolean {
  const aa = Buffer.from(a);
  const bb = Buffer.from(b);
  if (aa.length !== bb.length) return false;
  return timingSafeEqual(aa, bb);
}

export async function POST(request: Request) {
  const secret = getAdminAnalyticsSecret();
  if (!secret) {
    return NextResponse.json({ error: "Admin secret is not configured." }, { status: 503 });
  }

  let body: LoginBody;
  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const key = typeof body.key === "string" ? body.key.trim() : "";
  if (!key || !safeEqual(key, secret)) {
    return NextResponse.json({ error: "Invalid secret key." }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set("admin_access", secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return NextResponse.json({ ok: true });
}
