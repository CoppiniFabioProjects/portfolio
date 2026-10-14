import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useMotionValueEvent, useReducedMotion } from "framer-motion";
import { SectionHeader } from "./primitives";
import Scene3D from "./Scene3D";
import { useSteps, stepsHeight, StepSnaps } from "./useSteps";
import { tech } from "../data/content";
import { ui } from "../data/ui";

const loadOrbit = () => import("../three/techOrbit");
const pad = (i) => String(i).padStart(2, "0");
const EASE = [0.22, 1, 0.36, 1];

// Le competenze sono l'orbita: ogni gruppo è un anello, scorrendo si passa da un gruppo
// all'altro e quello a fuoco mostra tutte le sue tecnologie. Niente elenchi doppi:
// l'elenco testuale c'è solo per screen reader e motori di ricerca.
export default function Tech() {
  const reduce = useReducedMotion();
  const n = tech.length;
  const { ref, step, goTo } = useSteps(n);
  const manual = useMotionValue(0); // con "riduci movimento": niente scroll a tappe, si sceglie dai pulsanti
  const focus = reduce ? manual : step;
  const [active, setActive] = useState(0);
  useMotionValueEvent(focus, "change", (v) => setActive(Math.min(n - 1, Math.max(0, Math.round(v)))));
  const choose = (i) => (reduce ? manual.set(i) : goTo(i));
  const g = tech[active];

  // su mobile i pulsanti stanno in una riga scorrevole: quello attivo va portato in vista
  // (scorrendo solo la riga, non la pagina)
  const chips = useRef(null);
  useEffect(() => {
    const row = chips.current;
    const btn = row?.children[active];
    if (!row || !btn || row.scrollWidth <= row.clientWidth) return;
    row.scrollTo({ left: btn.offsetLeft - (row.clientWidth - btn.offsetWidth) / 2, behavior: "smooth" });
  }, [active]);

  const stage = (
    <div className="container mx-auto px-6 h-full flex flex-col lg:grid lg:grid-cols-12 lg:gap-10 lg:items-center">
      <div className="lg:col-span-4 shrink-0 pt-24 lg:pt-0">
        <div className="font-mono text-xs text-mist">
          <span className="text-purple-glow">.{pad(active + 1)}</span> / {pad(n)}
        </div>
        <div className="relative h-[2.6rem] md:h-[3.6rem] mt-2">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.h3
              key={active}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.45, delay: 0.12, ease: EASE } }}
              exit={{ opacity: 0, y: -14, transition: { duration: 0.16 } }}
              className="absolute inset-x-0 top-0 font-display text-3xl md:text-[2.75rem] leading-tight text-white tracking-tight whitespace-nowrap"
            >
              {g.title}
            </motion.h3>
          </AnimatePresence>
        </div>
        <p className="text-sm text-mist">
          <span className={g.accent === "garuda" ? "text-garuda" : "text-purple-glow"}>{g.items.length}</span> {ui.tech.count}
        </p>

        <nav ref={chips} aria-label={ui.tech.groups} className="relative mt-5 lg:mt-8 -mx-6 px-6 lg:mx-0 lg:px-0 flex lg:flex-col lg:items-start gap-2 overflow-x-auto no-scrollbar">
          {tech.map((t, i) => (
            <button
              key={t.title}
              type="button"
              onClick={() => choose(i)}
              aria-pressed={i === active}
              className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap border transition-colors duration-300 ${
                i === active ? "bg-white/[0.08] border-white/20 text-white" : "border-white/[0.08] text-mist hover:text-white"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${t.accent === "garuda" ? "bg-garuda" : "bg-purple-glow"} ${i === active ? "opacity-100" : "opacity-40"}`} />
              {t.title}
            </button>
          ))}
        </nav>
        <p className="hidden lg:block mt-8 text-xs font-mono text-mist/60 max-w-xs">{ui.tech.hint}</p>
      </div>

      <div className="relative flex-1 min-h-0 lg:col-span-8 lg:h-full">
        <Scene3D load={loadOrbit} options={{ groups: tech }} progress={focus} className="absolute inset-0" />
      </div>
    </div>
  );

  return (
    <section id="skills" className="relative pt-20 md:pt-28">
      <div className="container mx-auto px-6">
        <SectionHeader index="02" eyebrow={ui.tech.eyebrow} title={ui.tech.title} sub={ui.tech.sub} />
      </div>

      {reduce ? (
        <div ref={ref} className="h-[85svh]">{stage}</div>
      ) : (
        <div ref={ref} data-steps={n} className="relative" style={{ height: stepsHeight(n, 38) }}>
          <StepSnaps n={n} />
          <div className="sticky top-0 h-[100svh] overflow-hidden">{stage}</div>
        </div>
      )}

      <ul className="sr-only">
        {tech.map((t) => (
          <li key={t.title}>{t.title}: {t.items.join(", ")}</li>
        ))}
      </ul>
    </section>
  );
}
