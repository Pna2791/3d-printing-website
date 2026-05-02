import "server-only";

/** Reject empty bodies and tiny error snippets masquerading as images. */
const MIN_IMAGE_BYTES = 48;

const MAX_PREVIEW_FETCH_DEPTH = 3;

function joinUrl(base: string, pathOrUrl: string) {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${base}${path}`;
}

/** Detect image format from magic bytes / SVG prefix. */
export function sniffImageMime(buf: Buffer): string | null {
  if (buf.length < 3) return null;

  if (
    buf.length >= 8 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  ) {
    return "image/png";
  }
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buf.length >= 12 &&
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  if (buf.length >= 6) {
    const g = buf.toString("ascii", 0, 6);
    if (g === "GIF87a" || g === "GIF89a") return "image/gif";
  }
  if (buf.length >= 2 && buf.toString("ascii", 0, 2) === "BM") {
    return "image/bmp";
  }
  if (buf.length >= 12 && buf.toString("ascii", 4, 8) === "ftyp") {
    const brand = buf.toString("ascii", 8, Math.min(buf.length, 16));
    if (brand.includes("avif") || brand.startsWith("avis")) return "image/avif";
  }

  const headUtf = buf.toString("utf8", 0, Math.min(buf.length, 4096)).trimStart();
  if (headUtf.includes("<svg")) return "image/svg+xml";
  return null;
}

function looksLikeStructuredText(buf: Buffer): boolean {
  const head = buf.toString("utf8", 0, Math.min(buf.length, 256)).trimStart();
  const h = head.toLowerCase();
  if (head.startsWith("{") || head.startsWith("[")) return true;
  if (h.startsWith("<!doctype html") || h.startsWith("<html")) return true;
  return false;
}

function asciiPrintableRatio(buf: Buffer, maxBytes: number): number {
  const n = Math.min(buf.length, maxBytes);
  if (n === 0) return 1;
  let printable = 0;
  for (let i = 0; i < n; i++) {
    const b = buf[i]!;
    if (b === 9 || b === 10 || b === 13 || (b >= 32 && b < 127)) printable++;
  }
  return printable / n;
}

/** Build a validated data URL — rejects HTML/JSON error pages labeled as PNG, etc. */
function bufferToImageDataUrl(buf: Buffer, declaredContentType: string | null): string | null {
  if (buf.length < MIN_IMAGE_BYTES) return null;

  const sniffed = sniffImageMime(buf);
  const declaredRaw = declaredContentType?.split(";")[0]?.trim().toLowerCase() ?? "";
  let mime: string | null = sniffed;

  if (!mime) {
    if (looksLikeStructuredText(buf)) return null;

    const decl = declaredRaw.startsWith("image/") ? declaredRaw : null;
    if (!decl) return null;

    if (asciiPrintableRatio(buf, 2048) > 0.92) return null;

    mime = decl;
  }

  return `data:${mime};base64,${buf.toString("base64")}`;
}

async function extractImageFromJsonPayload(
  buf: Buffer,
  baseUrl: string,
  signal: AbortSignal,
  depth: number,
): Promise<string | null> {
  const raw = buf.toString("utf8").trimStart();
  if (!raw.startsWith("{") && !raw.startsWith("[")) return null;

  let o: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    o = parsed as Record<string, unknown>;
  } catch {
    return null;
  }

  if (typeof o.detail === "string") return null;
  if (o.status === "failed" || o.status === "error") return null;

  const stringFieldsForDataUrl = [
    "preview_image",
    "image",
    "thumbnail",
    "preview",
    "screenshot",
    "data_url",
    "dataUrl",
  ];

  for (const key of stringFieldsForDataUrl) {
    const v = o[key];
    if (typeof v !== "string" || !v.includes("base64,")) continue;
    if (!v.startsWith("data:image/")) continue;

    try {
      const comma = v.indexOf("base64,");
      const b64part = comma >= 0 ? v.slice(comma + 7) : "";
      if (Buffer.from(b64part, "base64").length >= MIN_IMAGE_BYTES) return v;
    } catch {
      continue;
    }
  }

  const b64keys = ["image_b64", "base64", "thumbnail_b64", "png_base64", "bytes"];
  for (const key of b64keys) {
    const v = o[key];
    if (typeof v !== "string" || v.length < MIN_IMAGE_BYTES) continue;
    const clean = v.replace(/\s/g, "");
    if (!/^[A-Za-z0-9+/]+=*$/.test(clean)) continue;

    let decoded: Buffer;
    try {
      decoded = Buffer.from(clean, "base64");
    } catch {
      continue;
    }
    if (decoded.length < MIN_IMAGE_BYTES) continue;
    if (looksLikeStructuredText(decoded)) continue;

    const fmt = o.format ?? o.encoding;
    const format = typeof fmt === "string" ? fmt.toLowerCase() : "";
    let mime =
      typeof o.mime_type === "string" && o.mime_type.startsWith("image/")
        ? (o.mime_type.split(";")[0]?.trim().toLowerCase() ?? null)
        : null;

    if (!mime) {
      if (format === "jpg" || format === "jpeg") mime = "image/jpeg";
      else if (format === "webp") mime = "image/webp";
      else if (format === "gif") mime = "image/gif";
      else mime = sniffImageMime(decoded) ?? "image/png";
    }

    return `data:${mime};base64,${clean}`;
  }

  const redirectKeys = ["url", "preview_url", "path", "href", "thumbnail_url", "image_url"];
  for (const key of redirectKeys) {
    const v = o[key];
    if (typeof v !== "string" || !v.trim() || v.startsWith("data:")) continue;
    if (!(v.startsWith("/") || v.startsWith("http://") || v.startsWith("https://"))) continue;
    const nextDepth = depth + 1;
    if (nextDepth > MAX_PREVIEW_FETCH_DEPTH) return null;
    const nested = await fetchPreviewAsDataUrl(baseUrl, v, signal, nextDepth);
    if (nested) return nested;
  }

  return null;
}

/**
 * Fetch a raster/SVG thumbnail and return a `data:` URL usable in `<img src>`.
 * Supports binary image responses and JSON payloads that embed base64 / redirect paths.
 */
export async function fetchPreviewAsDataUrl(
  baseUrl: string,
  thumbPath: string,
  signal: AbortSignal,
  depth = 0,
): Promise<string | null> {
  if (depth > MAX_PREVIEW_FETCH_DEPTH) return null;

  const url = joinUrl(baseUrl, thumbPath);

  try {
    const res = await fetch(url, {
      signal,
      cache: "no-store",
      headers: {
        Accept: "image/avif,image/webp,image/apng,image/*,application/json;q=0.08,*/*;q=0.05",
      },
    });
    if (!res.ok) return null;

    const buf = Buffer.from(await res.arrayBuffer());
    const contentTypeRaw = res.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() ?? "";

    if (buf.length < MIN_IMAGE_BYTES) return null;

    if (
      contentTypeRaw.includes("application/json") ||
      contentTypeRaw.endsWith("+json") ||
      contentTypeRaw === "text/json"
    ) {
      return extractImageFromJsonPayload(buf, baseUrl, signal, depth);
    }

    const textProbe = buf.toString("utf8", 0, Math.min(buf.length, 2048)).trimStart();
    if (textProbe.startsWith("{") || textProbe.startsWith("[")) {
      return (await extractImageFromJsonPayload(buf, baseUrl, signal, depth)) ?? null;
    }

    return bufferToImageDataUrl(buf, contentTypeRaw || null);
  } catch {
    return null;
  }
}

export { joinUrl };
