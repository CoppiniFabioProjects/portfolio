import { useRef, createElement } from "react";
import { useScroll, useTransform } from "framer-motion";
import { smooth, layoutTop } from "./primitives";

// Sezione "a tappe": un contenitore alto con dentro un riquadro sticky alto quanto lo schermo.
// Scorrendo, `step` va da 0 a n-1. Ogni tappa resta ferma per metà del suo tratto
// (il tempo di leggerla) e il passaggio alla successiva avviene a metà strada.
const HOLD = 0.5;
export const plateau = (x) => {
  const i = Math.floor(x);
  const f = x - i;
  const a = HOLD / 2;
  const t = Math.min(1, Math.max(0, (f - a) / (1 - HOLD)));
  return i + t * t * (3 - 2 * t);
};

// Altezza del contenitore: lo schermo più `perStep` vh per ogni tappa dopo la prima
export const stepsHeight = (n, perStep) => `calc(100svh + ${(n - 1) * perStep}vh)`;

// Punti di aggancio, uno per tappa: sui dispositivi touch ogni scorrimento si ferma su una tappa
// (scroll-snap "proximity" in index.css, solo con pointer: coarse). Vanno dentro il contenitore alto.
export function StepSnaps({ n }) {
  return Array.from({ length: n }, (_, i) =>
    createElement("span", {
      key: i,
      "aria-hidden": "true",
      className: "step-snap",
      style: { top: n > 1 ? `calc((100% - 100svh) * ${i / (n - 1)})` : 0 },
    }),
  );
}

export function useSteps(n) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const step = useTransform(scrollYProgress, (p) => plateau(Math.min(1, Math.max(0, p)) * (n - 1) * 0.9999));

  // porta la pagina sulla tappa i (al centro del suo tratto fermo)
  const goTo = (i) => {
    const el = ref.current;
    if (!el || n < 2) return;
    const range = el.offsetHeight - window.innerHeight;
    smooth.toY(layoutTop(el) + (range * i) / (n - 1));
  };

  return { ref, step, goTo };
}
