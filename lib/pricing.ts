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

