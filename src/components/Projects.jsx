import { ArrowUpRight, Sparkles } from "lucide-react";
import { Reveal, SectionHeader, Spotlight } from "./primitives";
import { projects } from "../data/content";

export default function Projects() {
  const hero = projects.find((p) => p.hero);
  const rest = projects.filter((p) => !p.hero);

  return (
    <section id="projects" className="relative py-28 overflow-hidden">
      <div className="blob bg-purple w-[34rem] h-[34rem] -left-40 top-1/3 opacity-20" />
      <div className="container mx-auto px-6 relative">
        <SectionHeader index="05" eyebrow="Lavori" title="Progetti" sub="Ciò che ho costruito, dal gestionale al robotico." />

        {/* Hero project */}
        {hero && (
          <Reveal>
            <Spotlight className="group relative glass card-hover rounded-3xl overflow-hidden mb-8">
              <div className="grid lg:grid-cols-2">
                <div className="relative h-64 lg:h-auto overflow-hidden">
                  <img src={hero.image} alt={hero.title} className="w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-ink lg:bg-gradient-to-l" />
                </div>
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  {hero.status && (
                    <span className={`self-start inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest border px-3 py-1 rounded-full mb-5 ${hero.status === "Live" ? "bg-garuda/15 text-garuda border-garuda/30" : "bg-purple/15 text-purple-glow border-purple/30"}`}>
                      {hero.status === "Live" ? <span className="w-1.5 h-1.5 rounded-full bg-garuda animate-pulse" /> : <Sparkles className="w-3 h-3" />} {hero.status}
                    </span>
                  )}
                  <h3 className="font-display text-3xl md:text-4xl text-white mb-3">{hero.title}</h3>
                  <p className="text-lg text-purple-glow/90 font-display italic mb-3">{hero.tagline}</p>
                  <p className="text-mist leading-relaxed mb-6">{hero.body}</p>
                  <div className="flex flex-wrap gap-2">
                    {hero.tags.map((t) => (
                      <span key={t} className="text-xs font-mono text-mist border border-white/10 rounded-full px-3 py-1">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </Spotlight>
          </Reveal>
        )}

        {/* Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {rest.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.08}>
              <Spotlight className="group glass card-hover rounded-3xl overflow-hidden h-full flex flex-col">
                <div className="relative h-40 overflow-hidden bg-ink-2 grid place-items-center">
                  <img src={p.image} alt={p.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-85 group-hover:scale-105 transition-all duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink to-transparent" />
                  {p.status && (
                    <span className={`absolute top-3 right-3 inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest border px-2.5 py-1 rounded-full backdrop-blur-md ${p.status === "Live" ? "bg-garuda/15 text-garuda border-garuda/30" : "bg-white/10 text-mist border-white/20"}`}>
                      {p.status === "Live" && <span className="w-1.5 h-1.5 rounded-full bg-garuda animate-pulse" />}
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
