import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { getSlicerApiBaseUrl } from "@/lib/env";
import {
  applyUniformScaleToSlicerMetadata,
  clampUniformModelScale,
  MODEL_SCALE_DEFAULT,
} from "@/lib/pricing";
import { parseQuoteMaterialFromForm, quoteStlPreviewImageAlt } from "@/lib/quote-stl-preview-alt";
import {
  buildQuotePreviewObjectPath,
  buildQuoteStlObjectPath,
  dataUrlToBuffer,
  uploadQuotePreviewPngToStorage,
  uploadQuoteStlToStorage,
  utcDatePrefixForStorage,
} from "@/lib/supabase/quoteSliceAssets";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service";
import { generateThumbnailFromStlBuffer } from "@/lib/thumbnail-generator";

export const runtime = "nodejs";

const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;
const POLL_INTERVAL_MS = 1000;
const POLL_MAX_MS = 180_000;

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

function parseFormBool(v: FormDataEntryValue | null): boolean {
  if (v == null) return false;
  const s = String(v).trim().toLowerCase();
  return s === "1" || s === "true" || s === "yes" || s === "on";
}

/** Na `online_slicer` FastAPI — `GET /v1/status/{job_id}`. */
type NaJobStatusResponse = {
  job_id: string;
  status: "processing" | "completed" | "failed";
  metadata: NaMetadata | null;
  error: string | null;
};

type NaMetadata = {
  filename?: string;
  estimated_print_time?: string | null;
  filament_used_mm?: number | null;
  filament_used_g?: number | null;
  model_dimensions?: {
    x_mm?: number | null;
    y_mm?: number | null;
    z_mm?: number | null;
  } | null;
};

/** Optional future / alternate contract — `GET /v1/tasks/{id}`. */
type DocStyleTaskResponse = {
  task_id?: string;
  status?: string;
  filename?: string | null;
  metadata?: NaMetadata | null;
  error_message?: string | null;
  previews?: { thumbnails?: string[] };
};

type SliceEnqueueNa = {
  job_id: string;
  output_path?: string;
};

type SliceEnqueueDoc = {
  task_id?: string;
  status?: string;
};

async function pollNaSlicerUntilDone(
  baseUrl: string,
  jobId: string,
  signal: AbortSignal,
): Promise<NaJobStatusResponse> {
  const deadline = Date.now() + POLL_MAX_MS;
  while (Date.now() < deadline) {
    if (signal.aborted) {
      throw new Error("Request aborted");
    }
    const res = await fetch(`${baseUrl}/v1/status/${encodeURIComponent(jobId)}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal,
      cache: "no-store",
    });

    if (res.status === 404) {
      return { job_id: jobId, status: "failed", metadata: null, error: "Unknown job_id." };
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        text ? `Slicer status HTTP ${res.status}: ${text.slice(0, 200)}` : `Slicer status HTTP ${res.status}`,
      );
    }

    const body = (await res.json()) as NaJobStatusResponse;
    if (body.status === "completed" || body.status === "failed") {
      return body;
    }

    await sleep(POLL_INTERVAL_MS);
  }

  return {
    job_id: jobId,
    status: "failed",
    metadata: null,
    error: "Slicer timed out waiting for results.",
  };
}

async function pollDocStyleUntilDone(
  baseUrl: string,
  taskId: string,
  signal: AbortSignal,
): Promise<DocStyleTaskResponse> {
  const deadline = Date.now() + POLL_MAX_MS;
  while (Date.now() < deadline) {
    if (signal.aborted) {
      throw new Error("Request aborted");
    }
    const res = await fetch(`${baseUrl}/v1/tasks/${encodeURIComponent(taskId)}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal,
      cache: "no-store",
    });

    if (res.status === 404) {
      return { status: "failed", error_message: "Slice task not found." };
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        text ? `Slicer status HTTP ${res.status}: ${text.slice(0, 200)}` : `Slicer status HTTP ${res.status}`,
      );
    }

    const body = (await res.json()) as DocStyleTaskResponse;
    const st = body.status;

    if (st === "succeeded") {
      return body;
    }
    if (st === "failed") {
      return body;
    }

    await sleep(POLL_INTERVAL_MS);
  }

  return { status: "failed", error_message: "Slicer timed out waiting for results." };
}

