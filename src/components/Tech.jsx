import { Reveal, SectionHeader, Spotlight } from "./primitives";
import Icon from "./Icon";
import { tech } from "../data/content";

export default function Tech() {
  return (
    <section id="skills" className="relative py-20 md:py-28">
      <div className="container mx-auto px-6">
        <SectionHeader
          index="02"
          eyebrow="Arsenale Tecnologico"
          title="Cosa uso per costruire"
          sub="Uno stack moderno, AI-native, dal frontend al cloud."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tech.map((group, i) => (
            <Reveal key={group.title} delay={i * 0.08}>
              <Spotlight className="glass card-hover rounded-3xl p-6 h-full">
                <div className={`w-12 h-12 rounded-2xl grid place-items-center mb-5 border ${group.accent === "garuda" ? "bg-garuda/15 border-garuda/30 text-garuda" : "bg-purple/15 border-purple/30 text-purple-glow"}`}>
                  <Icon name={group.icon} className="w-6 h-6" />
                </div>
                <h3 className="font-display text-lg text-white mb-4">{group.title}</h3>
                <ul className="space-y-2">
                  {group.items.map((it) => (
                    <li key={it} className="flex items-center gap-2 text-sm text-mist">
                      <span className={`w-1 h-1 rounded-full ${group.accent === "garuda" ? "bg-garuda" : "bg-purple"}`} />
                      {it}
                    </li>
                  ))}
                </ul>
              </Spotlight>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
