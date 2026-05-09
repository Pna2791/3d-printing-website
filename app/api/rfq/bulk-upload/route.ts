import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { parseNaLocaleHeader, type NaLocale } from "@/lib/quote-paths";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service";
import { utcDatePrefixForStorage } from "@/lib/supabase/quoteSliceAssets";

export const runtime = "nodejs";

const MAX_FILES = 5;
const ALLOWED_EXTENSIONS = /\.(stl|stp|step|pdf|png|jpg|jpeg|zip)$/i;

function sanitizeSegment(name: string): string {
  return name.replace(/[^\w.-]+/g, "_").slice(0, 180) || "file";
}

function bulkErr(locale: NaLocale, vi: string, en: string): { error: string } {
  return { error: locale === "en" ? en : vi };
}

/** POST multipart: contact_name, email, phone?, company?, quantity_estimate, technical_requirements, file0..fileN */
export async function POST(request: Request) {
  const locale = parseNaLocaleHeader(request);

  const admin = createSupabaseServiceRoleClient();
  if (!admin) {
    return NextResponse.json(
      {
        ok: false,
        ...bulkErr(
          locale,
          "Thiếu SUPABASE_SERVICE_ROLE_KEY trên máy chủ.",
          "SUPABASE_SERVICE_ROLE_KEY is not configured on this server.",
        ),
      },
      { status: 503 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        ...bulkErr(locale, "Dữ liệu form không hợp lệ.", "Invalid multipart form data."),
      },
      { status: 400 },
    );
  }

  const contactName = String(form.get("contact_name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const phone = String(form.get("phone") ?? "").trim();
  const company = String(form.get("company") ?? "").trim();
  const qtyRaw = form.get("quantity_estimate");
  const qty = typeof qtyRaw === "string" ? Number.parseInt(qtyRaw, 10) : Number(qtyRaw);
  const technicalRequirements = String(form.get("technical_requirements") ?? "").trim();

  if (!contactName || contactName.length > 160) {
    return NextResponse.json(
      {
        ok: false,
        ...bulkErr(
          locale,
          "Tên người liên hệ không hợp lệ.",
          "Please enter a valid contact name (max 160 characters).",
        ),
      },
      { status: 400 },
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) {
    return NextResponse.json(
      {
        ok: false,
        ...bulkErr(locale, "Email không hợp lệ.", "Please enter a valid email."),
      },
      { status: 400 },
    );
  }
  if (!Number.isFinite(qty) || qty <= 500 || qty > 999_999) {
    return NextResponse.json(
      {
        ok: false,
        ...bulkErr(locale, "Số lượng phải lớn hơn 500.", "Estimated quantity must be greater than 500."),
      },
      { status: 400 },
    );
  }

  const fileEntries = form
    .getAll("attachments")
    .filter((x): x is File => typeof x !== "string" && "arrayBuffer" in x);

  if (fileEntries.length > MAX_FILES) {
    return NextResponse.json(
      {
        ok: false,
        ...bulkErr(
          locale,
          `Quá nhiều file (tối đa ${MAX_FILES}).`,
          `Too many files attached (maximum ${MAX_FILES}).`,
        ),
      },
      { status: 400 },
    );
  }

  const datePrefix = utcDatePrefixForStorage();
  const attachmentPaths: string[] = [];

  for (const file of fileEntries) {
    const name = typeof file.name === "string" ? file.name : "upload";
    if (!ALLOWED_EXTENSIONS.test(name)) {
      return NextResponse.json(
        {
          ok: false,
          ...bulkErr(
            locale,
            `Định dạng file không được hỗ trợ: ${name}`,
            `Unsupported file extension: ${name}`,
          ),
        },
        { status: 400 },
      );
    }
    const buf = Buffer.from(await file.arrayBuffer());
    if (buf.length === 0) continue;
    if (buf.length > 15 * 1024 * 1024) {
      return NextResponse.json(
        {
          ok: false,
          ...bulkErr(
            locale,
            `File quá lớn (>15 MB): ${name}`,
            `File too large (>15 MB): ${name}`,
          ),
        },
        { status: 400 },
      );
    }

    const id = randomUUID();
    const objectPath = `rfq/${datePrefix}/${id}_${sanitizeSegment(name)}`;

    const { error: uploadError } = await admin.storage.from("rfq-files").upload(objectPath, buf, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
    if (uploadError) {
      return NextResponse.json({ ok: false, error: uploadError.message }, { status: 502 });
    }
    attachmentPaths.push(objectPath);
  }

  const { error: insertError } = await admin.from("bulk_rfq_requests").insert({
    contact_name: contactName,
    email,
    phone,
    company,
    quantity_estimate: qty,
    technical_requirements: technicalRequirements.slice(0, 12000),
    attachment_paths: attachmentPaths,
  });

  if (insertError) {
    return NextResponse.json({ ok: false, error: insertError.message }, { status: 502 });
  }

  return NextResponse.json({
    ok: true,
    attachments: attachmentPaths.length,
    message:
      locale === "en"
        ? "Received — NA 3D SHOP engineering will reply within 1–2 business days."
        : "Đã nhận — xưởng sẽ phản hồi trong 1–2 ngày làm việc.",
  });
}
