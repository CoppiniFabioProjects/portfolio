import { SquareTerminal, Gamepad2 } from "lucide-react";
import { SectionHead, Reveal } from "./primitives";
import { openPanel } from "./Panels";
import { tech, linux } from "../data/content";
import { ui } from "../data/ui";

// Gli strumenti come un colophon: sei gruppi, un elenco ciascuno. Niente barre né percentuali.
export default function Skills() {
  return (
    <section id="skills" className="gutter pt-[14vh] pb-[10vh]">
      <SectionHead index="05" label={ui.skills.label} sub={ui.skills.sub} />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 md:gap-y-16">
        {tech.map((g, i) => (
          <Reveal key={g.title} delay={(i % 3) * 0.08} className="border-t border-line pt-4">
            <h3 className="label mb-5 text-fg/80">{g.title}</h3>
            <ul className="space-y-1.5 text-[15px] md:text-[17px] leading-snug text-fg/90">
              {g.items.map((t) => <li key={t}>{t}</li>)}
            </ul>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-20 md:mt-28 border-t border-line pt-6 flex flex-col md:flex-row md:items-end gap-6 md:gap-10">
        <p className="flex-1 text-[clamp(1.4rem,2.6vw,2.4rem)] leading-[1.1] tracking-[-0.03em] text-dim">
          {ui.skills.linux[0]}<span className="text-fg">{linux.distro}</span>{ui.skills.linux[1]}
        </p>
        <div className="flex gap-3">
          <button type="button" onClick={() => openPanel("terminal")} className="btn-ghost inline-flex items-center gap-2 rounded-full px-5 py-3 text-[13px] text-fg">
            <SquareTerminal className="w-4 h-4" /> {ui.skills.terminal}
          </button>
          <button type="button" onClick={() => openPanel("game")} className="btn-ghost inline-flex items-center gap-2 rounded-full px-5 py-3 text-[13px] text-fg">
            <Gamepad2 className="w-4 h-4" /> {ui.skills.play}
          </button>
        </div>
      </Reveal>
    </section>
  );
}
