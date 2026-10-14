import { useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { SectionHeader } from "./primitives";
import Scene3D from "./Scene3D";
import { useSteps, stepsHeight, StepSnaps } from "./useSteps";
import { flagship, projects } from "../data/content";
import { ui } from "../data/ui";

const loadDevices = () => import("../three/devices");
const pad = (i) => String(i).padStart(2, "0");
const EASE = [0.22, 1, 0.36, 1];

// Tutti i progetti in fila: prima quelli di punta, poi gli altri
const items = [
  ...flagship.map((p) => ({ ...p, flagship: true })),
  ...projects.map((p, i) => ({ ...p, index: pad(flagship.length + i + 1) })),
];
const N = items.length;

const ACCENT = {
  garuda: { text: "text-garuda", border: "border-garuda/40", bg: "bg-garuda/15", dot: "bg-garuda", glow: "bg-garuda/25" },
  lions: { text: "text-lions-gold", border: "border-lions-gold/40", bg: "bg-lions-gold/15", dot: "bg-lions-gold", glow: "bg-lions-gold/15" },
  purple: { text: "text-purple-glow", border: "border-purple/40", bg: "bg-purple/15", dot: "bg-purple", glow: "bg-purple/25" },
};

// Lo schema "da → via → a" in HTML, per quando il 3D non c'è
function Diagram({ d, className = "" }) {
  const Box = ({ t, s, hl }) => (
    <div className={`flex-1 rounded-xl border px-3 py-4 text-center ${hl ? "border-purple-glow bg-purple/15" : "border-white/20 bg-white/[0.03]"}`}>
      <div className="text-sm font-semibold text-white">{t}</div>
      {s && <div className="mt-1 font-mono text-[11px] text-garuda">{s}</div>}
    </div>
  );
  return (
    <div className={`post-card rounded-2xl p-5 ${className}`}>
      <div className="flex items-center gap-2">
        <Box t={d.from[0]} s={d.from[1]} />
        <span className="text-purple-glow">⇄</span>
        <Box t={d.via} hl />
        <span className="text-purple-glow">⇄</span>
        <Box t={d.to[0]} s={d.to[1]} />
      </div>
      {d.note && <p className="mt-4 text-center font-mono text-xs text-mist">✓ {d.note}</p>}
    </div>
  );
}

// Anteprima piatta del progetto: mentre il 3D si prepara, o se il 3D non c'è
function Preview({ p }) {
  return p.image ? (
    <img src={p.image} alt="" decoding="async" className="absolute inset-0 m-auto max-h-[78%] max-w-[86%] rounded-2xl object-contain shadow-2xl shadow-black/60" />
  ) : (
    <Diagram d={p.screen.diagram} className="absolute inset-0 m-auto h-fit max-w-[92%]" />
  );
}

function ProjectText({ p }) {
  const a = ACCENT[p.accent] || ACCENT.purple;
  return (
    <div>
      <div className="flex items-center gap-3 mb-3 md:mb-5">
        <span className="section-index">.{p.index}</span>
        <span className="kicker">{p.flagship ? ui.projects.flagship : ui.projects.others}</span>
        {p.status && (
          <span className={`ml-auto lg:ml-2 inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest border ${a.border} ${a.bg} ${a.text} px-2.5 py-0.5 rounded-full`}>
            <span className={`w-1.5 h-1.5 rounded-full ${a.dot} animate-pulse`} /> {p.status}
          </span>
        )}
      </div>
      <h3 className="display-serif text-white text-[2rem] sm:text-5xl lg:text-6xl leading-none mb-2 md:mb-4 break-words">{p.title}</h3>
      {p.tagline && <p className={`display-serif italic text-lg md:text-2xl ${a.text} mb-3 md:mb-5`}>{p.tagline}</p>}
      <p className="text-sm md:text-base text-mist leading-relaxed mb-4 md:mb-6">{p.body}</p>
      {p.metrics && (
        <div className="grid grid-cols-3 gap-3 md:gap-6 mb-4 md:mb-6 border-y border-white/10 py-3 md:py-5">
          {p.metrics.map((m) => (
            <div key={m.label}>
              <div className={`font-display text-lg md:text-3xl leading-none ${a.text}`}>{m.value}</div>
              <div className="mt-1 text-[9px] md:text-[11px] uppercase tracking-widest text-mist leading-tight">{m.label}</div>
            </div>
          ))}
        </div>
      )}
      <div className="hidden md:flex flex-wrap gap-2 mb-7">
        {p.tags.map((t) => (
          <span key={t} className="text-[11px] font-mono text-mist border border-white/10 rounded-full px-3 py-1">{t}</span>
        ))}
      </div>
      {p.link && (
        <a
          href={p.link}
          target="_blank"
          rel="noreferrer"
          className="btn-primary inline-flex items-center gap-2 px-6 md:px-7 py-3 md:py-3.5 rounded-full text-xs font-bold uppercase tracking-widest"
        >
          {p.linkLabel || ui.projects.open} <ArrowUpRight className="w-4 h-4" />
        </a>
      )}
    </div>
  );
}

// Il palco: un solo dispositivo 3D (telefono o portatile) con lo schermo del progetto,
// e accanto il testo del progetto. Scorrendo il dispositivo gira e diventa il successivo.
function DeviceStage() {
  const { ref, step, goTo } = useSteps(N);
  const [active, setActive] = useState(0);
  useMotionValueEvent(step, "change", (v) => setActive(Math.min(N - 1, Math.max(0, Math.round(v)))));
  const p = items[active];
  const a = ACCENT[p.accent] || ACCENT.purple;

  return (
    <div ref={ref} data-steps={N} className="relative" style={{ height: stepsHeight(N, 65) }}>
      <StepSnaps n={N} />
      <div className="sticky top-0 h-[100svh] overflow-hidden flex flex-col pt-20 lg:pt-24 pb-20 lg:pb-8">
        <div className="container mx-auto px-6 flex-1 min-h-0 flex flex-col lg:grid lg:grid-cols-12 lg:gap-12 lg:items-center">
          <div className="relative h-[30svh] sm:h-[38svh] lg:h-full lg:col-span-7 shrink-0">
            <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full blur-[100px] transition-colors duration-700 ${a.glow}`} />
            <Scene3D
              load={loadDevices}
              options={{ items }}
              progress={step}
              className="absolute inset-0"
              fallback={<Preview p={p} />}
              placeholder={<Preview p={items[0]} />}
            />
          </div>

          {/* tutti i testi nella pagina (per motori di ricerca e AI), uno sopra l'altro:
              si vede ed è raggiungibile solo quello del progetto mostrato */}
          <div className="relative flex-1 min-h-0 lg:col-span-5 mt-4 lg:mt-0 grid">
            {items.map((it, i) => (
              <motion.div
                key={it.title}
                className="[grid-area:1/1] self-start lg:self-center"
                initial={false}
                animate={
                  i === active
                    ? { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.15, ease: EASE } }
                    : { opacity: 0, y: i < active ? -16 : 24, transition: { duration: 0.18 } }
                }
                style={{ pointerEvents: i === active ? "auto" : "none" }}
                inert={i === active ? undefined : ""}
              >
                <ProjectText p={it} />
              </motion.div>
            ))}
          </div>
        </div>

        <nav aria-label={ui.projects.list} className="container mx-auto px-6 mt-3 lg:mt-6 flex items-center justify-center gap-1 lg:gap-2">
          {items.map((it, i) => (
            <button
              key={it.title}
              type="button"
              onClick={() => goTo(i)}
              aria-current={i === active ? "step" : undefined}
              aria-label={it.title}
              className={`px-2.5 lg:px-3.5 py-1.5 rounded-full text-xs transition-colors duration-300 ${
                i === active ? "bg-white/[0.08] text-white" : "text-mist/60 hover:text-white"
              }`}
            >
              <span className="font-mono">{it.index}</span>
              <span className="hidden lg:inline ml-2">{it.title}</span>
            </button>
          ))}
        </nav>
        <p className="mt-2 text-center text-[11px] font-mono text-mist/50">{ui.projects.hint}</p>
      </div>
    </div>
  );
}

export default function Projects() {
  const reduce = useReducedMotion();
  return (
    <section id="projects" className="relative pt-20 md:pt-28">
      <div className="container mx-auto px-6">
        <SectionHeader index="05" eyebrow={ui.projects.eyebrow} title={ui.projects.title} sub={ui.projects.sub} />
      </div>
      {reduce ? (
        <div className="container mx-auto px-6 space-y-16 pb-20">
          {items.map((p) => (
            <div key={p.title} className="grid lg:grid-cols-12 gap-8 items-center">
              {p.image ? (
                <img src={p.image} alt={`${ui.projects.preview} ${p.title}`} loading="lazy" decoding="async" className="lg:col-span-6 w-full max-h-[420px] object-contain rounded-2xl" />
              ) : (
                <Diagram d={p.screen.diagram} className="lg:col-span-6" />
              )}
              <div className="lg:col-span-6"><ProjectText p={p} /></div>
            </div>
          ))}
        </div>
      ) : (
        <DeviceStage />
      )}
    </section>
  );
}
