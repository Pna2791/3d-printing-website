export type SupportedMaterial = "PLA" | "PETG";

type MaterialPriceRule = {
  normalVndPerGram: number;
  studentVndPerGram: number;
};

export const PRICING_RULES: Record<SupportedMaterial, MaterialPriceRule> = {
  PETG: {
    normalVndPerGram: 400,
    studentVndPerGram: 300,
  },
  PLA: {
    normalVndPerGram: 600,
    studentVndPerGram: 500,
  },
};

/**
 * Reference prices before the latest discount update.
 * Used for UI comparison only (before -> after).
 */
export const PRICE_BEFORE_DISCOUNT: Record<
  SupportedMaterial,
  { normalVndPerGram: number; studentVndPerGram: number }
> = {
  PLA: {
    normalVndPerGram: 1000,
    studentVndPerGram: 800,
  },
  PETG: {
    normalVndPerGram: 700,
    studentVndPerGram: 500,
  },
};

export const STUDENT_PROMO = {
  startMonth: 5,
  startDay: 1,
  endMonth: 5,
  endDay: 10,
  firstDiscountGrams: 1000,
} as const;

/** Giá sàn (VND) — áp dụng sau khi nhân đơn giá × số lượng. */
export const MIN_ORDER_VND_STUDENT = 30_000;
export const MIN_ORDER_VND_NORMAL = 50_000;

/** Uniform model scale for quote UI (no re-slice / no new preview). */
export const MODEL_SCALE_MIN = 0.25;
export const MODEL_SCALE_MAX = 3;
export const MODEL_SCALE_STEP = 0.05;
export const MODEL_SCALE_DEFAULT = 1;

/**
 * Clamp uniform scale factor for UI + pricing.
 * `step` snapping keeps the range slider and displayed % aligned.
 */
export function clampUniformModelScale(scale: number): number {
  const raw = Number.isFinite(scale) ? scale : MODEL_SCALE_DEFAULT;
  const clamped = Math.min(MODEL_SCALE_MAX, Math.max(MODEL_SCALE_MIN, raw));
  const n = Math.round(clamped / MODEL_SCALE_STEP);
  return Math.round(n * MODEL_SCALE_STEP * 100) / 100;
}

/**
 * Heuristic: slicer `filament_used_mm` scales ~with printed volume when uniformly scaling the mesh
 * (linear dimensions ×s ⇒ volume ×s³). Used only for instant quote UI, not a new slice.
 */
export function scaledFilamentMmFromUniformScale(baseFilamentMm: number, uniformScale: number): number {
  const s = clampUniformModelScale(uniformScale);
  const base = Math.max(0, Number.isFinite(baseFilamentMm) ? baseFilamentMm : 0);
  return base * Math.pow(s, 3);
}

export function scaledBoundingBoxMm(
  dims: { x_mm: number; y_mm: number; z_mm: number },
  uniformScale: number,
): { x_mm: number; y_mm: number; z_mm: number } {
  const s = clampUniformModelScale(uniformScale);
  return {
    x_mm: (Number.isFinite(dims.x_mm) ? dims.x_mm : 0) * s,
    y_mm: (Number.isFinite(dims.y_mm) ? dims.y_mm : 0) * s,
    z_mm: (Number.isFinite(dims.z_mm) ? dims.z_mm : 0) * s,
  };
}

/** Slicer metadata fields we can rescale without a new mesh (same heuristics as filament / box). */
export type SlicerLikeMetadata = {
  filament_used_mm: number;
  estimated_print_time: string;
  model_dimensions: { x_mm: number; y_mm: number; z_mm: number };
};

/**
 * Parse rough duration strings from slicer (e.g. `2h 30m`, `1:15:00`, `45m`). Returns seconds or null.
 */
export function parseLooseDurationToSeconds(label: string): number | null {
  const t = label.trim();
  if (!t) return null;
  const iso = /^(\d+):(\d{2}):(\d{2})$/.exec(t);
  if (iso) {
    return Number(iso[1]) * 3600 + Number(iso[2]) * 60 + Number(iso[3]);
  }
  const hm = /^(\d+):(\d{2})$/.exec(t);
  if (hm) return Number(hm[1]) * 3600 + Number(hm[2]) * 60;
  let sec = 0;
  const h = /(\d+)\s*h(?:our)?s?/i.exec(t);
  const m = /(\d+)\s*m(?:in)?s?/i.exec(t);
  const s = /(\d+)\s*s(?:ec)?s?/i.exec(t);
  if (h) sec += Number(h[1]) * 3600;
  if (m) sec += Number(m[1]) * 60;
  if (s) sec += Number(s[1]);
  if (h || m || s) return sec;
  const num = Number(t);
  if (Number.isFinite(num) && num >= 0 && num < 100_000 && !t.includes(":")) {
    return num * 60;
  }
  return null;
}

