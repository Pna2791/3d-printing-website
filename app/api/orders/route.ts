import { NextResponse } from "next/server";

import { FEATURES } from "@/lib/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type OrderBody = {
  material_id?: unknown;
  printer_id?: unknown;
  quantity?: unknown;
  dim_x?: unknown;
  dim_y?: unknown;
  dim_z?: unknown;
};

function parseOptionalDim(v: unknown): number | null {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** FEATURE DISABLED: full POST handler kept for future use when `FEATURES.ORDER_ENABLED` is true. */
export async function POST(request: Request) {
  if (!FEATURES.ORDER_ENABLED) {
    console.info("[api/orders] POST blocked: public read-only mode (ORDER_ENABLED=false)");
    return NextResponse.json(
      { error: "Orders are disabled in public mode" },
      { status: 403 },
    );
  }

  return postOrderWhenEnabled(request);
}

async function postOrderWhenEnabled(request: Request) {
  let body: OrderBody;
  try {
    body = (await request.json()) as OrderBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const materialId =
    typeof body.material_id === "string" ? body.material_id.trim() : "";
  const printerId =
    typeof body.printer_id === "string" ? body.printer_id.trim() : "";
  const quantityRaw = body.quantity;

  if (!UUID_RE.test(materialId)) {
    return NextResponse.json(
      { ok: false, error: "material_id must be a valid UUID." },
      { status: 400 },
    );
  }
  if (!UUID_RE.test(printerId)) {
    return NextResponse.json(
      { ok: false, error: "printer_id must be a valid UUID." },
      { status: 400 },
    );
  }

  const quantity = Number(quantityRaw);
  if (!Number.isInteger(quantity) || quantity < 1) {
    return NextResponse.json(
      { ok: false, error: "quantity must be an integer ≥ 1." },
      { status: 400 },
    );
  }

  const dim_x = parseOptionalDim(body.dim_x);
  const dim_y = parseOptionalDim(body.dim_y);
  const dim_z = parseOptionalDim(body.dim_z);

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: "Server is missing Supabase configuration." },
      { status: 503 },
    );
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "You must be signed in to create an order (RLS requires an authenticated user).",
        code: "UNAUTHENTICATED",
      },
      { status: 401 },
    );
  }

  const { data: material, error: matErr } = await supabase
    .from("materials")
    .select("id, unit_price")
    .eq("id", materialId)
    .maybeSingle();

  if (matErr || !material) {
    return NextResponse.json(
      { ok: false, error: "Material not found or not accessible." },
      { status: 404 },
    );
  }

  const { data: printer, error: prErr } = await supabase
    .from("printers")
    .select("id")
    .eq("id", printerId)
    .maybeSingle();

  if (prErr || !printer) {
    return NextResponse.json(
      { ok: false, error: "Printer not found or not accessible." },
      { status: 404 },
    );
  }

  const unitPrice = Number(material.unit_price);
  if (!Number.isFinite(unitPrice) || unitPrice < 0) {
    return NextResponse.json(
      { ok: false, error: "Material has an invalid unit price." },
      { status: 500 },
    );
  }

  const total_price = unitPrice * quantity;

  const { data: inserted, error: insErr } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      material_id: materialId,
      printer_id: printerId,
      quantity,
      dim_x,
      dim_y,
      dim_z,
      total_price,
      status: "pending",
    })
    .select("id, status, total_price, created_at")
    .single();

  if (insErr) {
    return NextResponse.json(
      { ok: false, error: insErr.message, code: "INSERT_FAILED" },
      { status: 400 },
    );
  }

  return NextResponse.json({
    ok: true,
    order: inserted,
  });
}
