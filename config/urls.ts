/**
 * Externally-configured URLs — read `process.env` here only, import helpers elsewhere.
 * `NEXT_PUBLIC_*` values are inlined into the client bundle at `next build` time.
 */

const DEFAULT_TEXT_SLICER_URL = "https://text.na-3d.shop";
const TEXT_SLICER_DEV_PORT = 8000;

/**
 * Resolve the Text Slicer URL for the landing-page CTA.
 *
 * 1. Non-empty `NEXT_PUBLIC_TEXT_SLICER_URL` always wins.
 * 2. **Development** (env unset): browser hostname on port 8000
 *    (same machine as the local Text Slicer).
 * 3. **Production** (env unset): `https://text.na-3d.shop`.
 *
 * Always returns a non-empty string — the CTA is never disabled for a missing env var.
 */
export function resolveTextSlicerUrl(): string {
  const url = process.env.NEXT_PUBLIC_TEXT_SLICER_URL?.trim();
  if (url && url.length > 0) {
    return url;
  }

  if (process.env.NODE_ENV === "development") {
    if (typeof window !== "undefined") {
      return `${window.location.protocol}//${window.location.hostname}:${TEXT_SLICER_DEV_PORT}`;
    }
    // SSR placeholder; client re-resolves after mount with the real hostname.
    return `http://localhost:${TEXT_SLICER_DEV_PORT}`;
  }

  return DEFAULT_TEXT_SLICER_URL;
}

/**
 * Build-time / SSR-safe resolved URL.
 * In development the client may refine this after mount via `resolveTextSlicerUrl()`.
 */
export const TEXT_SLICER_URL = resolveTextSlicerUrl();
