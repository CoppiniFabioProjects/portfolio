import { GraduationCap, FileText, Award, ArrowUpRight } from "lucide-react";
import { Reveal, SectionHeader, Spotlight } from "./primitives";
import Icon from "./Icon";
import { vetrina } from "../data/content";

export default function Vetrina() {
  return (
    <section id="about" className="relative py-20 md:py-28">
      <div className="container mx-auto px-6">
        <SectionHeader
          index="01"
          eyebrow="Chi sono"
          title="Vetrina"
          sub="Un approccio multidisciplinare che fonde tecnologia e umanesimo."
        />

        {/* Main card */}
        <Reveal>
          <Spotlight className="glass card-hover rounded-3xl p-8 md:p-12 mb-8">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple to-purple-dark grid place-items-center shadow-lg shadow-purple/30">
                    <GraduationCap className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-display text-white">{vetrina.main.title}</h3>
                    <p className="text-purple-glow text-sm font-mono">{vetrina.main.subtitle}</p>
                  </div>
                </div>
                <p className="text-mist leading-relaxed">{vetrina.main.body}</p>
                <a
                  href={vetrina.main.link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-ghost inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wider text-white"
                >
                  <ArrowUpRight className="w-4 h-4" /> {vetrina.main.link.label}
                </a>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-purple/25 bg-gradient-to-br from-purple/20 to-transparent p-6 text-center">
                  <FileText className="w-6 h-6 text-purple-glow mx-auto mb-3" />
                  <div className="text-3xl font-black text-white">{vetrina.main.stats[0].value}</div>
                  <div className="text-[9px] font-bold uppercase tracking-widest text-mist mt-1">{vetrina.main.stats[0].label}</div>
                </div>
                <div className="rounded-2xl border border-garuda/25 bg-gradient-to-br from-garuda/20 to-transparent p-6 text-center">
                  <Award className="w-6 h-6 text-garuda mx-auto mb-3" />
                  <div className="text-3xl font-black text-white">{vetrina.main.stats[1].value}</div>
                  <div className="text-[9px] font-bold uppercase tracking-widest text-mist mt-1">{vetrina.main.stats[1].label}</div>
                </div>
              </div>
            </div>
          </Spotlight>
        </Reveal>

        {/* Secondary cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {vetrina.cards.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.08}>
              <Spotlight className="group glass card-hover rounded-3xl overflow-hidden h-full flex flex-col">
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={c.image}
                    alt={c.title}
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

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-6 mt-12">
          {vetrina.stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08}>
              <div className="text-center glass rounded-2xl py-8">
                <div className="text-4xl md:text-5xl font-display text-gradient-purple">{s.value}</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-mist mt-2">{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
