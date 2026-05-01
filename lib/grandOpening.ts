import { STUDENT_PROMO, isStudentPromoActive } from "@/lib/pricing";

/** Cùng cửa sổ với ưu đãi sinh viên (01/05 → 10/05, theo năm hiện tại). */
export function isGrandOpeningPromoActive(now: Date = new Date()) {
  return isStudentPromoActive(now);
}

export function getPromoWindowEndDate(now: Date = new Date()): Date {
  return new Date(
    now.getFullYear(),
    STUDENT_PROMO.endMonth - 1,
    STUDENT_PROMO.endDay,
    23,
    59,
    59,
    999,
  );
}

export function getPromoWindowStartDate(now: Date = new Date()): Date {
  return new Date(
    now.getFullYear(),
    STUDENT_PROMO.startMonth - 1,
    STUDENT_PROMO.startDay,
    0,
    0,
    0,
    0,
  );
}

export type PromoCountdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  ended: boolean;
};

/** Đếm ngược tới hết ngày 10/05 (23:59:59) theo năm của `now`. */
export function getCountdownToPromoEnd(now: Date = new Date()): PromoCountdown {
  const end = getPromoWindowEndDate(now);
  const ms = end.getTime() - now.getTime();
  if (ms <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, ended: true };
  }
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds, ended: false };
}
