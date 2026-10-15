import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Fila di card da sfogliare di lato col dito (come le storie), con lo scroll nativo del
// telefono: niente scorrimento "bloccato". `progress` va da 0 a n-1 e segue il dito:
// lo usano anche le scene 3D (il dispositivo dei Progetti gira mentre sfogli).
export function useSwipe(n) {
  const trackRef = useRef(null);
  const progress = useMotionValue(0);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const cards = () => el.querySelectorAll("[data-card]");
    const on = () => {
      const c = cards();
      if (c.length < 2) return;
      const step = c[1].offsetLeft - c[0].offsetLeft;
      const v = Math.min(n - 1, Math.max(0, el.scrollLeft / step));
      progress.set(v);
      setActive(Math.round(v));
    };
    on();
    el.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      el.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
    };
  }, [n, progress]);

  const goTo = (i) => {
    const el = trackRef.current;
    const c = el?.querySelectorAll("[data-card]");
    if (!c?.[i]) return;
    el.scrollTo({ left: c[i].offsetLeft - c[0].offsetLeft, behavior: "smooth" });
  };

  return { trackRef, progress, active, goTo };
}

// Una card della fila. Quella al centro è piatta (testo nitido); le vicine ruotano appena
// verso l'interno e si fanno più piccole: la profondità c'è, il testo resta leggibile.
function SwipeCard({ i, progress, children }) {
  const reduce = useReducedMotion();
  const transform = useTransform(progress, (p) => {
    const d = Math.max(-1.5, Math.min(1.5, i - p));
    if (reduce || Math.abs(d) < 0.01) return "none";
    return `perspective(1000px) rotateY(${(-d * 14).toFixed(2)}deg) scale(${(1 - Math.abs(d) * 0.07).toFixed(3)})`;
  });
  const opacity = useTransform(progress, (p) => 1 - Math.min(1, Math.abs(i - p)) * 0.45);
  return (
    <motion.div data-card style={{ transform, opacity }} className="swipe-card snap-center shrink-0 flex">
      {children}
    </motion.div>
  );
}

export function SwipeTrack({ swipe, items, render, label }) {
  return (
    <div
      ref={swipe.trackRef}
      role="region"
      aria-label={label}
      className="swipe-track flex gap-3.5 overflow-x-auto snap-x snap-mandatory no-scrollbar py-2"
    >
      {items.map((it, i) => (
        <SwipeCard key={i} i={i} progress={swipe.progress}>
          {render(it, i)}
        </SwipeCard>
      ))}
    </div>
  );
}

// Puntini e frecce sotto la fila
export function SwipeDots({ swipe, n, prev, next }) {
  const { active, goTo } = swipe;
  const btn = "w-10 h-10 grid place-items-center rounded-full border border-white/10 text-mist active:text-white disabled:opacity-30 transition";
  return (
    <div className="mt-4 flex items-center justify-center gap-5">
      <button type="button" onClick={() => goTo(Math.max(0, active - 1))} disabled={active === 0} aria-label={prev} className={btn}>
        <ChevronLeft className="w-4 h-4" />
      </button>
      <div className="flex items-center gap-2" aria-hidden="true">
        {Array.from({ length: n }, (_, i) => (
          <span key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === active ? "w-6 bg-purple-glow" : "w-1.5 bg-white/20"}`} />
        ))}
      </div>
      <button type="button" onClick={() => goTo(Math.min(n - 1, active + 1))} disabled={active === n - 1} aria-label={next} className={btn}>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
