import { useEffect } from "react";
import { motion } from "framer-motion";
import Lenis from "lenis";

/* Smooth scroll (Lenis) — respects reduced motion */
export function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    let raf;
    const loop = (time) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // Anchor links → smooth scroll via Lenis
    const onClick = (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const el = document.querySelector(id);
      if (el) {
        e.preventDefault();
        lenis.scrollTo(el, { offset: -80 });
      }
    };
    document.addEventListener("click", onClick);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      document.removeEventListener("click", onClick);
    };
  }, []);
}

/* Cinematic reveal-on-scroll */
const variants = {
  hidden: (d) => ({
    opacity: 0,
    y: d === "up" ? 40 : 0,
    x: d === "left" ? 40 : d === "right" ? -40 : 0,
    filter: "blur(6px)",
  }),
  show: {
    opacity: 1,
    y: 0,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
};

export function Reveal({ children, direction = "up", delay = 0, className = "", as = "div" }) {
  const MotionTag = motion[as] || motion.div;
  return (
    <MotionTag
      className={className}
      custom={direction}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay }}
    >
      {children}
    </MotionTag>
  );
}

/* Section eyebrow + title — editorial (Longbow-inspired) with index number */
export function SectionHeader({ eyebrow, title, sub, align = "left", index }) {
  return (
    <div className={`mb-14 ${align === "center" ? "text-center mx-auto max-w-2xl" : ""}`}>
      <Reveal>
        <div className={`flex items-center gap-3 mb-4 ${align === "center" ? "justify-center" : ""}`}>
          {index && (
            <span className="font-mono text-xs text-purple-glow/70 tracking-widest">.{index}</span>
          )}
          <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-mist">
            {eyebrow}
          </span>
        </div>
      </Reveal>
      <Reveal delay={0.05}>
        <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-light text-white tracking-tight text-balance leading-[0.95]">
          {title}
        </h2>
      </Reveal>
      {sub && (
        <Reveal delay={0.1}>
          <p className="mt-5 text-mist text-base md:text-lg max-w-xl leading-relaxed">{sub}</p>
        </Reveal>
      )}
      <div className={`hairline w-24 mt-6 ${align === "center" ? "mx-auto" : ""}`} />
    </div>
  );
}

/* Spotlight wrapper — tracks cursor for the radial glow */
export function Spotlight({ children, className = "" }) {
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <div onMouseMove={onMove} className={`spotlight ${className}`}>
      {children}
    </div>
  );
}
