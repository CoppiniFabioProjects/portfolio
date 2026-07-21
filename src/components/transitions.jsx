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
    <div className="relative py-7 md:py-11 overflow-hidden border-y border-white/5 select-none">
      <motion.div className="flex whitespace-nowrap will-change-transform" style={reduce ? undefined : { x }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <span
            key={i}
            className="mr-10 font-sans font-bold uppercase tracking-tight text-5xl md:text-7xl text-transparent [-webkit-text-stroke:1px_rgba(168,85,247,0.4)]"
          >
            {text} <span className="text-garuda/40">✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* 2) AQUILA IN VOLO — plana attraverso lo schermo seguendo lo scroll (ambient) */
export function EagleFly() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const x = useTransform(scrollYProgress, [0, 1], ["-12vw", "104vw"]);
  const y = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 1], ["76vh", "16vh", "64vh", "12vh", "48vh"]);
  const rotate = useTransform(scrollYProgress, [0, 0.5, 1], [-7, 7, -4]);
  const opacity = useTransform(scrollYProgress, [0, 0.05, 0.95, 1], [0, 0.14, 0.14, 0]);
  if (reduce) return null;
  return (
    <motion.img
      src="/portfolio/garuda.png"
      alt=""
      aria-hidden="true"
      style={{ x, y, rotate, opacity }}
      className="fixed top-0 left-0 w-24 md:w-32 z-0 pointer-events-none blur-[1px] drop-shadow-[0_0_30px_rgba(168,85,247,0.4)]"
    />
  );
}

/* 3) SIPARIO — un pannello viola/teal si ritrae rivelando la sezione */
export function Curtain({ children, className = "" }) {
  const reduce = useReducedMotion();
  return (
    <div className={`relative ${className}`}>
      {children}
      {!reduce && (
        <motion.div
          className="absolute inset-0 z-20 origin-top bg-gradient-to-b from-purple via-purple-dark to-garuda pointer-events-none"
          initial={{ scaleY: 1 }}
          whileInView={{ scaleY: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.95, ease: [0.83, 0, 0.17, 1] }}
        />
      )}
    </div>
  );
}

/* 4) ZOOM CINEMATOGRAFICO — la sezione entra con scala + sfocatura */
export function ZoomReveal({ children }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 40%"] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0.3, 1]);
  const blur = useTransform(scrollYProgress, [0, 1], [9, 0]);
  const filter = useTransform(blur, (b) => `blur(${b}px)`);
  if (reduce) return <>{children}</>;
  return (
    <motion.div ref={ref} style={{ scale, opacity, filter }} className="origin-center will-change-transform">
      {children}
    </motion.div>
  );
}
