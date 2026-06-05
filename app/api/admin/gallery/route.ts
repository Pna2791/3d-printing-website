import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/admin/require-admin-session";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

const BUCKET = "gallery";
const MAX_BYTES = 6 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function sanitizeFilename(name: string): string {
  const trimmed = name.trim() || "upload";
  const noPath = trimmed.replace(/^.*[/\\]/, "");
  const safe = noPath.replace(/[^\w.\-]+/g, "_");
  return safe.slice(0, 120) || "image";
}

export async function POST(request: Request) {
  const auth = await requireAdminSession();
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.message, code: auth.code }, { status: auth.status });
  }

  const admin = createSupabaseServiceRoleClient();
  if (!admin) {
    return NextResponse.json(
      { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY is missing.", code: "SERVER_CONFIG" },
      { status: 503 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid form data." }, { status: 400 });
  }

  const titleField = form.get("title");
  const title = typeof titleField === "string" ? titleField.trim() : "";
  const descField = form.get("description");
  const descriptionRaw = typeof descField === "string" ? descField.trim() : "";
  const otherField = form.get("category_other");
  const categoryOther = typeof otherField === "string" ? otherField.trim() : "";
  const catField = form.get("category");
  let category = typeof catField === "string" ? catField.trim() : "";
  if (category === "Other") {
    if (!categoryOther) {
      return NextResponse.json(
        { ok: false, error: "Enter a custom category when “Other” is selected." },
        { status: 400 },
      );
    }
    category = categoryOther;
  }
  if (!title) {
    return NextResponse.json({ ok: false, error: "Title is required." }, { status: 400 });
  }
  if (!category) {
    return NextResponse.json({ ok: false, error: "Category is required." }, { status: 400 });
  }

  const file = form.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ ok: false, error: "Image file is required." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ ok: false, error: "Image must be 6 MB or smaller." }, { status: 400 });
  }
  const mime = file.type || "application/octet-stream";
  if (!ALLOWED_TYPES.has(mime)) {
    return NextResponse.json(
      { ok: false, error: "Allowed types: JPEG, PNG, WebP, GIF." },
      { status: 400 },
    );
  }

  const id = randomUUID();
  const segment = sanitizeFilename(file.name);
  const storagePath = `${id}/${segment}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: upErr } = await admin.storage.from(BUCKET).upload(storagePath, buffer, {
    contentType: mime,
    cacheControl: "3600",
    upsert: false,
  });

  if (upErr) {
    console.error("[admin/gallery] upload:", upErr.message);
    return NextResponse.json(
      { ok: false, error: upErr.message || "Upload failed. Ensure Storage bucket 'gallery' exists and is public." },
      { status: 500 },
    );
  }

  const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(storagePath);
  const imageUrl = pub.publicUrl;

  const { data: inserted, error: insErr } = await admin
    .from("printed_products")
    .insert({
      id,
      title,
      description: descriptionRaw,
      image_url: imageUrl,
      category,
      storage_path: storagePath,
    })
    .select("id, title, description, image_url, category, created_at")
    .single();

  if (insErr) {
    await admin.storage.from(BUCKET).remove([storagePath]).catch(() => {});
    console.error("[admin/gallery] insert:", insErr.message);
    return NextResponse.json({ ok: false, error: insErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, item: inserted });
}

export async function DELETE(request: Request) {
  const auth = await requireAdminSession();
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.message, code: auth.code }, { status: auth.status });
  }

  const admin = createSupabaseServiceRoleClient();
  if (!admin) {
    return NextResponse.json(
      { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY is missing.", code: "SERVER_CONFIG" },
      { status: 503 },
    );
  }

  const id = new URL(request.url).searchParams.get("id")?.trim() ?? "";
  const uuidRe =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRe.test(id)) {
    return NextResponse.json({ ok: false, error: "Invalid id." }, { status: 400 });
  }

  const { data: row, error: fetchErr } = await admin
    .from("printed_products")
    .select("id, storage_path")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr || !row) {
    return NextResponse.json({ ok: false, error: "Record not found." }, { status: 404 });
  }

  const path = row.storage_path;

  const { error: delErr } = await admin.from("printed_products").delete().eq("id", id);
  if (delErr) {
    console.error("[admin/gallery] delete row:", delErr.message);
    return NextResponse.json({ ok: false, error: delErr.message }, { status: 500 });
  }

  const { error: rmErr } = await admin.storage.from(BUCKET).remove([path]);
  if (rmErr) {
    console.error("[admin/gallery] storage remove (row already deleted):", rmErr.message);
  }

  return NextResponse.json({ ok: true });
}
