import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service";

/** `uploads/YYYY-MM-DD/{uuid}.stl` */
export function buildQuoteStlObjectPath(uploadId: string, datePrefixUtc: string): string {
  return `uploads/${datePrefixUtc}/${uploadId}.stl`;
}

/** `previews/{uuid}.png` */
export function buildQuotePreviewObjectPath(uploadId: string): string {
  return `previews/${uploadId}.png`;
}

export function utcDatePrefixForStorage(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export function dataUrlToBuffer(dataUrl: string): Buffer | null {
  const m = /^data:([^;]+);base64,([\s\S]+)$/.exec(dataUrl.trim());
  if (!m) return null;
  try {
    return Buffer.from(m[2], "base64");
  } catch {
    return null;
  }
}

export async function uploadQuoteStlToStorage(
  stlBuffer: Buffer,
  objectPath: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const admin = createSupabaseServiceRoleClient();
  if (!admin) {
    return { ok: false, message: "missing_service_role" };
  }
  const { error } = await admin.storage.from("stl-files").upload(objectPath, stlBuffer, {
    contentType: "model/stl",
    upsert: false,
  });
  if (error) {
    return { ok: false, message: error.message };
  }
  return { ok: true };
}

export async function uploadQuotePreviewPngToStorage(
  pngBuffer: Buffer,
  objectPath: string,
): Promise<{ ok: true; publicUrl: string } | { ok: false; message: string }> {
  const admin = createSupabaseServiceRoleClient();
  if (!admin) {
    return { ok: false, message: "missing_service_role" };
  }
  const { error } = await admin.storage.from("model-previews").upload(objectPath, pngBuffer, {
    contentType: "image/png",
    upsert: false,
  });
  if (error) {
    return { ok: false, message: error.message };
  }
  const { data } = admin.storage.from("model-previews").getPublicUrl(objectPath);
  const publicUrl = data.publicUrl;
  if (!publicUrl) {
    return { ok: false, message: "no_public_url" };
  }
  return { ok: true, publicUrl };
}
