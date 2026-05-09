import type { NaLocale } from "@/lib/quote-paths";

/** Destination bucket for illustrative international freight (not customs/duties). */
export type ShippingRegion = "VN" | "ASIA" | "EUROPE" | "USA";

export const SHIPPING_REGION_LABEL_VI: Record<ShippingRegion, string> = {
  VN: "Việt Nam (COD)",
  ASIA: "Châu Á",
  EUROPE: "Châu Âu",
  USA: "Hoa Kỳ",
};

export const SHIPPING_REGION_LABEL_EN: Record<ShippingRegion, string> = {
  VN: "Vietnam (COD)",
  ASIA: "Asia",
  EUROPE: "Europe",
  USA: "United States",
};

export function shippingRegionLabel(region: ShippingRegion, locale: NaLocale): string {
  return locale === "en" ? SHIPPING_REGION_LABEL_EN[region] : SHIPPING_REGION_LABEL_VI[region];
}

/**
 * Rough tiers (USD) for air/courier illustrative quotes from Vietnam — adjust via env-backed numbers later.
 * fee ≈ base + ratePerKg * weightKg (min fee applied).
 */
const SHIPPING_TIERS_USD: Record<
  ShippingRegion,
  { baseUsd: number; perKgUsd: number; minUsd: number }
> = {
  VN: { baseUsd: 0, perKgUsd: 0, minUsd: 0 }, // COD domestic — freight often quoted separately in VND
  ASIA: { baseUsd: 12, perKgUsd: 8, minUsd: 18 },
  EUROPE: { baseUsd: 22, perKgUsd: 14, minUsd: 35 },
  USA: { baseUsd: 28, perKgUsd: 16, minUsd: 42 },
};

export function estimateIntlShippingUsd(weightGramsTotal: number, region: ShippingRegion): number | null {
  if (region === "VN") return null;
  const kg = Math.max(0, weightGramsTotal) / 1000;
  if (kg <= 0) return null;
  const t = SHIPPING_TIERS_USD[region];
  return Math.max(t.minUsd, t.baseUsd + kg * t.perKgUsd);
}

export type BulkDiscountTier =
  | { kind: "none" }
  | { kind: "percent"; pct: number; labelVi: string; labelEn: string }
  | { kind: "manual_quote"; labelVi: string; labelEn: string };

export function bulkTierLabel(tier: BulkDiscountTier, locale: NaLocale): string | null {
  if (tier.kind === "none") return null;
  return locale === "en" ? tier.labelEn : tier.labelVi;
}

/**
 * Bulk rules: 10–50 → −5%; 51–200 → −15%; 200+ → contact (no auto %); >500 → RFQ form.
 */
export function bulkTierForQty(qty: number): BulkDiscountTier {
  const q = Math.floor(Number.isFinite(qty) ? qty : 0);
  if (q < 10) return { kind: "none" };
  if (q <= 50)
    return {
      kind: "percent",
      pct: 5,
      labelVi: "Giảm 5% (10–50 mắt nhắt)",
      labelEn: "5% off (10–50 pcs)",
    };
  if (q <= 200)
    return {
      kind: "percent",
      pct: 15,
      labelVi: "Giảm 15% (51–200 mắt nhắt)",
      labelEn: "15% off (51–200 pcs)",
    };
  return {
    kind: "manual_quote",
    labelVi: "Đơn từ trên 200 mắt nhắt — vui lòng liên hệ báo giá chính thức",
    labelEn: "Orders over 200 pcs — contact us for a formal quotation",
  };
}

export function applyBulkPctToSubtotal(subtotalVnd: number, tier: BulkDiscountTier): number {
  if (tier.kind !== "percent") return Math.round(subtotalVnd);
  const p = tier.pct / 100;
  return Math.round(subtotalVnd * (1 - p));
}

export function requiresRfqForm(qty: number): boolean {
  return Math.floor(Number.isFinite(qty) ? qty : 0) > 500;
}
