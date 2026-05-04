import { NextResponse } from "next/server";

import { FEATURES } from "@/lib/config";
import {
  applyMinimumOrderFloor,
  clampUniformModelScale,
  estimateCostFromSlicer,
  QUOTE_MATERIAL_OPTIONS,
  type SupportedMaterial,
} from "@/lib/pricing";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service";
import {
  validateCustomerName,
  validateOrderNotes,
  validateVietnamesePhone,
} from "@/lib/validation";

export const runtime = "nodejs";

const MAX_QTY = 9999;
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
};

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
  if (!FEATURES.QUOTE_CHECKOUT_ENABLED) {
    return NextResponse.json(
      { ok: false, error: "Đặt in từ báo giá đang tắt (QUOTE_CHECKOUT_ENABLED)." },
      { status: 403 },
    );
  }

  const admin = createSupabaseServiceRoleClient();
  if (!admin) {
    return NextResponse.json(
      {
        ok: false,
        error: "Máy chủ chưa cấu hình SUPABASE_SERVICE_ROLE_KEY — không thể lưu đơn.",
        code: "SERVER_CONFIG",
      },
      { status: 503 },
    );
  }

  let body: CheckoutBody;
  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ ok: false, error: "JSON không hợp lệ." }, { status: 400 });
  }

  const nameRes = validateCustomerName(typeof body.customer_name === "string" ? body.customer_name : "");
  if (!nameRes.ok) {
    return NextResponse.json({ ok: false, error: nameRes.message }, { status: 400 });
  }

  const phoneRes = validateVietnamesePhone(
    typeof body.customer_phone === "string" ? body.customer_phone : "",
  );
  if (!phoneRes.ok) {
    return NextResponse.json({ ok: false, error: phoneRes.message }, { status: 400 });
  }

  const noteRes = validateOrderNotes(typeof body.customer_note === "string" ? body.customer_note : "");
  if (!noteRes.ok) {
    return NextResponse.json({ ok: false, error: noteRes.message }, { status: 400 });
  }

  const taskId =
    typeof body.slicer_task_id === "string" ? body.slicer_task_id.trim().slice(0, TASK_ID_MAX) : "";
  if (!taskId) {
    return NextResponse.json({ ok: false, error: "Thiếu mã tác vụ slice (slicer_task_id)." }, { status: 400 });
  }

  const filename =
    typeof body.filename === "string" ? body.filename.trim().slice(0, FILENAME_MAX) : "";
  if (!filename) {
    return NextResponse.json({ ok: false, error: "Thiếu tên file." }, { status: 400 });
  }

  const material = parseMaterial(body.material);
  if (!material) {
    return NextResponse.json({ ok: false, error: "Loại nhựa không hợp lệ." }, { status: 400 });
  }

  const isStudent = body.is_student === true;
  const qty = Number(body.quantity);
  if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
    return NextResponse.json({ ok: false, error: "Số lượng không hợp lệ." }, { status: 400 });
  }

  const scaleRaw = Number(body.model_scale);
  const model_scale = clampUniformModelScale(Number.isFinite(scaleRaw) ? scaleRaw : 1);
  const dims = parseDimensions(body.model_dimensions);
  if (!dims) {
    return NextResponse.json({ ok: false, error: "Kích thước mô hình không hợp lệ." }, { status: 400 });
  }

  const filament = Number(body.filament_used_mm);
  if (!Number.isFinite(filament) || filament < 0 || filament > 1e9) {
    return NextResponse.json({ ok: false, error: "Chiều dài filament không hợp lệ." }, { status: 400 });
  }

  const estimated_print_time =
    typeof body.estimated_print_time === "string"
      ? body.estimated_print_time.trim().slice(0, 120)
      : "";

  const clientTotal = Number(body.total_vnd);
  if (!Number.isInteger(clientTotal) || clientTotal < 0) {
    return NextResponse.json({ ok: false, error: "Tổng tiền không hợp lệ." }, { status: 400 });
  }

  const cost = estimateCostFromSlicer(filament, material, isStudent);
  const lineSubtotal = Math.round(cost.totalVnd * qty);
  const floor = applyMinimumOrderFloor(lineSubtotal, isStudent);
  const serverTotal = floor.totalVnd;

  if (clientTotal !== serverTotal) {
    return NextResponse.json(
      {
        ok: false,
        error: "Giá đã thay đổi — vui lòng làm mới báo giá và thử lại.",
        code: "PRICE_MISMATCH",
      },
      { status: 409 },
    );
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
      quantity: qty,
      model_scale,
      dim_x_mm: dims.x_mm,
      dim_y_mm: dims.y_mm,
      dim_z_mm: dims.z_mm,
      filament_used_mm: filament,
      estimated_print_time,
      total_vnd: serverTotal,
      line_subtotal_vnd: lineSubtotal,
      floor_applied: floor.floorApplied,
    })
    .select("id, created_at")
    .single();

  if (insErr) {
    console.error("[checkout-quote] insert:", insErr.message);
    return NextResponse.json(
      { ok: false, error: "Không lưu được đơn. Kiểm tra migration bảng quote_checkout_requests." },
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
