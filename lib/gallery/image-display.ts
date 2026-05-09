/** True when `src` is an absolute http(s) URL (e.g. Supabase Storage public URL). */
export function isRemoteImageSrc(src: string): boolean {
  return /^https?:\/\//i.test(src.trim());
}

/**
 * Trims stored URLs. Supabase `getPublicUrl` already returns a full `https://…/storage/v1/object/public/gallery/…` URL.
 */
export function normalizeGalleryImageUrl(src: string): string {
  return src.trim();
}
