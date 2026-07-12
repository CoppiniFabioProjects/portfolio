import { ArrowUpRight } from "lucide-react";
import { Reveal, SectionHeader } from "./primitives";
import { timeline } from "../data/content";

export default function Timeline() {
  return (
    <section id="experience" className="relative py-28">
      <div className="container mx-auto px-6">
        <SectionHeader index="04" eyebrow="Percorso" title="Timeline" sub="Dove ho imparato, costruito e insegnato." />

        <div className="relative max-w-3xl">
          {/* vertical line */}
          <div className="absolute left-3 md:left-1/2 top-2 bottom-2 w-px bg-gradient-to-b from-purple via-purple/30 to-transparent md:-translate-x-1/2" />

          <div className="space-y-10">
            {timeline.map((t, i) => (
              <Reveal key={t.org + t.period} direction={i % 2 === 0 ? "left" : "right"}>
                <div className={`relative pl-10 md:pl-0 md:grid md:grid-cols-2 md:gap-10 ${i % 2 === 0 ? "" : "md:[direction:rtl]"}`}>
                  {/* node */}
                  <span className={`absolute left-3 md:left-1/2 top-2 w-3 h-3 rounded-full -translate-x-1/2 ${t.current ? "bg-garuda shadow-[0_0_14px_#2dd4bf]" : "bg-purple shadow-[0_0_14px_#a855f7]"}`} />
                  <div className={`glass card-hover rounded-2xl p-6 [direction:ltr] ${i % 2 === 0 ? "md:text-right md:col-start-1" : "md:col-start-2"}`}>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="font-mono text-xs text-purple-glow">{t.period}</span>
                      {t.current && (
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-garuda/15 text-garuda border border-garuda/30 px-2 py-0.5 rounded-full">
                          In corso
                        </span>
                      )}
                    </div>
                    <h3 className="font-display text-xl text-white">{t.org}</h3>
                    <p className="text-sm font-semibold text-purple-glow/90 mb-2">{t.role}</p>
                    <p className="text-sm text-mist leading-relaxed">{t.body}</p>
                    {t.link && (
                      <a href={t.link} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm text-garuda hover:gap-2.5 transition-all">
                        Documento <ArrowUpRight className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
