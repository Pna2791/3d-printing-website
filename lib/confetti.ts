/** Gọi chỉ từ client (vd. `useEffect`, `onClick`). */
export function fireGrandOpeningConfetti() {
  if (typeof window === "undefined") return;

  const colors = ["#10b981", "#ffffff", "#34d399", "#ecfdf5"];

  void import("canvas-confetti").then((mod) => {
    const confetti = mod.default;
    const count = 200;
    const defaults = {
      origin: { y: 0.65 },
      spread: 80,
      ticks: 200,
      gravity: 1,
      decay: 0.94,
      colors,
    };

    confetti({
      ...defaults,
      particleCount: Math.floor(count * 0.35),
      scalar: 1.1,
    });
    confetti({
      ...defaults,
      particleCount: Math.floor(count * 0.25),
      angle: 60,
      spread: 55,
      startVelocity: 55,
    });
    confetti({
      ...defaults,
      particleCount: Math.floor(count * 0.25),
      angle: 120,
      spread: 55,
      startVelocity: 55,
    });
  });
}

/** Nhẹ — khi báo giá nhận metadata slice thành công (trang /quote). */
export function fireQuoteMetadataConfetti() {
  if (typeof window === "undefined") return;

  const colors = ["#10b981", "#34d399", "#059669", "#6ee7b7"];

  void import("canvas-confetti").then((mod) => {
    const confetti = mod.default;
    confetti({
      particleCount: 42,
      spread: 70,
      origin: { y: 0.35, x: 0.5 },
      ticks: 120,
      gravity: 1.1,
      decay: 0.92,
      scalar: 0.85,
      colors,
    });
    confetti({
      particleCount: 28,
      angle: 55,
      spread: 50,
      origin: { y: 0.4, x: 0.42 },
      ticks: 100,
      gravity: 1,
      decay: 0.93,
      colors,
    });
    confetti({
      particleCount: 28,
      angle: 125,
      spread: 50,
      origin: { y: 0.4, x: 0.58 },
      ticks: 100,
      gravity: 1,
      decay: 0.93,
      colors,
    });
  });
}
