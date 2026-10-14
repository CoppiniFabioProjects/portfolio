import { useEffect, useState } from "react";
import { motion, useTransform, useMotionValueEvent, useReducedMotion } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight, Linkedin } from "lucide-react";
import { Reveal, SectionHeader, Spotlight } from "./primitives";
import Icon from "./Icon";
import { useSteps, stepsHeight } from "./useSteps";
import { vetrina, profile } from "../data/content";
import { ui } from "../data/ui";

const posts = vetrina.stories;
const N = posts.length;
const STEP_DEG = 360 / N;
const pad = (i) => String(i).padStart(2, "0");

// distanza (in posti) tra la card i e quella davanti, sull'anello
const ringDist = (i, s) => {
  const d = Math.abs((((i - s) % N) + N) % N);
  return Math.min(d, N - d);
};

// Un post LinkedIn: la card è il contenuto, il 3D è solo il modo di sfogliarli
function Post({ p, i, className = "" }) {
  const garuda = p.accent === "garuda";
  return (
    <article className={`h-full flex flex-col rounded-[1.75rem] p-6 md:p-7 ${className}`}>
      <header className="flex items-center gap-3">
        <img src="/portfolio/fabio-portrait.webp" alt="" className="w-10 h-10 rounded-full object-cover object-top bg-ink-2" loading="lazy" decoding="async" />
        <div className="min-w-0">
          <div className="text-sm font-semibold text-white leading-tight">{profile.name}</div>
          <div className="text-[11px] text-mist truncate">{p.tag}</div>
        </div>
        <span className={`ml-auto w-9 h-9 shrink-0 rounded-xl grid place-items-center border ${garuda ? "bg-garuda/10 border-garuda/30 text-garuda" : "bg-purple/10 border-purple/30 text-purple-glow"}`}>
          <Icon name={p.icon} className="w-4 h-4" />
        </span>
      </header>
      <h3 className="mt-5 font-display text-[1.45rem] md:text-[1.65rem] leading-snug text-white tracking-tight">{p.title}</h3>
      <p className="mt-3 text-[13.5px] md:text-sm text-mist leading-relaxed">{p.body}</p>
      <p className={`mt-4 pl-3 border-l-2 text-sm italic ${garuda ? "border-garuda/50 text-garuda" : "border-purple/50 text-purple-glow"}`}>{p.lesson}</p>
      <footer className="mt-auto pt-5 flex items-center justify-between">
        <a
          href={p.href}
          target="_blank"
          rel="noreferrer"
          className={`inline-flex items-center gap-1.5 text-sm font-semibold ${garuda ? "text-garuda" : "text-purple-glow"} hover:gap-2.5 transition-all`}
          data-post={i}
        >
          <Linkedin className="w-4 h-4" /> {ui.vetrina.readPost} <ArrowUpRight className="w-4 h-4" />
        </a>
        <span className="font-mono text-[11px] text-mist/60">{pad(i + 1)} / {pad(N)}</span>
      </footer>
    </article>
  );
}

// Dimensioni dell'anello in base allo schermo: larghezza card, altezza, raggio
function useRingSize() {
  const get = () => {
    const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
    const vh = typeof window !== "undefined" ? window.innerHeight : 800;
    const w = Math.round(Math.min(vw * 0.84, vw < 768 ? 340 : 460));
    const h = Math.round(Math.min(vh - 230, vw < 768 ? 500 : 430));
    const r = Math.round(w / 2 / Math.tan(Math.PI / N) + (vw < 768 ? 14 : 34));
    return { w, h, r, persp: vw < 768 ? 900 : 1700 };
  };
  const [s, set] = useState(get);
  useEffect(() => {
    const on = () => set(get());
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return s;
}

function RingCard({ p, i, step, size, goTo }) {
  const opacity = useTransform(step, (s) => {
    const d = ringDist(i, s);
    return d < 1 ? 1 - 0.5 * d : Math.max(0, 0.5 - 0.32 * (d - 1));
  });
  const pointer = useTransform(step, (s) => (ringDist(i, s) < 0.5 ? "auto" : "none"));
  // riflesso di luce che scorre sulla card mentre ruota: visibile di sbieco, fuori dalla card quando è davanti
  const sheen = useTransform(step, (s) => {
    const rel = ((((i - s) % N) + N + N / 2) % N) - N / 2;
    return `${Math.min(100, Math.max(0, 90 + rel * 55))}% 0%`;
  });
  return (
    <motion.div
      className="absolute inset-0 [backface-visibility:hidden]"
      style={{ transform: `rotateY(${i * STEP_DEG}deg) translateZ(${size.r}px)`, opacity, pointerEvents: pointer }}
      // con la tastiera: il link di una card dietro la porta davanti
      onFocus={() => goTo(i)}
    >
      <Post p={p} i={i} className="post-card" />
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 rounded-[1.75rem] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.07) 48%, rgba(192,132,252,0.09) 52%, transparent 62%)",
          backgroundSize: "300% 100%",
          backgroundPosition: sheen,
        }}
      />
    </motion.div>
  );
}

