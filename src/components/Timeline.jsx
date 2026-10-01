import { ArrowUpRight } from "lucide-react";
import { Reveal, SectionHeader } from "./primitives";
import { timeline } from "../data/content";

export default function Timeline() {
  return (
    <section id="experience" className="relative py-20 md:py-28">
      <div className="container mx-auto px-6">
        <SectionHeader index="04" eyebrow="Percorso" title="Timeline" sub="Dove ho imparato, costruito e insegnato." />

        <div className="relative max-w-2xl">
          {/* rail verticale */}
          <div className="absolute left-[11px] top-3 bottom-6 w-px bg-gradient-to-b from-purple via-purple/40 to-transparent" />

          <div className="space-y-6 md:space-y-7">
            {timeline.map((t, i) => (
              <Reveal key={t.org + t.period} delay={i * 0.05}>
                <div className="relative pl-12">
                  {/* nodo sul rail */}
                  <span
                    className={`absolute left-[11px] top-5 -translate-x-1/2 w-3.5 h-3.5 rounded-full ring-4 ring-ink ${
                      t.current ? "bg-garuda shadow-[0_0_14px_#2dd4bf]" : "bg-purple shadow-[0_0_14px_#a855f7]"
                    }`}
                  />
                  <div className="glass card-hover rounded-2xl p-5 md:p-6">
                    <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                      <span className="font-mono text-xs text-purple-glow">{t.period}</span>
                      {t.current && (
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-garuda/15 text-garuda border border-garuda/30 px-2 py-0.5 rounded-full">
                          In corso
                        </span>
                      )}
                    </div>
                    <h3 className="font-display text-xl text-white leading-tight">{t.org}</h3>
                    <p className="text-sm font-semibold text-purple-glow/90 mb-2">{t.role}</p>
                    <p className="text-sm text-mist leading-relaxed">{t.body}</p>
                    {t.link && (
                      <a
                        href={t.link}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 text-sm text-garuda hover:gap-2.5 transition-all"
                      >
                        {t.linkLabel || "Documento"} <ArrowUpRight className="w-4 h-4" />
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
