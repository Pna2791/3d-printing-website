/**
 * Externally-configured URLs — read `process.env` here only, import helpers elsewhere.
 * `NEXT_PUBLIC_*` values are inlined into the client bundle at `next build` time.
 */

const TEXT_SLICER_DEV_PORT = 8000;

/** Explicitly configured Text Slicer URL (production / override). */
export const TEXT_SLICER_URL = process.env.NEXT_PUBLIC_TEXT_SLICER_URL;

/**
 * Resolve the Text Slicer URL for the "Báo giá ngay" CTA.
 *
 * - `NEXT_PUBLIC_TEXT_SLICER_URL` always wins when set.
 * - In development, falls back to the hostname the visitor used to reach this
 *   site (localhost, LAN IP, …) on port 8000 — the Text Slicer container runs
 *   on the same machine as the dev server, so no IP needs to be hardcoded.
 * - Returns `undefined` otherwise (browser-only fallback; callers disable the CTA).
 */
export function resolveTextSlicerUrl(): string | undefined {
  if (TEXT_SLICER_URL) return TEXT_SLICER_URL;
  if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:${TEXT_SLICER_DEV_PORT}`;
  }
  return undefined;
}

if (!TEXT_SLICER_URL && process.env.NODE_ENV === "production") {
  console.warn(
    "[config/urls] NEXT_PUBLIC_TEXT_SLICER_URL is not set — the Text Slicer button on the landing page is disabled.",
  );
}
