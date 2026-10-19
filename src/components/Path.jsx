import { ArrowUpRight } from "lucide-react";
import { SectionHead, Reveal } from "./primitives";
import { Row } from "./Rows";
import { timeline } from "../data/content";
import { ui } from "../data/ui";

// Il percorso come un registro: quando, dove, cosa. Aprendo, il dettaglio e i documenti.
export default function Path() {
  return (
    <section id="experience" className="gutter pt-[14vh] pb-[10vh]">
      <SectionHead index="04" label={ui.experience.label} sub={ui.experience.sub} />
      <Reveal as="ul" className="border-t border-line dim-others">
        {timeline.map((t) => (
          <Row
            key={t.org + t.period}
            head={
              <div className="grid md:grid-cols-12 gap-x-6 gap-y-1.5 items-baseline">
                <span className="label md:col-span-3 flex items-center gap-2">
                  {t.current && <span className="w-1.5 h-1.5 rounded-full bg-violet blink" aria-hidden="true" />}
                  {t.period}
                  {t.current && <span className="sr-only">— {ui.experience.current}</span>}
                </span>
                <span className="md:col-span-4 text-[clamp(1.5rem,2.8vw,2.6rem)] leading-none tracking-[-0.04em] text-fg">{t.org}</span>
                <span className="md:col-span-5 text-[15px] text-dim">{t.role}</span>
              </div>
            }
          >
            <div className="grid md:grid-cols-12 gap-x-6">
              <div className="md:col-start-4 md:col-span-7 lg:col-span-6">
                <p className="text-[15px] md:text-base leading-relaxed text-dim">{t.body}</p>
                {t.link && (
                  <a href={t.link} target="_blank" rel="noreferrer" className="group mt-6 inline-flex items-center gap-2 text-[15px] text-fg">
                    <span className="u-link-on pb-0.5">{t.linkLabel || ui.experience.document}</span>
                    <ArrowUpRight className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                )}
              </div>
            </div>
          </Row>
        ))}
      </Reveal>
    </section>
  );
}
