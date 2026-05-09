import { NextResponse } from "next/server";

/**
 * Fallback VND per 1 USD when upstream is unavailable (update daily / via env).
 * @example VNDUSD_RATE=25800 → 25800 ₫ per $1
 */
const FALLBACK_VND_PER_USD = Number.parseFloat(process.env.VNDUSD_RATE ?? "25500") || 25500;

/** GET /api/exchange-rate — returns { vndPerUsd: number, source: string } */
async function fetchVndPerUsd(): Promise<{ vndPerUsd: number; source: string } | null> {
  try {
    const res = await fetch("https://api.exchangerate.host/latest?base=USD&symbols=VND", {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = (await res.json()) as { success?: boolean; rates?: { VND?: number } };
      const rate = data.rates?.VND;
      if (typeof rate === "number" && Number.isFinite(rate) && rate > 0) {
        return { vndPerUsd: Math.round(rate), source: "exchangerate.host" };
      }
    }
  } catch {
    /* try next */
  }
  try {
    const res = await fetch("https://api.frankfurter.app/latest?from=USD&to=VND", {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = (await res.json()) as { rates?: { VND?: number } };
      const rate = data.rates?.VND;
      if (typeof rate === "number" && Number.isFinite(rate) && rate > 0) {
        return { vndPerUsd: Math.round(rate), source: "frankfurter" };
      }
    }
  } catch {
    /* use fallback below */
  }
  return null;
}

export async function GET() {
  const live = await fetchVndPerUsd();
  if (live) return NextResponse.json(live);

  return NextResponse.json({
    vndPerUsd: Math.round(FALLBACK_VND_PER_USD),
    source: "fallback",
  });
}
