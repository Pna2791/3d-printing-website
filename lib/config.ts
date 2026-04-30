/**
 * Feature flags — public read-only site defaults.
 * FEATURE DISABLED: kept for future use when re-enabling commerce/auth.
 */
export const FEATURES = {
  /** When false, order UI is hidden and POST /api/orders returns 403. */
  ORDER_ENABLED: false,
  /** When false, middleware skips auth refresh; order UI (requires auth) stays off. */
  AUTH_ENABLED: false,
} as const;
