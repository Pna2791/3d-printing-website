import "server-only";

import {
  getStl2ThumbMaterialPreset,
  getStl2ThumbMode,
  getStl2ThumbRecalcNormals,
  getStl2ThumbServiceUrl,
  getStl2ThumbThumbSize,
  getStl2ThumbTimeoutMs,
} from "@/lib/env";
import { sniffImageMime } from "@/lib/slicer-proxy";

export type ThumbnailGenerateResult =
  | { ok: true; dataUrl: string }
  | { ok: false; reason: string };

function shouldCallThumbService(): boolean {
  const mode = getStl2ThumbMode();
  if (mode === "off") return false;
  const url = getStl2ThumbServiceUrl();
  if (mode === "http") return Boolean(url);
  return Boolean(url);
}

/**
 * Renders a PNG thumbnail by POSTing the STL to the `thumb-service` FastAPI (`POST /generate`)
 * and converting the PNG body to a `data:` URL for `<img src>`.
 */
export async function generateThumbnailFromStlBuffer(
  stlBuffer: Buffer,
  options?: { signal?: AbortSignal },
): Promise<ThumbnailGenerateResult> {
  if (!shouldCallThumbService()) {
    const mode = getStl2ThumbMode();
    if (mode === "http" && !getStl2ThumbServiceUrl()) {
      return { ok: false, reason: "STL2THUMB_MODE=http but STL2THUMB_SERVICE_URL is not set" };
    }
    return { ok: false, reason: "STL2THUMB_SERVICE_URL not set or STL2THUMB_MODE=off" };
  }

  const baseUrl = getStl2ThumbServiceUrl()!;
  const url = `${baseUrl}/generate`;
  const timeoutMs = getStl2ThumbTimeoutMs();
  const signal = options?.signal;

  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(stlBuffer)], { type: "model/stl" }), "model.stl");
  form.append("material_preset", getStl2ThumbMaterialPreset());
  form.append("thumb_size", String(getStl2ThumbThumbSize()));
  form.append("recalc_normals", getStl2ThumbRecalcNormals() ? "true" : "false");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  timer.unref?.();

  const onParentAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", onParentAbort, { once: true });
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      body: form,
      signal: controller.signal,
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      let detail = text.slice(0, 200);
      try {
        const j = JSON.parse(text) as { detail?: unknown };
        if (typeof j.detail === "string") detail = j.detail;
        else if (Array.isArray(j.detail)) detail = JSON.stringify(j.detail).slice(0, 200);
      } catch {
        /* keep truncated text */
      }
      return {
        ok: false,
        reason: detail ? `thumb-service HTTP ${res.status}: ${detail}` : `thumb-service HTTP ${res.status}`,
      };
    }

    const buf = Buffer.from(await res.arrayBuffer());
    const mime = sniffImageMime(buf);
    if (!mime || buf.length < 48) {
      return { ok: false, reason: "thumb-service returned a non-image body" };
    }

    return { ok: true, dataUrl: `data:${mime};base64,${buf.toString("base64")}` };
  } catch (err) {
    if (controller.signal.aborted || (err instanceof Error && err.name === "AbortError")) {
      return { ok: false, reason: "thumbnail request aborted or timed out" };
    }
    const msg = err instanceof Error ? err.message : "unknown error";
    return { ok: false, reason: msg };
  } finally {
    clearTimeout(timer);
    if (signal) signal.removeEventListener("abort", onParentAbort);
  }
}
