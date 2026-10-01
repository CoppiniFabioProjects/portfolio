import { useRef } from "react";
import {
  motion, useScroll, useVelocity, useTransform, useSpring,
  useMotionValue, useAnimationFrame, useReducedMotion,
} from "framer-motion";

const wrap = (min, max, v) => {
  const r = max - min;
  return ((((v - min) % r) + r) % r) + min;
};

/* 1) TESTO CINETICO — sfreccia in orizzontale reagendo alla velocità di scroll */
export function KineticText({ text = "GARUDA", baseVelocity = 2 }) {
  const reduce = useReducedMotion();
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], { clamp: false });
  const dir = useRef(1);
  const x = useTransform(baseX, (v) => `${wrap(-20, -45, v)}%`);

  useAnimationFrame((t, delta) => {
    if (reduce) return;
    let moveBy = dir.current * baseVelocity * (delta / 1000);
    if (velocityFactor.get() < 0) dir.current = -1;
    else if (velocityFactor.get() > 0) dir.current = 1;
    moveBy += dir.current * moveBy * velocityFactor.get();
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className="relative py-6 md:py-11 overflow-hidden border-y border-white/5 select-none">
      <motion.div className="flex whitespace-nowrap will-change-transform" style={reduce ? undefined : { x }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <span
            key={i}
            className="mr-8 md:mr-10 font-sans font-bold uppercase tracking-tight text-4xl sm:text-6xl md:text-7xl text-transparent [-webkit-text-stroke:1px_rgba(168,85,247,0.4)]"
          >
            {text} <span className="text-garuda/40">✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* 2) SECTION REVEAL — la sezione sale e si rivela con un movimento fluido
   e moderno (ease-out lungo, leggero "settle" di scala). Nessun pannello,
   nessuno zoom brusco: si attiva una volta sola quando entra nel viewport. */
const sectionReveal = {
  hidden: { opacity: 0, y: 64, scale: 0.985 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 1.05, ease: [0.16, 1, 0.3, 1] },
  },
};
export function SectionReveal({ children, className = "", amount = 0.18 }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={`will-change-transform ${className}`}
      variants={sectionReveal}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
    >
      {children}
    </motion.div>
  );
}
