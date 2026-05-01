"use client";

import { motion } from "framer-motion";

import { isGrandOpeningPromoActive } from "@/lib/grandOpening";
import { PRICING_RULES } from "@/lib/pricing";

export function GrandOpeningQuotePromo() {
  if (!isGrandOpeningPromoActive()) return null;

  const plaStudent = PRICING_RULES.PLA.studentVndPerGram;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="mb-8 rounded-2xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50 to-white px-4 py-3 shadow-sm dark:border-emerald-800/60 dark:from-emerald-950/50 dark:to-zinc-900/80"
      role="status"
    >
      <p className="text-sm font-medium leading-snug text-emerald-950 dark:text-emerald-100">
        🔥 Bạn đang được áp dụng giá khai trương! (PLA chỉ {plaStudent}đ/g cho sinh viên)
      </p>
    </motion.div>
  );
}
