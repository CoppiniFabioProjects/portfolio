import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, animate, useMotionValue, useMotionValueEvent, useReducedMotion } from "framer-motion";
import { SectionHeader } from "./primitives";
import Scene3D from "./Scene3D";
import { useSteps, stepsHeight } from "./useSteps";
import { useTouchLayout } from "./useMedia";
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
  const touch = useTouchLayout(); // telefono: niente sezione bloccata, si cambia gruppo con uno swipe
  const n = tech.length;
  const { ref, step, goTo } = useSteps(n);
  const manual = useMotionValue(0); // gruppo scelto a mano (telefono, o "riduci movimento")
  const free = reduce || touch;
  const focus = free ? manual : step;
  const [active, setActive] = useState(0);
  useMotionValueEvent(focus, "change", (v) => setActive(Math.min(n - 1, Math.max(0, Math.round(v)))));
  const choose = (i) => {
    const k = Math.min(n - 1, Math.max(0, i));
    if (!free) return goTo(k);
    setActive(k);
    if (reduce) manual.set(k);
    else animate(manual, k, { duration: 0.7, ease: EASE });
  };
  const g = tech[active];

  // swipe orizzontale sull'orbita: gruppo successivo / precedente (in verticale la pagina scorre)
  const swipeStart = useRef(null);
  const swipeHandlers = touch
    ? {
        onPointerDown: (e) => { swipeStart.current = { x: e.clientX, y: e.clientY }; },
        onPointerUp: (e) => {
          const s0 = swipeStart.current;
          swipeStart.current = null;
          if (!s0) return;
          const dx = e.clientX - s0.x;
          const dy = e.clientY - s0.y;
          if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3) choose(active + (dx < 0 ? 1 : -1));
        },
        onPointerCancel: () => { swipeStart.current = null; },
        style: { touchAction: "pan-y" },
      }
    : {};

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
    <div className={`container mx-auto px-6 flex flex-col lg:grid lg:grid-cols-12 lg:gap-10 lg:items-center ${touch ? "" : "h-full"}`}>
      <div className={`lg:col-span-4 shrink-0 lg:pt-0 ${touch ? "" : "pt-24"}`}>
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

      <div className={`relative lg:col-span-8 lg:h-full ${touch ? "h-[60svh] mt-3" : "flex-1 min-h-0"}`} {...swipeHandlers}>
        <Scene3D key={touch ? "touch" : "desk"} load={loadOrbit} options={{ groups: tech, swipe: touch }} progress={focus} className="absolute inset-0" />
      </div>
      {touch && <p className="mt-1 text-center text-[11px] font-mono text-mist/60">{ui.tech.swipe}</p>}
    </div>
  );

  return (
    <section id="skills" className="relative pt-20 md:pt-28">
      <div className="container mx-auto px-6">
        <SectionHeader index="02" eyebrow={ui.tech.eyebrow} title={ui.tech.title} sub={ui.tech.sub} />
      </div>

      {touch ? (
        <div className="pb-6">{stage}</div>
      ) : reduce ? (
        <div ref={ref} className="h-[85svh]">{stage}</div>
      ) : (
        <div ref={ref} data-steps={n} className="relative" style={{ height: stepsHeight(n, 38) }}>
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
