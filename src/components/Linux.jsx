import { Reveal, SectionHeader, Spotlight } from "./primitives";
import Icon from "./Icon";
import { linux } from "../data/content";

export default function Linux() {
  return (
    <section id="linux" className="relative py-28 overflow-hidden">
      <div className="blob bg-garuda w-[30rem] h-[30rem] -right-40 top-10 opacity-20" />
      <div className="container mx-auto px-6 relative">
        <SectionHeader
          index="03"
          eyebrow="🐧 Ecosistema"
          title={<>Vivo in <span className="text-garuda">{linux.distro}</span></>}
          sub="Arch-based, tiling, terminale-first. L'ambiente dove tutto prende forma."
        />

        {/* Terminal mockup */}
        <Reveal>
          <Spotlight className="glass rounded-2xl overflow-hidden mb-10 max-w-3xl">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/[0.02]">
              <span className="w-3 h-3 rounded-full bg-lions-red/80" />
              <span className="w-3 h-3 rounded-full bg-lions-gold/80" />
              <span className="w-3 h-3 rounded-full bg-garuda/80" />
              <span className="ml-3 text-xs font-mono text-mist">fabio@garuda ~ zsh</span>
            </div>
            <div className="p-5 font-mono text-sm leading-relaxed">
              <p><span className="text-garuda">➜</span> <span className="text-purple-glow">~</span> neofetch</p>
              <p className="text-mist mt-1">OS: <span className="text-white">Garuda Linux (Arch)</span></p>
              <p className="text-mist">WM: <span className="text-white">Hyprland (Wayland)</span></p>
              <p className="text-mist">Shell: <span className="text-white">zsh + oh-my-zsh</span></p>
              <p className="text-mist">Editor: <span className="text-white">Cursor / Claude Code</span></p>
              <p className="mt-1"><span className="text-garuda">➜</span> <span className="text-purple-glow">~</span> <span className="animate-pulse">▋</span></p>
            </div>
          </Spotlight>
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
