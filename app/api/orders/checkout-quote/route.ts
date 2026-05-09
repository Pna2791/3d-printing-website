import { NextResponse } from "next/server";

import { FEATURES } from "@/lib/config";
import { getPublicSupabaseConfig } from "@/lib/env";
import { clampUniformModelScale, estimateCostFromSlicer, QUOTE_MATERIAL_OPTIONS, type SupportedMaterial } from "@/lib/pricing";
import { quoteMoneyFromUnitLineVnd, QUOTE_CHECKOUT_MAX_QTY } from "@/lib/quote-checkout-totals";
import {
  buildQuotePreviewObjectPath,
  buildQuoteStlObjectPath,
} from "@/lib/supabase/quoteSliceAssets";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service";
import { parseNaLocaleHeader, type NaLocale } from "@/lib/quote-paths";
import {
  validateCustomerName,
  validateOrderNotes,
  type ValidationLocale,
  validateVietnamesePhone,
} from "@/lib/validation";

function txt(locale: NaLocale, vi: string, en: string): string {
  return locale === "en" ? en : vi;
}

export const runtime = "nodejs";

const MAX_QTY = QUOTE_CHECKOUT_MAX_QTY;
const TASK_ID_MAX = 240;
const FILENAME_MAX = 255;

type CheckoutBody = {
  customer_name?: unknown;
  customer_phone?: unknown;
  customer_note?: unknown;
  slicer_task_id?: unknown;
  filename?: unknown;
  material?: unknown;
  is_student?: unknown;
  quantity?: unknown;
  model_scale?: unknown;
  model_dimensions?: unknown;
  filament_used_mm?: unknown;
  estimated_print_time?: unknown;
  total_vnd?: unknown;
  quote_asset_id?: unknown;
  stl_storage_path?: unknown;
  preview_image_url?: unknown;
};

const QUOTE_ASSET_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const STL_STORAGE_PATH_RE =
  /^uploads\/(\d{4}-\d{2}-\d{2})\/([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})\.stl$/i;

function parseQuoteStoragePayload(
  body: CheckoutBody,
  supabaseProjectUrl: string,
  locale: NaLocale,
):
  | { ok: true; skip: true }
  | {
      ok: true;
      skip: false;
      quote_asset_id: string;
      stl_storage_path: string;
      preview_image_url: string | null;
    }
  | { ok: false; message: string } {
  const rawId = typeof body.quote_asset_id === "string" ? body.quote_asset_id.trim() : "";
  const rawStl = typeof body.stl_storage_path === "string" ? body.stl_storage_path.trim() : "";
  const rawPrevRaw = body.preview_image_url;
  const rawPrev =
    typeof rawPrevRaw === "string"
      ? rawPrevRaw.trim()
      : rawPrevRaw === null
        ? ""
        : "";

  const hasId = rawId.length > 0;
  const hasStl = rawStl.length > 0;
  const hasPrev = rawPrev.length > 0;

  if (!hasId && !hasStl && !hasPrev) return { ok: true, skip: true };
  if (hasPrev && (!hasId || !hasStl)) {
    return {
      ok: false,
      message: txt(
        locale,
        "Có preview_image_url thì phải gửi kèm quote_asset_id và stl_storage_path hợp lệ.",
        "When preview_image_url is provided, quote_asset_id and stl_storage_path must also be valid.",
      ),
    };
  }
  if (hasId !== hasStl) {
    return {
      ok: false,
      message: txt(
        locale,
        "quote_asset_id và stl_storage_path phải gửi cùng nhau.",
        "quote_asset_id and stl_storage_path must be sent together.",
      ),
    };
  }
  if (!QUOTE_ASSET_UUID_RE.test(rawId)) {
    return {
      ok: false,
      message: txt(locale, "Mã tài sản báo giá (quote_asset_id) không hợp lệ.", "Invalid quote_asset_id."),
    };
  }
  const sm = STL_STORAGE_PATH_RE.exec(rawStl);
  if (!sm) {
    return {
      ok: false,
      message: txt(locale, "Đường dẫn STL lưu trữ không hợp lệ.", "Invalid STL storage path."),
    };
  }
  const [, datePart, uuidInPath] = sm;
  if (uuidInPath.toLowerCase() !== rawId.toLowerCase()) {
    return {
      ok: false,
      message: txt(locale, "Đường dẫn STL không khớp mã tài sản.", "STL path does not match the asset ID."),
    };
  }
  if (buildQuoteStlObjectPath(rawId, datePart) !== rawStl) {
    return {
      ok: false,
      message: txt(locale, "Đường dẫn STL không đúng định dạng chuẩn.", "STL path does not match the expected layout."),
    };
  }

  let previewOut: string | null = null;
  if (hasPrev) {
    const baseUrl = supabaseProjectUrl.trim().replace(/\/+$/, "");
    if (!baseUrl) {
      return {
        ok: false,
        message: txt(
          locale,
          "Máy chủ chưa cấu hình NEXT_PUBLIC_SUPABASE_URL — không xác minh được URL preview.",
          "NEXT_PUBLIC_SUPABASE_URL is missing — preview URL cannot be verified.",
        ),
      };
    }
    let base: URL;
    try {
      base = new URL(baseUrl);
    } catch {
      return {
        ok: false,
        message: txt(locale, "NEXT_PUBLIC_SUPABASE_URL không hợp lệ.", "NEXT_PUBLIC_SUPABASE_URL is invalid."),
      };
    }
    let prevUrl: URL;
    try {
      prevUrl = new URL(rawPrev);
    } catch {
      return {
        ok: false,
        message: txt(locale, "URL ảnh xem trước không hợp lệ.", "Preview image URL is invalid."),
      };
    }
    const expectedPath = `/storage/v1/object/public/model-previews/${buildQuotePreviewObjectPath(rawId)}`;
    if (prevUrl.origin !== base.origin || prevUrl.pathname !== expectedPath) {
      return {
        ok: false,
        message: txt(
          locale,
          "URL ảnh xem trước không khớp dự án Supabase hoặc mã tài sản.",
          "Preview URL must belong to this Supabase project and asset ID.",
        ),
      };
    }
    previewOut = rawPrev;
  }

  return {
    ok: true,
    skip: false,
    quote_asset_id: rawId,
    stl_storage_path: rawStl,
    preview_image_url: previewOut,
  };
}

