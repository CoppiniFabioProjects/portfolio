import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
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

/* Masked line reveal — each line slides up from behind a clip, staggered on scroll.
   `immediate` = anima al montaggio (per contenuti above-the-fold come la hero):
   così il testo compare sempre, senza dipendere dal trigger di scroll. */
export function AnimatedLines({ lines, className = "", delay = 0, stagger = 0.12, immediate = false }) {
  const trigger = immediate
    ? { animate: { y: "0%" } }
    : { whileInView: { y: "0%" }, viewport: { once: true, margin: "-60px" } };
  return (
    <span className="block">
      {lines.map((line, i) => (
        <span key={i} className="line-mask">
          <motion.span
            className={`block ${className}`}
            initial={{ y: "110%" }}
            {...trigger}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: delay + i * stagger }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/* Word-by-word reveal — the "guided reading" effect */
export function WordReveal({ text, className = "", stagger = 0.045 }) {
  const words = text.split(" ");
  return (
    <motion.span
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      transition={{ staggerChildren: stagger }}
    >
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <motion.span
            className="inline-block"
            variants={{
              hidden: { y: "100%", opacity: 0 },
              show: { y: "0%", opacity: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
            }}
          >
            {w}&nbsp;
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

/* Magnetic — l'elemento segue leggermente il cursore all'hover (micro-interazione).
   Si disattiva su touch e con prefers-reduced-motion; su un wrapper inline-block
   così avvolge CTA/icone senza rompere il layout. */
export function Magnetic({ children, strength = 0.35, className = "" }) {
  const ref = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 220, damping: 18, mass: 0.4 });
  const y = useSpring(my, { stiffness: 220, damping: 18, mass: 0.4 });

  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mx.set((e.clientX - (r.left + r.width / 2)) * strength);
    my.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => {
    mx.set(0);
    my.set(0);
  };

  useEffect(() => {
    const noFine = window.matchMedia("(hover: none), (prefers-reduced-motion: reduce)").matches;
    if (noFine) return;
    const el = ref.current;
    if (!el) return;
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", reset);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", reset);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strength]);

  return (
    <motion.span ref={ref} style={{ x, y }} className={`inline-block ${className}`}>
      {children}
    </motion.span>
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
