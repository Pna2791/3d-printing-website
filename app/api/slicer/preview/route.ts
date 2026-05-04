import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Legacy endpoint: previews are generated locally and returned inline from `POST /api/slicer`.
 * Kept so old clients receive a stable response instead of proxying the slicer.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get("task_id")?.trim() ?? "";
  if (!taskId) {
    return NextResponse.json(
      { ok: false, code: "MISSING_TASK_ID", error: "Query parameter task_id is required." },
      { status: 400 },
    );
  }

  return NextResponse.json(
    {
      ok: false,
      code: "PREVIEW_INLINE_ONLY",
      error:
        "Preview images are included in the JSON body of POST /api/slicer. " +
        "This route no longer fetches previews from the slicer service.",
    },
    { status: 404 },
  );
}
