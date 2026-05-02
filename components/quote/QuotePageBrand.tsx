import Image from "next/image";
import { Mail, MapPin, Phone } from "lucide-react";

import { OFFLINE_ORDER_CONTACT } from "@/lib/config";
import type { WorkshopInfoRow } from "@/lib/supabase/types";

type QuotePageBrandProps = {
  workshopRows: WorkshopInfoRow[];
  workshopError: string | null;
  /** Trang báo giá nền zinc-900 — card tối đồng bộ. */
  surface?: "light" | "dark";
};

export function QuotePageBrand({
  workshopRows,
  workshopError,
  surface = "light",
}: QuotePageBrandProps) {
  const map = Object.fromEntries(workshopRows.map((row) => [row.key, row.value]));
  const name = map.workshop_name?.trim() || "Na 3D";
  const email = map.contact_email?.trim();
  const address = map.address?.trim() ?? map.location?.trim();

  const shell =
    surface === "dark"
      ? "border-zinc-800 bg-zinc-950/90 shadow-lg shadow-black/20"
      : "border-zinc-200 bg-zinc-50/90 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50";

  const logoFrame =
    surface === "dark"
      ? "border-zinc-700 bg-zinc-900"
      : "border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800";

  const titleClass = surface === "dark" ? "text-zinc-50" : "text-zinc-900 dark:text-zinc-50";

  const bodyMuted = surface === "dark" ? "text-zinc-400" : "text-zinc-700 dark:text-zinc-300";

  const accent = surface === "dark" ? "text-emerald-500" : "text-emerald-600 dark:text-emerald-400";

  const linkClass =
    surface === "dark"
      ? "text-emerald-400 decoration-emerald-500/40 hover:decoration-emerald-400"
      : "text-emerald-800 decoration-emerald-600/30 hover:decoration-emerald-600 dark:text-emerald-300 dark:decoration-emerald-400/40";

  return (
    <div
      className={`mb-8 flex flex-col gap-5 rounded-2xl border p-5 sm:flex-row sm:items-start sm:gap-6 ${shell}`}
    >
      <div
        className={`relative mx-auto h-24 w-24 shrink-0 overflow-hidden rounded-2xl border shadow-sm sm:mx-0 ${logoFrame}`}
      >
        <Image
          src="/logo-na_3d.png"
          alt={`Logo ${name}`}
          fill
          className="object-cover object-center"
          sizes="96px"
          priority
        />
      </div>

      <div className="min-w-0 flex-1 text-center sm:text-left">
        <p className={`text-xs font-semibold uppercase tracking-wider ${accent}`}>Xưởng in 3D</p>
        <h2 className={`mt-1 text-xl font-semibold tracking-tight sm:text-2xl ${titleClass}`}>
          {name}
        </h2>

        {workshopError ? (
          <p className="mt-2 text-xs text-amber-400">
            Không tải được thông tin từ máy chủ — hiển thị liên hệ cố định bên dưới.
          </p>
        ) : null}

        <ul className={`mt-4 space-y-2 text-sm ${bodyMuted}`}>
          {address ? (
            <li className="flex items-start justify-center gap-2 sm:justify-start">
              <MapPin className={`mt-0.5 h-4 w-4 shrink-0 ${accent}`} aria-hidden />
              <span>{address}</span>
            </li>
          ) : null}
          {email ? (
            <li className="flex items-center justify-center gap-2 sm:justify-start">
              <Mail className={`h-4 w-4 shrink-0 ${accent}`} aria-hidden />
              <a
                href={`mailto:${email}`}
                className={`font-medium underline underline-offset-2 ${linkClass}`}
              >
                {email}
              </a>
            </li>
          ) : null}
          <li className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:justify-start">
            <a
              href={OFFLINE_ORDER_CONTACT.zaloTelHref}
              className={`inline-flex items-center gap-1.5 font-medium underline underline-offset-2 ${linkClass}`}
            >
              <Phone className="h-4 w-4 shrink-0" aria-hidden />
              Zalo {OFFLINE_ORDER_CONTACT.zaloDisplay}
            </a>
            <a
              href={OFFLINE_ORDER_CONTACT.fanpageUrl}
              target="_blank"
              rel="noreferrer"
              className={`font-medium underline underline-offset-2 ${linkClass}`}
            >
              {OFFLINE_ORDER_CONTACT.fanpageLabel}
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