function parseDimensions(v: unknown): { x_mm: number; y_mm: number; z_mm: number } | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  const x = Number(o.x_mm);
  const y = Number(o.y_mm);
  const z = Number(o.z_mm);
  if (![x, y, z].every((n) => Number.isFinite(n))) return null;
  return { x_mm: x, y_mm: y, z_mm: z };
}

function parseMaterial(v: unknown): SupportedMaterial | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  return QUOTE_MATERIAL_OPTIONS.includes(s as SupportedMaterial) ? (s as SupportedMaterial) : null;
}

export async function POST(request: Request) {
  const locale = parseNaLocaleHeader(request);
  const validationLocale: ValidationLocale = locale;

  if (!FEATURES.QUOTE_CHECKOUT_ENABLED) {
    return NextResponse.json(
      {
        ok: false,
        error: txt(
          locale,
          "Đặt in từ báo giá đang tắt (QUOTE_CHECKOUT_ENABLED).",
          "Checkout from the quote flow is disabled (QUOTE_CHECKOUT_ENABLED).",
        ),
      },
      { status: 403 },
    );
  }

  // Service-role Supabase client bypasses RLS; `quote_checkout_requests` has no INSERT for anon/authenticated.
  const admin = createSupabaseServiceRoleClient();
  if (!admin) {
    return NextResponse.json(
      {
        ok: false,
        error: txt(
          locale,
          "Máy chủ chưa cấu hình SUPABASE_SERVICE_ROLE_KEY — không thể lưu đơn.",
          "SUPABASE_SERVICE_ROLE_KEY is missing — cannot persist the order.",
        ),
        code: "SERVER_CONFIG",
      },
      { status: 503 },
    );
  }

  let body: CheckoutBody;
  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: txt(locale, "JSON không hợp lệ.", "Invalid JSON body.") },
      { status: 400 },
    );
  }

  const nameRes = validateCustomerName(
    typeof body.customer_name === "string" ? body.customer_name : "",
    validationLocale,
  );
  if (!nameRes.ok) {
    return NextResponse.json({ ok: false, error: nameRes.message }, { status: 400 });
  }

  const phoneRes = validateVietnamesePhone(
    typeof body.customer_phone === "string" ? body.customer_phone : "",
    validationLocale,
  );
  if (!phoneRes.ok) {
    return NextResponse.json({ ok: false, error: phoneRes.message }, { status: 400 });
  }

  const noteRes = validateOrderNotes(typeof body.customer_note === "string" ? body.customer_note : "", validationLocale);
  if (!noteRes.ok) {
    return NextResponse.json({ ok: false, error: noteRes.message }, { status: 400 });
  }

  const taskId =
    typeof body.slicer_task_id === "string" ? body.slicer_task_id.trim().slice(0, TASK_ID_MAX) : "";
  if (!taskId) {
    return NextResponse.json(
      {
        ok: false,
        error: txt(locale, "Thiếu mã tác vụ slice (slicer_task_id).", "Missing slicer_task_id."),
      },
      { status: 400 },
    );
  }

  const filename =
    typeof body.filename === "string" ? body.filename.trim().slice(0, FILENAME_MAX) : "";
  if (!filename) {
    return NextResponse.json(
      { ok: false, error: txt(locale, "Thiếu tên file.", "Filename is required.") },
      { status: 400 },
    );
  }

  const material = parseMaterial(body.material);
  if (!material) {
    return NextResponse.json(
      { ok: false, error: txt(locale, "Loại nhựa không hợp lệ.", "Unsupported material.") },
      { status: 400 },
    );
  }

  const isStudent = body.is_student === true;
  const qty = Number(body.quantity);
  if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
    return NextResponse.json(
      { ok: false, error: txt(locale, "Số lượng không hợp lệ.", "Quantity is invalid.") },
      { status: 400 },
    );
  }

  const scaleRaw = Number(body.model_scale);
  const model_scale = clampUniformModelScale(Number.isFinite(scaleRaw) ? scaleRaw : 1);
  const dims = parseDimensions(body.model_dimensions);
  if (!dims) {
    return NextResponse.json(
      { ok: false, error: txt(locale, "Kích thước mô hình không hợp lệ.", "Model dimensions are invalid.") },
      { status: 400 },
    );
  }

  const filament = Number(body.filament_used_mm);
  if (!Number.isFinite(filament) || filament < 0 || filament > 1e9) {
    return NextResponse.json(
      {
        ok: false,
        error: txt(locale, "Chiều dài filament không hợp lệ.", "Filament length is invalid."),
      },
      { status: 400 },
    );
  }

  const estimated_print_time =
    typeof body.estimated_print_time === "string"
      ? body.estimated_print_time.trim().slice(0, 120)
      : "";

  const clientTotal = Number(body.total_vnd);
  if (!Number.isInteger(clientTotal) || clientTotal < 0) {
    return NextResponse.json(
      { ok: false, error: txt(locale, "Tổng tiền không hợp lệ.", "Total amount is invalid.") },
      { status: 400 },
    );
  }

  const cost = estimateCostFromSlicer(filament, material, isStudent);
  // Same totals as the quote page / QuoteCheckoutModal preflight (`lib/quote-checkout-totals.ts`).
  const money = quoteMoneyFromUnitLineVnd(cost.totalVnd, qty, isStudent);
  const serverTotal = money.totalVnd;

  if (clientTotal !== serverTotal) {
    return NextResponse.json(
      {
        ok: false,
        error: txt(
          locale,
          "Giá đã thay đổi — vui lòng làm mới báo giá và thử lại.",
          "Pricing changed — refresh the quote and submit again.",
        ),
        code: "PRICE_MISMATCH",
      },
      { status: 409 },
    );
  }

  const pub = getPublicSupabaseConfig();
  const storagePayload = parseQuoteStoragePayload(body, pub?.url ?? "", locale);
  if (!storagePayload.ok) {
    return NextResponse.json({ ok: false, error: storagePayload.message }, { status: 400 });
  }

  const { data: inserted, error: insErr } = await admin
    .from("quote_checkout_requests")
    .insert({
      customer_name: nameRes.name,
      customer_phone: phoneRes.digits,
      customer_note: noteRes.note,
      slicer_task_id: taskId,
      filename,
      material,
      is_student: isStudent,
      student_id_verification_pending: isStudent,
      quantity: money.qty,
      model_scale,
      dim_x_mm: dims.x_mm,
      dim_y_mm: dims.y_mm,
      dim_z_mm: dims.z_mm,
      filament_used_mm: filament,
      estimated_print_time,
      total_vnd: serverTotal,
      line_subtotal_vnd: money.bulkAdjustedSubtotal,
      floor_applied: money.floorApplied,
      ...(storagePayload.skip
        ? {}
        : {
            quote_asset_id: storagePayload.quote_asset_id,
            stl_storage_path: storagePayload.stl_storage_path,
            preview_image_url: storagePayload.preview_image_url ?? null,
          }),
    })
    .select("id, created_at")
    .single();

  if (insErr) {
    const details = (insErr as { details?: string }).details ?? "";
    console.error("[checkout-quote] insert:", insErr.message, insErr.code, details);
    return NextResponse.json(
      {
        ok: false,
        error: txt(
          locale,
          "Không lưu được đơn. Kiểm tra migration bảng quote_checkout_requests.",
          "Unable to save the order — verify quote_checkout_requests migrations.",
        ),
        ...(insErr.code ? { error_code: String(insErr.code) } : {}),
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    id: inserted.id,
    created_at: inserted.created_at,
    phone_display: formatPhoneDisplay(phoneRes.digits),
  });
}

function formatPhoneDisplay(digits: string): string {
  if (digits.length !== 10) return digits;
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
}
