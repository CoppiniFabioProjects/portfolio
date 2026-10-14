import { describe, it, expect } from "vitest";
import { plateau } from "./useSteps";

describe("Sezioni a tappe — avanzamento", () => {
  it("ogni tappa resta ferma il tempo di leggerla", () => {
    // intorno a ogni tappa intera lo stato non cambia
    [0, 0.1, 0.24].forEach((x) => expect(plateau(x)).toBe(0));
    [0.76, 1, 1.24].forEach((x) => expect(plateau(x)).toBe(1));
  });

  it("il passaggio avviene a metà strada, in modo continuo e senza tornare indietro", () => {
    expect(plateau(0.5)).toBeCloseTo(0.5);
    let prev = -1;
    for (let x = 0; x <= 5; x += 0.01) {
      const v = plateau(x);
      expect(v).toBeGreaterThanOrEqual(prev - 1e-9);
      prev = v;
    }
  });
});
