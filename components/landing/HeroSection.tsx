"use client";

import Image from "next/image";
import { motion } from "framer-motion";

import { fireGrandOpeningConfetti } from "@/lib/confetti";
import { isGrandOpeningPromoActive } from "@/lib/grandOpening";
import { PRICING_RULES } from "@/lib/pricing";

type HeroSectionProps = {
  onOpenPricing: () => void;
};

export function HeroSection({ onOpenPricing }: HeroSectionProps) {
  const promo = isGrandOpeningPromoActive();
  const petgStudent = PRICING_RULES.PETG.studentVndPerGram;

  return (
    <section className="grid gap-10 py-16 lg:grid-cols-2 lg:items-center">
      <div>
        <p className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1 text-sm font-medium text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-300">
          Ship toàn quốc — Ưu đãi lớn cho sinh viên
        </p>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
          In 3D giá rẻ HCM (Thủ Đức) — NA 3D SHOP giao hàng COD toàn quốc
        </h1>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-300">
          Xưởng tại khu vực Làng Đại Học (Thủ Đức), liền kề Dĩ An — giá minh bạch, ưu đãi đặc biệt cho sinh viên
          và khách nội thành; tư vấn tận tình từng đơn.
        </p>

        {promo ? (
          <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-200">
            <span className="relative flex h-2 w-2" aria-hidden>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Xưởng đang hoạt động — Nhận file in ngay hôm nay!
          </p>
        ) : null}

        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 dark:border-emerald-900/50 dark:bg-emerald-900/20">
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
            Khai trương từ 01/05 - 10/05
          </p>
          <p className="mt-2 text-sm text-emerald-800 dark:text-emerald-200">Giá từ 400đ/g</p>
          <motion.p
            className="mt-3 inline-block rounded-xl px-4 py-2.5 text-xl font-extrabold leading-tight tracking-tight text-emerald-950 sm:text-2xl md:text-3xl dark:text-emerald-50"
            animate={{
              scale: [1, 1.03, 1],
              boxShadow: [
                "0 0 0 0 rgba(16, 185, 129, 0.35)",
                "0 0 28px 6px rgba(16, 185, 129, 0.5)",
                "0 0 0 0 rgba(16, 185, 129, 0.35)",
              ],
            }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          >
            {petgStudent}đ/gram cho sinh viên
          </motion.p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onOpenPricing}
            className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Báo giá in 3D lấy liền (HCM)
          </button>
          <a
            href="/bao-gia-in-3d"
            target="_blank"
            rel="noreferrer"
            onClick={() => fireGrandOpeningConfetti()}
            className="rounded-xl border border-zinc-300 px-5 py-3 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
          >
            Công cụ báo giá file STL
          </a>
        </div>
      </div>

      <div className="mx-auto w-full max-w-sm rounded-3xl border border-zinc-200 bg-zinc-100 p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="relative aspect-square">
          <Image
            src="/logo-na_3d.png"
            alt="Logo NA 3D SHOP — in 3D giá rẻ, ship toàn quốc"
            fill
            className="object-cover object-center rounded-2xl"
            priority
          />
          {promo ? (
            <motion.div
              className="pointer-events-none absolute -right-1 -top-1 z-10 max-w-[9.5rem] rounded-lg border-2 border-dashed border-emerald-600 bg-white/95 px-2.5 py-1.5 text-center shadow-lg backdrop-blur-sm dark:border-emerald-400 dark:bg-zinc-900/95"
              animate={{
                y: [0, -5, 0],
                rotate: [-4, 4, -4],
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <p className="text-[8px] font-black uppercase leading-tight tracking-wide text-emerald-700 dark:text-emerald-300">
                Grand Opening
              </p>
              <p className="mt-0.5 text-[8px] font-bold uppercase leading-tight text-zinc-800 dark:text-zinc-100">
                — Giảm giá sinh viên
              </p>
            </motion.div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
