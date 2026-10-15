import { useEffect, useState } from "react";
import { motion, useTransform, useMotionValueEvent, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { SectionHeader } from "./primitives";
import { useSteps, stepsHeight } from "./useSteps";
import { useTouchLayout } from "./useMedia";
import { useSwipe, SwipeTrack, SwipeDots } from "./Swipe";
import { timeline } from "../data/content";
import { ui } from "../data/ui";

const N = timeline.length;
const year = (t) => (t.period.match(/\d{4}/) || [""])[0];

// Una tappa del percorso: è la card a portare il contenuto, il 3D è il viaggio tra una e l'altra
function Stop({ t, className = "" }) {
  return (
    <div className={`rounded-3xl p-6 md:p-7 ${className}`}>
      <div className="flex items-center gap-2.5 mb-2 flex-wrap">
        <span className="font-mono text-xs text-purple-glow">{t.period}</span>
        {t.current && (
          <span className="text-[9px] font-bold uppercase tracking-wider bg-garuda/15 text-garuda border border-garuda/30 px-2 py-0.5 rounded-full">
            {ui.timeline.current}
          </span>
        )}
      </div>
      <h3 className="font-display text-2xl md:text-3xl text-white leading-tight tracking-tight">{t.org}</h3>
      <p className="text-sm font-semibold text-purple-glow/90 mt-1 mb-3">{t.role}</p>
      <p className="text-sm text-mist leading-relaxed">{t.body}</p>
      {t.link && (
        <a
          href={t.link}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-garuda hover:gap-2.5 transition-all"
        >
          {t.linkLabel || ui.timeline.document} <ArrowUpRight className="w-4 h-4" />
        </a>
      )}
    </div>
  );
}

// Geometria del tunnel in base allo schermo
function useTunnel() {
  const get = () => {
    const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
    const mobile = vw < 768;
    return {
      w: Math.round(Math.min(vw * 0.82, mobile ? 360 : 500)),
      x: mobile ? 14 : 250, // le tappe si alternano a destra e a sinistra della strada
      d: mobile ? 900 : 1150, // distanza in profondità tra una tappa e l'altra
      persp: mobile ? 760 : 1000,
      road: mobile ? 250 : 270, // quota della strada di punti, sotto le card
    };
  };
  const [g, set] = useState(get);
  useEffect(() => {
    const on = () => set(get());
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return g;
}

const side = (i) => (i % 2 ? 1 : -1);

function TunnelStop({ t, i, step, g, goTo }) {
  // rel > 0: tappa già superata (vola oltre la camera); rel < 0: ancora davanti, in lontananza
  const opacity = useTransform(step, (s) => {
    const rel = s - i;
    return rel > 0 ? Math.max(0, 1 - rel * 1.7) : Math.max(0, 1 + rel * 0.42);
  });
  const pointer = useTransform(step, (s) => (Math.abs(s - i) < 0.5 ? "auto" : "none"));
  const x = side(i) * g.x;
  return (
    <>
      {/* l'anno, enorme, sopra la tappa e un po' più in fondo */}
      <motion.div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 font-display font-black leading-none text-transparent select-none pointer-events-none"
        style={{
          fontSize: g.w < 400 ? "7rem" : "13rem",
          WebkitTextStroke: "1px rgba(192,132,252,0.4)",
          transform: `translate(-50%,-100%) translate3d(${x * 0.8}px, ${g.w < 400 ? -178 : -170}px, ${-i * g.d - 260}px)`,
          opacity,
        }}
      >
        {year(t)}
      </motion.div>
      <motion.div
        className="absolute left-1/2 top-1/2"
        style={{
          width: g.w,
          transform: `translate(-50%,-50%) translate3d(${x}px, 0, ${-i * g.d}px) rotateY(${-side(i) * 7}deg)`,
          opacity,
          pointerEvents: pointer,
        }}
        onFocus={() => goTo(i)}
      >
        <Stop t={t} className="post-card" />
      </motion.div>
    </>
  );
}

// La strada: una scia di punti che collega le tappe, dal presente al passato
function Road({ g }) {
  const dots = [];
  for (let i = 0; i < N - 1; i++) {
    for (let k = 0; k < 16; k++) {
      const f = k / 16;
      const x = side(i) * g.x * (1 - f) + side(i + 1) * g.x * f;
      const z = -(i + f) * g.d;
      dots.push({ key: `${i}-${k}`, x: x * 0.5, z, c: i / (N - 1) });
    }
  }
  return dots.map((d) => (
    <span
      key={d.key}
      aria-hidden="true"
      className="absolute left-1/2 top-1/2 w-2 h-2 -ml-1 -mt-1 rounded-full"
      style={{
        transform: `translate3d(${d.x}px, ${g.road}px, ${d.z}px)`,
        background: d.c < 0.5 ? "#c084fc" : "#5eead4",
        boxShadow: `0 0 12px ${d.c < 0.5 ? "#a855f7" : "#2dd4bf"}`,
        // nebbia: più il punto è lontano dalla tappa davanti, più sbiadisce (--s = tappa attuale)
        opacity: `clamp(0.04, calc(0.85 - (${-d.z} - var(--s) * ${g.d}) / 3400), 0.85)`,
      }}
    />
  ));
}

function Tunnel() {
  const { ref, step, goTo } = useSteps(N);
  const g = useTunnel();
  const [active, setActive] = useState(0);
  useMotionValueEvent(step, "change", (v) => setActive(Math.min(N - 1, Math.max(0, Math.round(v)))));
  const world = useTransform(step, (s) => `translateZ(${s * g.d}px)`);

  return (
    <div ref={ref} data-steps={N} className="relative" style={{ height: stepsHeight(N, 48) }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden flex flex-col pt-24 pb-20 md:pb-10">
        <div className="relative flex-1 min-h-0 overflow-hidden" style={{ perspective: `${g.persp}px`, perspectiveOrigin: "50% 40%" }}>
          <motion.div className="absolute inset-0 [transform-style:preserve-3d]" style={{ transform: world, "--s": step }}>
            <Road g={g} />
            {timeline.map((t, i) => (
              <TunnelStop key={t.org + t.period} t={t} i={i} step={step} g={g} goTo={goTo} />
            ))}
          </motion.div>
        </div>

        {/* gli anni: dove sei, e per saltare a una tappa */}
        <nav aria-label={ui.timeline.years} className="container mx-auto px-6 flex items-center justify-center gap-1 md:gap-2 flex-wrap">
          {timeline.map((t, i) => (
            <button
              key={t.org + t.period}
              type="button"
              onClick={() => goTo(i)}
              aria-current={i === active ? "step" : undefined}
              aria-label={`${year(t)} · ${t.org}`}
              className={`px-2.5 md:px-3 py-1.5 rounded-full font-mono text-xs transition-colors duration-300 ${
                i === active ? "bg-white/[0.08] text-white" : "text-mist/60 hover:text-white"
              }`}
            >
              {year(t)}
            </button>
          ))}
        </nav>
        <p className="mt-2 text-center text-[11px] font-mono text-mist/50">{ui.timeline.hint}</p>
      </div>
    </div>
  );
}

// Telefono: le tappe in una fila da sfogliare col dito, con la riga degli anni sopra
function TimelineSwipe() {
  const swipe = useSwipe(N);
  return (
    <div className="pb-16">
      <nav aria-label={ui.timeline.years} className="container mx-auto px-6 mb-3 flex items-center justify-between">
        {timeline.map((t, i) => (
          <button
            key={t.org + t.period}
            type="button"
            onClick={() => swipe.goTo(i)}
            aria-current={i === swipe.active ? "step" : undefined}
            aria-label={`${year(t)} · ${t.org}`}
            className={`px-2 py-1.5 rounded-full font-mono text-xs transition-colors duration-300 ${i === swipe.active ? "bg-white/[0.08] text-white" : "text-mist/60"}`}
          >
            {year(t)}
          </button>
        ))}
      </nav>
      <SwipeTrack swipe={swipe} items={timeline} label={ui.timeline.title} render={(t) => <Stop t={t} className="post-card" />} />
      <SwipeDots swipe={swipe} n={N} prev={ui.timeline.prev} next={ui.timeline.next} />
      <p className="mt-3 text-center text-[11px] font-mono text-mist/60 px-6">{ui.timeline.swipe}</p>
    </div>
  );
}

export default function Timeline() {
  const reduce = useReducedMotion();
  const touch = useTouchLayout();
  return (
    <section id="experience" className="relative pt-20 md:pt-28">
      <div className="container mx-auto px-6">
        <SectionHeader index="04" eyebrow={ui.timeline.eyebrow} title={ui.timeline.title} sub={ui.timeline.sub} />
      </div>
      {touch ? (
        <TimelineSwipe />
      ) : reduce ? (
        <div className="container mx-auto px-6 max-w-2xl space-y-6 pb-20">
          {timeline.map((t) => <Stop key={t.org + t.period} t={t} className="post-card" />)}
        </div>
      ) : (
        <Tunnel />
      )}
    </section>
  );
}
