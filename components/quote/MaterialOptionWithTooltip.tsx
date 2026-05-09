"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CircleHelp } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { MATERIAL_GUIDE } from "@/lib/materials";
import type { NaLocale } from "@/lib/quote-paths";
import type { SupportedMaterial } from "@/lib/pricing";

const LONG_PRESS_MS = 520;
const HOVER_HIDE_MS = 160;

const tipMotion = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 4 },
  transition: { duration: 0.14, ease: [0.22, 1, 0.36, 1] as const },
};

type MaterialOptionWithTooltipProps = {
  material: SupportedMaterial;
  selected: boolean;
  onSelect: () => void;
  locale?: NaLocale;
};

export function MaterialOptionWithTooltip({
  material,
  selected,
  onSelect,
  locale = "vi",
}: MaterialOptionWithTooltipProps) {
  const chipRef = useRef<HTMLDivElement>(null);
  const longTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoverHideRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pinnedOpen, setPinnedOpen] = useState(false);
  const [hoverOpen, setHoverOpen] = useState(false);
  const summary =
    locale === "en" ? MATERIAL_GUIDE[material].summaryLineEn : MATERIAL_GUIDE[material].summaryLineVi;
  const showTip = pinnedOpen || hoverOpen;

  const clearLongPress = useCallback(() => {
    if (longTimerRef.current != null) {
      clearTimeout(longTimerRef.current);
      longTimerRef.current = null;
    }
  }, []);

  const clearHoverHide = useCallback(() => {
    if (hoverHideRef.current != null) {
      clearTimeout(hoverHideRef.current);
      hoverHideRef.current = null;
    }
  }, []);

  const scheduleHoverHide = useCallback(() => {
    clearHoverHide();
    hoverHideRef.current = setTimeout(() => {
      hoverHideRef.current = null;
      setHoverOpen(false);
    }, HOVER_HIDE_MS);
  }, [clearHoverHide]);

  useEffect(() => {
    if (!pinnedOpen) return;
    const onDocPointerDown = (e: PointerEvent) => {
      if (chipRef.current?.contains(e.target as Node)) return;
      setPinnedOpen(false);
    };
    document.addEventListener("pointerdown", onDocPointerDown, true);
    return () => document.removeEventListener("pointerdown", onDocPointerDown, true);
  }, [pinnedOpen]);

  useEffect(() => {
    return () => {
      if (longTimerRef.current != null) clearTimeout(longTimerRef.current);
      if (hoverHideRef.current != null) clearTimeout(hoverHideRef.current);
    };
  }, []);

  const onChipPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "touch") return;
    clearLongPress();
    longTimerRef.current = setTimeout(() => {
      longTimerRef.current = null;
      setPinnedOpen(true);
      setHoverOpen(false);
    }, LONG_PRESS_MS);
  };

  const onChipPointerUp = () => {
    clearLongPress();
  };

  return (
    <div ref={chipRef} className="relative inline-flex max-w-full" data-material-chip={material}>
      <div
        className={[
          "flex min-h-[42px] max-w-full items-stretch overflow-visible rounded-xl border transition",
          selected
            ? "border-emerald-500 bg-emerald-500/15 text-emerald-100"
            : "border-zinc-700 bg-zinc-950 text-zinc-200 hover:border-emerald-500/40",
        ].join(" ")}
        onPointerEnter={() => {
          clearHoverHide();
          setHoverOpen(true);
        }}
        onPointerLeave={() => {
          scheduleHoverHide();
          clearLongPress();
        }}
        onPointerDown={onChipPointerDown}
        onPointerUp={onChipPointerUp}
        onPointerCancel={clearLongPress}
      >
        <label className="flex flex-1 cursor-pointer items-center gap-2 px-4 py-2 text-sm font-semibold">
          <input
            type="radio"
            name="material"
            value={material}
            checked={selected}
            onChange={() => onSelect()}
            className="sr-only"
            aria-describedby={showTip ? `material-quote-tip-${material}` : undefined}
          />
          <span className="whitespace-nowrap">{material}</span>
        </label>
        <button
          type="button"
          aria-label={`Gợi ý nhanh: ${material}`}
          aria-expanded={pinnedOpen}
          className={[
            "flex shrink-0 items-center justify-center border-l px-2.5 text-emerald-400/90 transition md:hidden",
            selected ? "border-emerald-500/40" : "border-zinc-700",
            "hover:bg-zinc-800/80 hover:text-emerald-300",
          ].join(" ")}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setPinnedOpen((v) => !v);
          }}
        >
          <CircleHelp className="h-4 w-4" strokeWidth={2} aria-hidden />
        </button>
      </div>

      <AnimatePresence>
        {showTip ? (
          <motion.div
            id={`material-quote-tip-${material}`}
            role="tooltip"
            aria-live={pinnedOpen ? "polite" : undefined}
            {...tipMotion}
            className="pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 z-[100] w-max max-w-[min(18rem,calc(100vw-2rem))] -translate-x-1/2 rounded-lg border border-emerald-500 bg-zinc-800 px-2.5 py-1.5 text-left text-xs leading-snug text-white shadow-lg shadow-black/40"
            key={material}
          >
            {summary}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