function PostsRing() {
  const { ref, step, goTo } = useSteps(N);
  const size = useRingSize();
  const [active, setActive] = useState(0);
  useMotionValueEvent(step, "change", (v) => setActive(((Math.round(v) % N) + N) % N));
  const ring = useTransform(step, (s) => `translateZ(${-size.r}px) rotateX(-4deg) rotateY(${-s * STEP_DEG}deg)`);

  return (
    <div ref={ref} data-steps={N} className="relative" style={{ height: stepsHeight(N, 55) }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden flex flex-col pt-24 pb-20 md:pb-10">
        <div className="container mx-auto px-6 flex items-center gap-4">
          <span className="kicker">{ui.vetrina.field}</span>
          <span className="flex-1 h-px bg-white/10" />
          <span className="hidden sm:block text-xs font-mono text-mist/70">{ui.vetrina.fieldNote}</span>
        </div>

        {/* l'anello: card disposte su un cilindro, ruota con lo scroll */}
        <div
          className="relative flex-1 min-h-0"
          style={{ perspective: `${size.persp}px`, perspectiveOrigin: "50% 42%" }}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") goTo(Math.min(N - 1, active + 1));
            if (e.key === "ArrowLeft") goTo(Math.max(0, active - 1));
          }}
        >
          <div className="absolute left-1/2 top-1/2 w-[70vw] max-w-3xl h-24 -translate-x-1/2 translate-y-[38vh] md:translate-y-[30vh] rounded-[50%] bg-purple/20 blur-3xl" />
          <motion.div
            className="absolute left-1/2 top-1/2 [transform-style:preserve-3d]"
            style={{ width: size.w, height: size.h, marginLeft: -size.w / 2, marginTop: -size.h / 2, transform: ring }}
          >
            {posts.map((p, i) => (
              <RingCard key={p.href} p={p} i={i} step={step} size={size} goTo={goTo} />
            ))}
          </motion.div>
        </div>

        <div className="container mx-auto px-6 flex items-center justify-center gap-5">
          <button
            type="button"
            onClick={() => goTo(Math.max(0, active - 1))}
            disabled={active === 0}
            aria-label={ui.vetrina.prev}
            className="w-10 h-10 grid place-items-center rounded-full border border-white/10 text-mist hover:text-white hover:border-white/25 disabled:opacity-30 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2" aria-hidden="true">
            {posts.map((p, i) => (
              <span key={p.href} className={`h-1.5 rounded-full transition-all duration-500 ${i === active ? "w-6 bg-purple-glow" : "w-1.5 bg-white/20"}`} />
            ))}
          </div>
          <button
            type="button"
            onClick={() => goTo(Math.min(N - 1, active + 1))}
            disabled={active === N - 1}
            aria-label={ui.vetrina.next}
            className="w-10 h-10 grid place-items-center rounded-full border border-white/10 text-mist hover:text-white hover:border-white/25 disabled:opacity-30 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <p className="mt-3 text-center text-[11px] font-mono text-mist/50">{ui.vetrina.hint}</p>
      </div>
    </div>
  );
}

export default function Vetrina() {
  const reduce = useReducedMotion();
  return (
    <section id="about" className="relative pt-20 md:pt-28 pb-20 md:pb-28">
      <div className="container mx-auto px-6">
        <SectionHeader index="01" eyebrow={ui.vetrina.eyebrow} title={ui.vetrina.title} sub={ui.vetrina.sub} />
      </div>

      {/* Storie dal lavoro: ognuna rimanda al post LinkedIn da cui viene */}
      {reduce ? (
        <div className="container mx-auto px-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((p, i) => <Post key={p.href} p={p} i={i} className="post-card" />)}
        </div>
      ) : (
        <PostsRing />
      )}

      {/* Fuori dal codice */}
      <div className="container mx-auto px-6 mt-16 md:mt-20">
        <Reveal>
          <div className="flex items-center gap-4 mb-6">
            <span className="kicker">{ui.vetrina.offCode}</span>
            <span className="flex-1 h-px bg-white/10" />
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6">
          {vetrina.cards.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.08}>
              <Spotlight className="group glass card-hover rounded-3xl overflow-hidden h-full flex flex-col">
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={c.image}
                    alt={c.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
                  <div className={`absolute bottom-4 left-4 w-11 h-11 rounded-xl grid place-items-center backdrop-blur-md border ${c.accent === "garuda" ? "bg-garuda/20 border-garuda/40 text-garuda" : "bg-purple/20 border-purple/40 text-purple-glow"}`}>
                    <Icon name={c.icon} className="w-5 h-5" />
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-display text-white mb-2">{c.title}</h3>
                  <p className="text-sm text-mist leading-relaxed flex-1">{c.body}</p>
                  <a
                    href={c.link.href}
                    target="_blank"
                    rel="noreferrer"
                    className={`mt-4 inline-flex items-center gap-1.5 text-sm font-semibold ${c.accent === "garuda" ? "text-garuda" : "text-purple-glow"} hover:gap-2.5 transition-all`}
                  >
                    {c.link.label} <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>
              </Spotlight>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
