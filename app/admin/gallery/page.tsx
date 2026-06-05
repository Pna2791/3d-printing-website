import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  ImageIcon,
  LayoutDashboard,
  LogOut,
} from "lucide-react";

import { GalleryAdminClient } from "@/components/admin/GalleryAdminClient";
import { listPrintedProductsAdmin } from "@/lib/gallery/printed-products";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  const { configured, rows, error } = await listPrintedProductsAdmin();

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-200">
              <Activity className="size-3.5" aria-hidden />
              Internal
            </p>
            <h1 className="mt-3 flex items-center gap-3 text-3xl font-semibold tracking-tight">
              <ImageIcon className="size-8 text-emerald-600 dark:text-emerald-400" aria-hidden />
              Printed gallery
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
              Manage images for the home “Printed models” section. Create a public Storage bucket named{" "}
              <code className="rounded bg-zinc-200 px-1 py-0.5 text-xs dark:bg-zinc-800">gallery</code> in Supabase,
              run the <code className="rounded bg-zinc-200 px-1 py-0.5 text-xs dark:bg-zinc-800">printed_products</code>{" "}
              migration, then upload here.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-white dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              <LayoutDashboard className="size-4" aria-hidden />
              Dashboard
            </Link>
            <form action="/api/admin/logout" method="post">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-white dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
              >
                <LogOut className="size-4" aria-hidden />
                Logout
              </button>
            </form>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-white dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              <ArrowLeft className="size-4" aria-hidden />
              Home
            </Link>
          </div>
        </div>

        {!configured ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
            <p className="font-medium">Supabase service role is not configured.</p>
            <p className="mt-2 text-sm opacity-90">
              Set <code className="rounded bg-amber-100/80 px-1 text-xs dark:bg-amber-900/50">SUPABASE_SERVICE_ROLE_KEY</code>{" "}
              on the server.
            </p>
          </div>
        ) : (
          <GalleryAdminClient configured={configured} loadError={error ?? null} initialRows={rows} />
        )}
      </div>
    </div>
  );
}
