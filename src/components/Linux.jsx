import { Reveal, SectionHeader, Spotlight } from "./primitives";
import Icon from "./Icon";
import Terminal from "./Terminal";
import { linux } from "../data/content";
import { ui } from "../data/ui";

export default function Linux() {
  return (
    <section id="linux" className="relative py-20 md:py-28 overflow-hidden">
      <div className="blob bg-garuda w-[30rem] h-[30rem] -right-40 top-10 opacity-20" />
      <div className="container mx-auto px-6 relative">
        <SectionHeader
          index="03"
          eyebrow={ui.linux.eyebrow}
          title={<>{ui.linux.titleBefore}<span className="text-garuda">{linux.distro}</span></>}
          sub={ui.linux.sub}
        />

        {/* Terminale interattivo */}
        <Reveal>
          <div className="mb-4">
            <Terminal />
          </div>
          <p className="text-xs text-mist/50 font-mono mb-10">
            {ui.linux.hintBefore}<span className="text-garuda">whoami</span>, <span className="text-garuda">projects</span>, <span className="text-garuda">skills</span>{ui.linux.hintOr}<span className="text-garuda">help</span>
          </p>
        </Reveal>

        <div className="grid sm:grid-cols-2 gap-6">
          {linux.points.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.08}>
              <Spotlight className="glass card-hover rounded-3xl p-6 flex gap-4">
                <div className="shrink-0 w-11 h-11 rounded-xl bg-garuda/15 border border-garuda/30 grid place-items-center text-garuda">
                  <Icon name={p.icon} className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg text-white mb-1">{p.title}</h3>
                  <p className="text-sm text-mist leading-relaxed">{p.body}</p>
                </div>
              </Spotlight>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
