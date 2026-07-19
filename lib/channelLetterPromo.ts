/** Channel-letter printing promo window (landing marketing). */

export const CHANNEL_LETTER_PROMO = {
  startMonth: 7,
  startDay: 20,
  endMonth: 7,
  endDay: 31,
  /** Standard rate advertised outside / beside the promo. */
  regularVndPerGram: 300,
  /** Discounted rate during the promo window. */
  promoVndPerGram: 250,
} as const;

export function isChannelLetterPromoActive(now: Date = new Date()): boolean {
  const start = new Date(
    now.getFullYear(),
    CHANNEL_LETTER_PROMO.startMonth - 1,
    CHANNEL_LETTER_PROMO.startDay,
    0,
    0,
    0,
    0,
  );
  const end = new Date(
    now.getFullYear(),
    CHANNEL_LETTER_PROMO.endMonth - 1,
    CHANNEL_LETTER_PROMO.endDay,
    23,
    59,
    59,
    999,
  );
  return now >= start && now <= end;
}
