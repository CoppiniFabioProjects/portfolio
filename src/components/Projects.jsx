import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Reveal, SectionHeader, Spotlight, AnimatedLines } from "./primitives";
import { flagship, projects } from "../data/content";

const ACCENT = {
  garuda: { text: "text-garuda", border: "border-garuda/40", bg: "bg-garuda/15", dot: "bg-garuda" },
  lions: { text: "text-lions-gold", border: "border-lions-gold/40", bg: "bg-lions-gold/15", dot: "bg-lions-gold" },
  purple: { text: "text-purple-glow", border: "border-purple/40", bg: "bg-purple/15", dot: "bg-purple" },
};

function Flagship({ p, i }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);
  const a = ACCENT[p.accent] || ACCENT.purple;
  const reverse = i % 2 === 1;

  return (
    <div ref={ref} className="group grid lg:grid-cols-12 gap-6 lg:gap-12 items-center py-6 md:py-10">
      {/* Image */}
      <div className={`lg:col-span-7 ${reverse ? "lg:order-2" : ""}`}>
        <Spotlight className="relative overflow-hidden rounded-3xl aspect-[16/10] glass">
          <motion.img
            style={{ y: imgY, scale: 1.15 }}
            src={p.image}
            alt={`Anteprima del progetto ${p.title}`}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover duotone"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
          <span className={`absolute top-5 left-5 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest border ${a.border} ${a.bg} ${a.text} px-3 py-1 rounded-full backdrop-blur-md`}>
            <span className={`w-1.5 h-1.5 rounded-full ${a.dot} animate-pulse`} /> {p.status}
          </span>
        </Spotlight>
      </div>

      {/* Copy */}
      <div className={`lg:col-span-5 ${reverse ? "lg:order-1" : ""}`}>
        <div className="flex items-center gap-3 mb-5">
          <span className="section-index">.{p.index}</span>
          <span className="kicker">Progetto di punta</span>
        </div>
        <h3 className="display-serif text-white text-4xl sm:text-5xl md:text-6xl mb-4 break-words">
          <AnimatedLines lines={[p.title]} />
        </h3>
        <p className={`display-serif italic text-xl md:text-2xl ${a.text} mb-5`}>{p.tagline}</p>
        <p className="text-mist leading-relaxed mb-6">{p.body}</p>
        <div className="flex flex-wrap gap-2 mb-8">
          {p.tags.map((t) => (
            <span key={t} className="text-[11px] font-mono text-mist border border-white/10 rounded-full px-3 py-1">{t}</span>
          ))}
        </div>
        <a
          href={p.link}
          target="_blank"
          rel="noreferrer"
          className="btn-primary inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest"
        >
          {p.linkLabel} <ArrowUpRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}

export default function Projects() {
  return (
    <section id="projects" className="relative py-20 md:py-28 overflow-hidden">
      <div className="blob bg-purple w-[34rem] h-[34rem] -left-40 top-1/3 opacity-20" />
      <div className="container mx-auto px-6 relative">
        <SectionHeader index="05" eyebrow="Lavori" title="Progetti" sub="Due progetti di punta, e tutto il resto che ho costruito." />

        {/* Flagship duo */}
        <div className="space-y-8 mb-20">
          {flagship.map((p, i) => (
            <Flagship key={p.title} p={p} i={i} />
          ))}
        </div>

        {/* Altri progetti */}
        <Reveal>
          <div className="flex items-center gap-4 mb-8">
            <span className="kicker">Altri lavori</span>
            <span className="flex-1 h-px bg-white/10" />
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6">
          {projects.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.08}>
              <Spotlight className="group glass card-hover rounded-3xl overflow-hidden h-full flex flex-col">
                <div className="relative h-40 overflow-hidden bg-ink-2 grid place-items-center">
                  <img src={p.image} alt={`Anteprima del progetto ${p.title}`} loading="lazy" decoding="async" className="w-full h-full object-cover duotone" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink to-transparent" />
                  {p.status && (
                    <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest border bg-white/10 text-mist border-white/20 px-2.5 py-1 rounded-full backdrop-blur-md">
                      {p.status}
                    </span>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-display text-xl text-white mb-2">{p.title}</h3>
                  <p className="text-sm text-mist leading-relaxed flex-1">{p.body}</p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {p.tags.map((t) => (
                      <span key={t} className="text-[11px] font-mono text-mist border border-white/10 rounded-full px-2.5 py-0.5">{t}</span>
                    ))}
                  </div>
                  {p.link && (
                    <a href={p.link} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-purple-glow hover:gap-2.5 transition-all">
                      Apri <ArrowUpRight className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </Spotlight>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
