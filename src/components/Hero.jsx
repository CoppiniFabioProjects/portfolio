import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DustImage } from "../dust/Dust";
import { profile } from "../data/content";
import { ui } from "../data/ui";
import { lang } from "../i18n";

const EASE = [0.22, 1, 0.36, 1];

// l'ora di Pistoia, aggiornata ogni minuto
function useClock() {
  const fmt = () =>
    new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "it-IT", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Rome" }).format(new Date());
  const [t, set] = useState(fmt);
  useEffect(() => {
    const id = setInterval(() => set(fmt()), 30_000);
    return () => clearInterval(id);
  }, []);
  return t;
}

// Il nome lettera per lettera, che sale da sotto la riga
function Name() {
  const [first, last] = profile.name.split(" ");
  const letters = (w, base) =>
    [...w].map((ch, i) => (
      <span key={i} className="inline-block overflow-hidden align-bottom pb-[0.06em] -mb-[0.06em]">
        <motion.span
          className="inline-block"
          initial={{ y: "102%" }}
          animate={{ y: "0%" }}
          transition={{ duration: 1.25, ease: EASE, delay: 0.55 + (base + i) * 0.045 }}
        >
          {ch}
        </motion.span>
      </span>
    ));
  return (
    <h1 className="text-fg font-medium leading-[0.8] tracking-[-0.065em] text-[24vw] md:text-[14.8vw] md:whitespace-nowrap -ml-[0.04em]">
      <span className="sr-only">{profile.name}</span>
      <span aria-hidden="true" className="block md:inline">{letters(first, 0)}</span>
      <span aria-hidden="true" className="hidden md:inline"> </span>
      <span aria-hidden="true" className="block md:inline">{letters(last, first.length)}</span>
    </h1>
  );
}

export default function Hero() {
  const time = useClock();
  const [touch] = useState(() => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches);
  return (
    <section id="hero" className="relative h-[100svh] min-h-[560px] flex flex-col">
      <div className="relative flex-1 min-h-0 grid place-items-center pt-16">
        <div className="relative">
          <DustImage
            id="garuda"
            src="/portfolio/garuda.png"
            alt=""
            width={460}
            height={460}
            fetchPriority="high"
            interactive
            className="block w-[min(80vw,40svh,500px)] md:w-[min(46vw,50svh,520px)] h-auto select-none"
            draggable={false}
          />
          <motion.span
            className="label absolute left-1/2 -translate-x-1/2 -bottom-2 whitespace-nowrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 3.2, duration: 1.2 }}
            aria-hidden="true"
          >
            ({touch ? ui.hero.touch : ui.hero.hover})
          </motion.span>
        </div>
      </div>

      <div className="gutter pb-6 md:pb-9">
        <motion.ul
          className="grid gap-y-1.5 md:grid-cols-4 md:gap-x-6 mb-5 md:mb-7 text-[13px] leading-snug"
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.08, delayChildren: 1.15 } } }}
        >
          {ui.hero.lines.map(([a, b]) => (
            <motion.li
              key={a}
              variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } } }}
            >
              <span className="text-fg">{a}</span>
              <span className="text-dim"> — {b}</span>
            </motion.li>
          ))}
          <motion.li
            className="hidden md:block text-right text-dim tabular-nums"
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.9 } } }}
          >
            {ui.hero.place} · {time}
          </motion.li>
        </motion.ul>
        <Name />
      </div>
    </section>
  );
}
