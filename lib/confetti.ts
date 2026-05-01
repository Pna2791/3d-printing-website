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
