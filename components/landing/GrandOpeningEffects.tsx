"use client";

import { useEffect } from "react";

import { fireGrandOpeningConfetti } from "@/lib/confetti";
import { isGrandOpeningPromoActive } from "@/lib/grandOpening";

const SESSION_KEY = "na3d_grand_opening_confetti_landing";

/** Một lần mỗi phiên tab khi đang trong đợt khai trương. */
export function GrandOpeningLandingConfetti() {
  useEffect(() => {
    if (!isGrandOpeningPromoActive()) return;
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      return;
    }
    const t = window.setTimeout(() => fireGrandOpeningConfetti(), 400);
    return () => window.clearTimeout(t);
  }, []);

  return null;
}
