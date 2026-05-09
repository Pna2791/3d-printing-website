"use client";

import { useCallback, useEffect, useId, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";

export type GalleryRow = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  category: string;
  created_at: string;
};

const CATEGORIES = ["General", "Miniatures", "Functional", "Art", "Props", "Other"] as const;

type GalleryAdminClientProps = {
  configured: boolean;
  loadError: string | null;
  initialRows: GalleryRow[];
};

export function GalleryAdminClient({ configured, loadError, initialRows }: GalleryAdminClientProps) {
  const router = useRouter();
  const formId = useId();
  const [rows, setRows] = useState<GalleryRow[]>(initialRows);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [categoryOther, setCategoryOther] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ kind: "ok" | "err"; message: string } | null>(null);

  const showToast = useCallback((kind: "ok" | "err", message: string) => {
    setToast({ kind, message });
  }, []);

  useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 4500);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onDrop = useCallback((accepted: File[]) => {
    const f = accepted[0];
    if (f) setFile(f);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif"] },
    maxFiles: 1,
    multiple: false,
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!configured || !file) {
      showToast("err", file ? "Storage is not configured." : "Choose an image.");
      return;
    }

    if (category === "Other" && !categoryOther.trim()) {
      showToast("err", "Enter a custom category.");
      return;
    }

    const form = new FormData();
    form.append("title", title.trim());
    form.append("description", description.trim());
    form.append("category", category);
    if (category === "Other") {
      form.append("category_other", categoryOther.trim());
    }
    form.append("image", file);

    setUploading(true);
    try {
      const res = await fetch("/api/admin/gallery", { method: "POST", body: form });
      const data = (await res.json()) as { ok?: boolean; error?: string; item?: GalleryRow };
      if (!res.ok || !data.ok || !data.item) {
        showToast("err", data.error ?? `Upload failed (${res.status})`);
        return;
      }
      setRows((prev) => [data.item!, ...prev]);
      setTitle("");
      setDescription("");
      setCategory(CATEGORIES[0]);
      setCategoryOther("");
      setFile(null);
      showToast("ok", "Image uploaded and saved.");
      router.refresh();
    } catch {
      showToast("err", "Network error.");
    } finally {
      setUploading(false);
    }
  }

  async function onDelete(id: string) {
    if (!window.confirm("Delete this item from the gallery and storage?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/gallery?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        showToast("err", data.error ?? "Delete failed.");
        return;
      }
      setRows((prev) => prev.filter((r) => r.id !== id));
      showToast("ok", "Deleted.");
      router.refresh();
    } catch {
      showToast("err", "Network error.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-10">
      {toast ? (
        <div
          role="status"
          className={
            toast.kind === "ok"
              ? "fixed bottom-6 right-6 z-[300] max-w-sm rounded-xl border border-emerald-500/40 bg-emerald-950 px-4 py-3 text-sm text-emerald-50 shadow-lg"
              : "fixed bottom-6 right-6 z-[300] max-w-sm rounded-xl border border-red-500/40 bg-red-950 px-4 py-3 text-sm text-red-50 shadow-lg"
          }
        >
          {toast.message}
        </div>
      ) : null}

      {loadError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100">
          {loadError}
        </div>
      ) : null}

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          <Upload className="size-5 text-emerald-600 dark:text-emerald-400" aria-hidden />
          Upload
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Files go to Storage bucket <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800">gallery</code>{" "}
          (public). Max 6 MB — JPEG, PNG, WebP, GIF.
        </p>

        <form id={formId} onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2 sm:col-span-2">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Title</span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={200}
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none ring-emerald-500/30 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50"
                placeholder="Model name"
              />
            </label>
            <label className="block space-y-2 sm:col-span-2">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Description</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                maxLength={2000}
                className="w-full resize-y rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none ring-emerald-500/30 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50"
                placeholder="Short caption (optional)"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Category</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none ring-emerald-500/30 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            {category === "Other" ? (
              <label className="block space-y-2">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Custom category</span>
                <input
                  type="text"
                  value={categoryOther}
                  onChange={(e) => setCategoryOther(e.target.value)}
                  maxLength={80}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none ring-emerald-500/30 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50"
                  placeholder="Enter category"
                />
              </label>
            ) : null}
          </div>

          <div
            {...getRootProps()}
            className={`flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 transition ${
              isDragActive
                ? "border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/20"
                : "border-zinc-300 bg-zinc-50/50 dark:border-zinc-600 dark:bg-zinc-800/40"
            }`}
          >
            <input {...getInputProps()} />
            <ImagePlus className="size-10 text-zinc-400" aria-hidden />
            <p className="mt-2 text-center text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {isDragActive ? "Drop image here" : "Drag an image here, or click to choose"}
            </p>
            <p className="mt-1 text-xs text-zinc-500">One file · Images only</p>
          </div>

          {previewUrl && file ? (
            <div className="flex items-start gap-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
              {/* eslint-disable-next-line @next/next/no-img-element -- blob preview */}
              <img src={previewUrl} alt="" className="size-24 shrink-0 rounded-lg object-cover" />
              <div className="min-w-0 text-sm text-zinc-600 dark:text-zinc-400">
                <p className="font-medium text-zinc-900 dark:text-zinc-100">{file.name}</p>
                <p className="tabular-nums">{(file.size / 1024).toFixed(1)} KB</p>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="mt-2 text-xs font-semibold text-red-600 hover:underline dark:text-red-400"
                >
                  Remove file
                </button>
              </div>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={!configured || uploading || !file || !title.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            {uploading ? "Uploading…" : "Upload & publish"}
          </button>
        </form>
      </section>

      <section>
        <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Gallery ({rows.length})
        </h2>
        {rows.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-zinc-300 px-6 py-12 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            No items yet. Upload above to populate the landing page carousel.
          </p>
        ) : (
          <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((row) => (
              <li
                key={row.id}
                className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="relative aspect-[4/3] w-full bg-zinc-100 dark:bg-zinc-800">
                  <Image
                    src={row.image_url}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="space-y-1 p-4">
                  <p className="line-clamp-2 font-semibold text-zinc-900 dark:text-zinc-50">{row.title}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{row.category}</p>
                  <button
                    type="button"
                    onClick={() => onDelete(row.id)}
                    disabled={deletingId === row.id}
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-300 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60 dark:border-red-900/50 dark:text-red-300 dark:hover:bg-red-950/40"
                  >
                    {deletingId === row.id ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                    ) : (
                      <Trash2 className="size-4" aria-hidden />
                    )}
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
