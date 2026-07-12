import { useEffect, useState } from "react";
import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion";

const SECTIONS = [
  { id: "hero", label: "Intro" },
  { id: "about", label: "Vetrina" },
  { id: "skills", label: "Tech" },
  { id: "linux", label: "Linux" },
  { id: "experience", label: "Timeline" },
  { id: "projects", label: "Progetti" },
  { id: "contact", label: "Contatti" },
];

export default function ScrollGuide() {
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll();
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });

  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const idx = SECTIONS.findIndex((s) => s.id === e.target.id);
            if (idx !== -1) setActive(idx);
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const total = String(SECTIONS.length).padStart(2, "0");
  const current = String(active + 1).padStart(2, "0");

  return (
    <div className="hidden lg:flex fixed left-8 top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-5 select-none pointer-events-none">
      {/* counter */}
      <div className="font-mono text-xs text-mist tracking-widest">
        <span className="text-white">{current}</span>
        <span className="opacity-40"> / {total}</span>
      </div>

      {/* rail */}
      <div className="scroll-guide-rail h-48 rounded-full">
        <motion.div style={{ scaleY: fill }} className="scroll-guide-fill h-full rounded-full" />
      </div>

      {/* active label (rotated) */}
      <div className="h-24 flex items-center">
        <AnimatePresence mode="wait">
          <motion.span
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="kicker [writing-mode:vertical-rl] rotate-180 text-purple-glow"
          >
            {SECTIONS[active].label}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
