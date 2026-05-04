/**
 * Feature flags — public read-only site defaults.
 * FEATURE DISABLED: kept for future use when re-enabling commerce/auth.
 */
export const FEATURES = {
  /** When false, order UI is hidden and POST /api/orders returns 403. */
  ORDER_ENABLED: false,
  /** When false, middleware skips auth refresh; order UI (requires auth) stays off. */
  AUTH_ENABLED: false,
  /**
   * Đặt in từ trang `/bao-gia-in-3d` (POST `/api/orders/checkout-quote`).
   * Tắt bằng `NEXT_PUBLIC_QUOTE_CHECKOUT_ENABLED=false` nếu chưa cấu hình Supabase service role / migration.
   */
  QUOTE_CHECKOUT_ENABLED: process.env.NEXT_PUBLIC_QUOTE_CHECKOUT_ENABLED !== "false",
} as const;

/** Liên hệ khi đặt hàng trực tuyến tắt — chỉnh `fanpageUrl` / `fanpageLabel` cho đúng fanpage. */
export const OFFLINE_ORDER_CONTACT = {
  zaloTelHref: "tel:0848939059",
  zaloDisplay: "08489.39059",
  fanpageUrl: "https://www.facebook.com/Na3D.Shop",
  fanpageLabel: "Fanpage",
} as const;