export function formatSecondsApproxHuman(totalSec: number): string {
  const s = Math.max(0, Math.round(totalSec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`;
  if (m > 0) return r > 0 ? `${m}m ${r}s` : `${m}m`;
  return `${r}s`;
}

/** Scale print duration ~with extruded volume (×s³) when label parses; otherwise return original. */
export function scaleEstimatedPrintTimeHeuristic(label: string, uniformScale: number): string {
  const sc = clampUniformModelScale(uniformScale);
  if (sc === 1 || !label.trim()) return label;
  const sec = parseLooseDurationToSeconds(label);
  if (sec == null) return label;
  return formatSecondsApproxHuman(sec * Math.pow(sc, 3));
}

export function applyUniformScaleToSlicerMetadata(
  meta: SlicerLikeMetadata,
  uniformScale: number,
): SlicerLikeMetadata {
  const s = clampUniformModelScale(uniformScale);
  return {
    filament_used_mm: scaledFilamentMmFromUniformScale(meta.filament_used_mm, s),
    estimated_print_time: scaleEstimatedPrintTimeHeuristic(meta.estimated_print_time, s),
    model_dimensions: scaledBoundingBoxMm(meta.model_dimensions, s),
  };
}

export type MinimumOrderFloorResult = {
  /** Tổng trước giá sàn (đã làm tròn số nguyên VND). */
  subtotalVnd: number;
  /** Tổng sau giá sàn. */
  totalVnd: number;
  /** Ngưỡng tối thiểu áp dụng cho nhóm khách. */
  minimumVnd: number;
  /** `true` nếu tổng được nâng lên bằng giá sàn. */
  floorApplied: boolean;
};

/**
 * Áp dụng giá sàn đơn hàng: sinh viên tối thiểu 30.000 ₫, thường 50.000 ₫.
 * `subtotalVnd` nên là số nguyên (VND).
 */
export function applyMinimumOrderFloor(
  subtotalVnd: number,
  isStudent: boolean,
): MinimumOrderFloorResult {
  const minimumVnd = isStudent ? MIN_ORDER_VND_STUDENT : MIN_ORDER_VND_NORMAL;
  const sub = Math.max(0, Math.round(Number.isFinite(subtotalVnd) ? subtotalVnd : 0));
  if (sub >= minimumVnd) {
    return { subtotalVnd: sub, totalVnd: sub, minimumVnd, floorApplied: false };
  }
  return { subtotalVnd: sub, totalVnd: minimumVnd, minimumVnd, floorApplied: true };
}

/** 1.75 mm filament cross-section (mm²). */
export const FILAMENT_CROSS_SECTION_MM2 = Math.PI * Math.pow(1.75 / 2, 2);

/** Material density (g/cm³) for mass from extruded volume. */
export const FILAMENT_DENSITY_G_PER_CM3: Record<SupportedMaterial, number> = {
  PLA: 1.25,
  PETG: 1.27,
};

/**
 * Estimate filament mass (g) from extrusion length (mm) for 1.75 mm stock.
 * Mass = (cross_section_mm² × length_mm / 1000) × density_g_per_cm³
 * (1 cm³ = 1000 mm³).
 */
export function filamentMmToEstimatedGrams(
  filamentMm: number,
  materialType: SupportedMaterial,
): number {
  const density = FILAMENT_DENSITY_G_PER_CM3[materialType];
  const mm = Math.max(0, Number.isFinite(filamentMm) ? filamentMm : 0);
  const volumeCm3 = (FILAMENT_CROSS_SECTION_MM2 * mm) / 1000;
  return volumeCm3 * density;
}

export type SlicerCostEstimate = PricingResult & { weightGrams: number };

/**
 * Full VND quote from slicer `filament_used_mm`, reusing student promo rules.
 */
export function estimateCostFromSlicer(
  filamentMm: number,
  materialType: SupportedMaterial,
  isStudent: boolean,
  usedDiscountGrams?: number,
  now?: Date,
): SlicerCostEstimate {
  const weightGrams = filamentMmToEstimatedGrams(filamentMm, materialType);
  const pricing = calculateMaterialPrice({
    material: materialType,
    weightGrams,
    isStudent,
    usedDiscountGrams,
    now,
  });
  return { ...pricing, weightGrams };
}

type PricingInput = {
  material: SupportedMaterial;
  weightGrams: number;
  isStudent: boolean;
  usedDiscountGrams?: number;
  now?: Date;
};

export type PricingResult = {
  normalVndPerGram: number;
  studentVndPerGram: number;
  discountedGrams: number;
  regularGrams: number;
  isStudentDiscountApplied: boolean;
  totalVnd: number;
};

export function isStudentPromoActive(now: Date = new Date()) {
  const current = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = new Date(now.getFullYear(), STUDENT_PROMO.startMonth - 1, STUDENT_PROMO.startDay);
  const end = new Date(now.getFullYear(), STUDENT_PROMO.endMonth - 1, STUDENT_PROMO.endDay, 23, 59, 59, 999);
  return current >= start && current <= end;
}

export function calculateMaterialPrice(input: PricingInput): PricingResult {
  const rule = PRICING_RULES[input.material];
  const normalVndPerGram = rule.normalVndPerGram;
  const studentVndPerGram = rule.studentVndPerGram;
  const weightGrams = Math.max(0, input.weightGrams);
  const usedDiscountGrams = Math.max(0, input.usedDiscountGrams ?? 0);

  const promoActive = isStudentPromoActive(input.now);
  const remainingDiscountGrams = Math.max(
    0,
    STUDENT_PROMO.firstDiscountGrams - usedDiscountGrams,
  );
  const discountEligible = input.isStudent && promoActive;
  const discountedGrams = discountEligible ? Math.min(weightGrams, remainingDiscountGrams) : 0;
  const regularGrams = Math.max(0, weightGrams - discountedGrams);
  const totalVnd =
    discountedGrams * studentVndPerGram + regularGrams * normalVndPerGram;

  return {
    normalVndPerGram,
    studentVndPerGram,
    discountedGrams,
    regularGrams,
    isStudentDiscountApplied: discountedGrams > 0,
    totalVnd,
  };
}