export async function POST(request: Request) {
  const baseUrl = getSlicerApiBaseUrl();
  if (!baseUrl) {
    return NextResponse.json(
      {
        ok: false,
        code: "SLICER_NOT_CONFIGURED",
        error: "SLICER_API_BASE_URL is not set. Add it to the server environment.",
      },
      { status: 503 },
    );
  }

  const controller = new AbortController();
  const signal = controller.signal;
  request.signal.addEventListener("abort", () => controller.abort());

  let form: FormData;
  try {
    form = await request.formData();
  } catch (err) {
    console.error("[api/slicer] formData failed:", err);
    return NextResponse.json(
      {
        ok: false,
        code: "BAD_REQUEST",
        error:
          "Could not parse multipart upload. Send the STL as form field \"file\". " +
          "If the file is large, ensure next.config.ts sets experimental.middlewareClientMaxBodySize " +
          "above the default 10 MB (see Next.js docs for middlewareClientMaxBodySize).",
      },
      { status: 400 },
    );
  }

  const entry = form.get("file");
  if (!(entry instanceof File) || entry.size === 0) {
    return NextResponse.json(
      { ok: false, code: "MISSING_FILE", error: "Attach a non-empty STL file as field \"file\"." },
      { status: 400 },
    );
  }

  if (entry.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { ok: false, code: "FILE_TOO_LARGE", error: `File exceeds ${MAX_UPLOAD_BYTES} bytes.` },
      { status: 413 },
    );
  }

  const name = entry.name.toLowerCase();
  if (!name.endsWith(".stl")) {
    return NextResponse.json(
      { ok: false, code: "INVALID_TYPE", error: "Only .stl files are supported." },
      { status: 400 },
    );
  }

  let stlBytes: Buffer;
  try {
    stlBytes = Buffer.from(await entry.arrayBuffer());
  } catch {
    return NextResponse.json(
      { ok: false, code: "READ_FAILED", error: "Could not read uploaded file." },
      { status: 400 },
    );
  }

  const quoteAssetId = randomUUID();
  const datePrefix = utcDatePrefixForStorage();
  const stlStoragePath = buildQuoteStlObjectPath(quoteAssetId, datePrefix);
  const previewStoragePath = buildQuotePreviewObjectPath(quoteAssetId);

  let stl_storage_path: string | null = null;
  let preview_image_url: string | null = null;
  const storage = { stl_saved: false, preview_saved: false };

  if (!createSupabaseServiceRoleClient()) {
    console.warn("[api/slicer] skip STL storage: SUPABASE_SERVICE_ROLE_KEY / URL not configured");
  } else {
    const stlRes = await uploadQuoteStlToStorage(stlBytes, stlStoragePath);
    if (stlRes.ok) {
      storage.stl_saved = true;
      stl_storage_path = stlStoragePath;
    } else {
      console.error("[api/slicer] STL storage upload failed:", stlRes.message);
    }
  }

  const outbound = new FormData();
  outbound.set(
    "file",
    new File([new Uint8Array(stlBytes)], entry.name, { type: entry.type || "model/stl" }),
  );

  let sliceRes: Response;
  try {
    sliceRes = await fetch(`${baseUrl}/v1/slice`, {
      method: "POST",
      body: outbound,
      signal,
      cache: "no-store",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error";
    const down =
      message.includes("fetch failed") ||
      message.includes("ECONNREFUSED") ||
      message.includes("ENOTFOUND") ||
      message.includes("aborted");
    return NextResponse.json(
      {
        ok: false,
        code: down ? "SLICER_UNAVAILABLE" : "SLICER_NETWORK_ERROR",
        error: down
          ? "Cannot reach the slicer service. Is it running and is SLICER_API_BASE_URL correct? " +
            "For `online_slicer` docker-compose, use host port 8888, e.g. http://127.0.0.1:8888 (dev) " +
            "or http://host.docker.internal:8888 from the Next.js container."
          : message,
      },
      { status: 503 },
    );
  }

  if (sliceRes.status === 503) {
    return NextResponse.json(
      { ok: false, code: "SLICER_BUSY", error: "Slicer queue is full or in maintenance." },
      { status: 503 },
    );
  }

  if (!sliceRes.ok) {
    const text = await sliceRes.text().catch(() => "");
    return NextResponse.json(
      {
        ok: false,
        code: "SLICER_REJECTED",
        error: text ? text.slice(0, 500) : `Slicer returned HTTP ${sliceRes.status}`,
      },
      { status: sliceRes.status >= 400 && sliceRes.status < 600 ? sliceRes.status : 502 },
    );
  }

  let sliceJson: unknown;
  try {
    sliceJson = await sliceRes.json();
  } catch {
    return NextResponse.json(
      { ok: false, code: "SLICER_BAD_RESPONSE", error: "Slicer returned invalid JSON for slice accept." },
      { status: 502 },
    );
  }

  const na = sliceJson as SliceEnqueueNa;
  const doc = sliceJson as SliceEnqueueDoc;
  const jobId = typeof na.job_id === "string" && na.job_id ? na.job_id : null;
  const docTaskId = typeof doc.task_id === "string" && doc.task_id ? doc.task_id : null;

  const skipPreview = parseFormBool(form.get("skip_preview"));
  const quoteMaterial = parseQuoteMaterialFromForm(form);
  const rawScale = form.get("uniform_scale");
  let uniformScale = MODEL_SCALE_DEFAULT;
  if (rawScale != null && String(rawScale).trim() !== "") {
    const n = Number.parseFloat(String(rawScale));
    if (Number.isFinite(n)) uniformScale = clampUniformModelScale(n);
  }

  let filenameOut = entry.name;
  let filament_used_mm = 0;
  let estimated_print_time = "";
  let model_dimensions = { x_mm: 0, y_mm: 0, z_mm: 0 };
  let publicTaskId: string;
  let preview_image: string | null = null;
  let preview_pending = false;
  let preview_error: string | null = null;

  const thumbPromise =
    !skipPreview && (jobId || docTaskId)
      ? generateThumbnailFromStlBuffer(stlBytes, { signal })
      : null;

  if (jobId) {
    publicTaskId = jobId;
    let job: NaJobStatusResponse;
    try {
      job = await pollNaSlicerUntilDone(baseUrl, jobId, signal);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Network error";
      return NextResponse.json(
        { ok: false, code: "SLICER_POLL_FAILED", error: message },
        { status: 503 },
      );
    }

    if (job.status !== "completed" || !job.metadata) {
      return NextResponse.json(
        {
          ok: false,
          code: "SLICE_FAILED",
          error: job.error ?? "Slicing did not complete successfully.",
          task_id: jobId,
        },
        { status: 422 },
      );
    }

    const meta = job.metadata;
    filenameOut = meta.filename ?? entry.name;
    filament_used_mm = Number(meta.filament_used_mm ?? 0);
    estimated_print_time = meta.estimated_print_time ?? "";
    const dims = meta.model_dimensions ?? {};
    model_dimensions = {
      x_mm: Number(dims.x_mm ?? 0),
      y_mm: Number(dims.y_mm ?? 0),
      z_mm: Number(dims.z_mm ?? 0),
    };

    const thumb = thumbPromise ? await thumbPromise : { ok: false as const, reason: "skipped" };
    if (thumb.ok) {
      preview_image = thumb.dataUrl;
    } else {
      preview_image = null;
      preview_error = thumb.reason.length > 280 ? `${thumb.reason.slice(0, 280)}…` : thumb.reason;
      if (preview_error) {
        console.warn("[api/slicer] thumbnail:", preview_error);
      }
    }
    preview_pending = false;
  } else if (docTaskId) {
    publicTaskId = docTaskId;
    let task: DocStyleTaskResponse;
    try {
      task = await pollDocStyleUntilDone(baseUrl, docTaskId, signal);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Network error";
      return NextResponse.json(
        { ok: false, code: "SLICER_POLL_FAILED", error: message },
        { status: 503 },
      );
    }

    if (task.status !== "succeeded" || !task.metadata) {
      return NextResponse.json(
        {
          ok: false,
          code: "SLICE_FAILED",
          error: task.error_message ?? "Slicing did not complete successfully.",
          task_id: docTaskId,
        },
        { status: 422 },
      );
    }

    const meta = task.metadata;
    filenameOut = task.filename ?? entry.name;
    filament_used_mm = Number(meta.filament_used_mm ?? 0);
    estimated_print_time = meta.estimated_print_time ?? "";
    const dims = meta.model_dimensions ?? {};
    model_dimensions = {
      x_mm: Number(dims.x_mm ?? 0),
      y_mm: Number(dims.y_mm ?? 0),
      z_mm: Number(dims.z_mm ?? 0),
    };

    const thumb = thumbPromise ? await thumbPromise : { ok: false as const, reason: "skipped" };
    if (thumb.ok) {
      preview_image = thumb.dataUrl;
    } else {
      preview_image = null;
      preview_error = thumb.reason.length > 280 ? `${thumb.reason.slice(0, 280)}…` : thumb.reason;
      if (preview_error) {
        console.warn("[api/slicer] thumbnail:", preview_error);
      }
    }
    preview_pending = false;
  } else {
    return NextResponse.json(
      {
        ok: false,
        code: "SLICER_BAD_RESPONSE",
        error: "Slicer slice response missing job_id and task_id.",
      },
      { status: 502 },
    );
  }

  const scaledMeta = applyUniformScaleToSlicerMetadata(
    {
      filament_used_mm,
      estimated_print_time,
      model_dimensions,
    },
    uniformScale,
  );
  filament_used_mm = scaledMeta.filament_used_mm;
  estimated_print_time = scaledMeta.estimated_print_time;
  model_dimensions = scaledMeta.model_dimensions;

  const preview_image_alt = quoteStlPreviewImageAlt(filenameOut, quoteMaterial);

  if (preview_image?.startsWith("data:")) {
    if (!createSupabaseServiceRoleClient()) {
      console.warn("[api/slicer] skip preview storage: SUPABASE_SERVICE_ROLE_KEY / URL not configured");
    } else {
      const pngBuf = dataUrlToBuffer(preview_image);
      if (pngBuf) {
        const pr = await uploadQuotePreviewPngToStorage(pngBuf, previewStoragePath);
        if (pr.ok) {
          storage.preview_saved = true;
          preview_image_url = pr.publicUrl;
        } else {
          console.error("[api/slicer] preview storage upload failed:", pr.message);
        }
      }
    }
  }

  return NextResponse.json({
    ok: true,
    task_id: publicTaskId,
    quote_asset_id: quoteAssetId,
    filename: filenameOut,
    filament_used_mm,
    estimated_print_time,
    model_dimensions,
    preview_image,
    preview_image_alt,
    preview_image_url,
    stl_storage_path,
    storage,
    preview_error,
    preview_pending,
    uniform_scale: uniformScale,
    skip_preview: skipPreview,
  });
}
