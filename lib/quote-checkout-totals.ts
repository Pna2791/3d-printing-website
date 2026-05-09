import { applyMinimumOrderFloor } from "@/lib/pricing";
import { applyBulkPctToSubtotal, bulkTierForQty, type BulkDiscountTier } from "@/lib/quote-international";

/** Same cap as the quote UI and POST /api/orders/checkout-quote. */
export const QUOTE_CHECKOUT_MAX_QTY = 9999;

export function clampQuoteCheckoutQty(raw: number): number {
  const q0 = Number.isFinite(raw) ? raw : 1;
  return Math.min(QUOTE_CHECKOUT_MAX_QTY, Math.max(1, Math.floor(q0)));
}

export type QuoteCheckoutMoney = {
  /** Quantity after `clampQuoteCheckoutQty` — used for line math, bulk tier, and persistence. */
  qty: number;
  lineSubtotal: number;
  bulkTier: BulkDiscountTier;
  bulkAdjustedSubtotal: number;
  subtotalVnd: number;
  totalVnd: number;
  floorApplied: boolean;
  minimumVnd: number;
};

/**
 * Definitive checkout totals: clamp `rawQty`, then per-unit line VND × qty, bulk tier, then minimum-order floor.
 * Use from the quote UI, `QuoteCheckoutModal` preflight, and `POST /api/orders/checkout-quote` so totals stay in sync.
 */
export function quoteMoneyFromUnitLineVnd(
  unitLineVnd: number,
  rawQty: number,
  isStudent: boolean,
): QuoteCheckoutMoney {
  const qty = clampQuoteCheckoutQty(rawQty);
  const lineSubtotal = Math.round(unitLineVnd * qty);
  const bulkTier = bulkTierForQty(qty);
  const bulkAdjustedSubtotal =
    bulkTier.kind === "percent" ? applyBulkPctToSubtotal(lineSubtotal, bulkTier) : lineSubtotal;
  const floor = applyMinimumOrderFloor(bulkAdjustedSubtotal, isStudent);
  return {
    qty,
    lineSubtotal,
    bulkTier,
    bulkAdjustedSubtotal,
    subtotalVnd: floor.subtotalVnd,
    totalVnd: floor.totalVnd,
    floorApplied: floor.floorApplied,
    minimumVnd: floor.minimumVnd,
  };
}
