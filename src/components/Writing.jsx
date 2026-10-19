import { ArrowUpRight } from "lucide-react";
import { SectionHead, Reveal } from "./primitives";
import { Row } from "./Rows";
import { vetrina } from "../data/content";
import { ui } from "../data/ui";

const pad = (i) => String(i + 1).padStart(2, "0");

// I post di LinkedIn come un indice: il titolo è il gancio, aprendo c'è la storia e la lezione
export default function Writing() {
  return (
    <section id="writing" className="gutter pt-[14vh] pb-[10vh]">
      <SectionHead index="03" label={ui.writing.label} sub={ui.writing.sub} />
      <Reveal as="ul" className="border-t border-line dim-others">
        {vetrina.stories.map((s, i) => (
          <Row
            key={s.href}
            head={
              <div className="grid md:grid-cols-12 gap-x-6 gap-y-2 items-baseline">
                <span className="label md:col-span-1 text-fg/80">{pad(i)}</span>
                <span className="label md:col-span-3 md:order-none -mt-1 md:mt-0">{s.tag}</span>
                <span className="md:col-span-8 text-[clamp(1.35rem,2.6vw,2.4rem)] leading-[1.08] tracking-[-0.035em] text-fg">{s.title}</span>
              </div>
            }
          >
            <div className="grid md:grid-cols-12 gap-x-6">
              <div className="md:col-start-5 md:col-span-7 lg:col-span-6">
                <p className="text-[15px] md:text-base leading-relaxed text-dim">{s.body}</p>
                <p className="serif-i mt-6 text-[clamp(1.3rem,2vw,1.75rem)] leading-snug text-fg">
                  <span className="sr-only">{ui.writing.lesson}: </span>«{s.lesson}»
                </p>
                <a href={s.href} target="_blank" rel="noreferrer" className="group mt-7 inline-flex items-center gap-2 text-[15px] text-fg">
                  <span className="u-link-on pb-0.5">{ui.writing.read}</span>
                  <ArrowUpRight className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </div>
            </div>
          </Row>
        ))}
      </Reveal>
    </section>
  );
}
