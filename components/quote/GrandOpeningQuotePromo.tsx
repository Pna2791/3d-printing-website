"use client";

import { motion } from "framer-motion";

import { isGrandOpeningPromoActive } from "@/lib/grandOpening";
import { PRICING_RULES } from "@/lib/pricing";

export function GrandOpeningQuotePromo() {
  if (!isGrandOpeningPromoActive()) return null;

  const petgStudent = PRICING_RULES.PETG.studentVndPerGram;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="mb-8 rounded-2xl border border-emerald-500/25 bg-gradient-to-r from-emerald-950/80 to-zinc-900/90 px-4 py-3 shadow-md shadow-black/20"
      role="status"
    >
      <p className="text-sm font-medium leading-snug text-emerald-100">
        🔥 Bạn đang được áp dụng giá khai trương! (PETG chỉ {petgStudent}đ/g cho sinh viên)
      </p>
    </motion.div>
  );
}
