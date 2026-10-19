import { useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "./primitives";
import { vetrina } from "../data/content";
import { ui } from "../data/ui";

// Fuori dal codice: tre righe. Su desktop la foto segue il cursore sulla riga, su telefono sta accanto.
export default function Life() {
  const [hover, setHover] = useState(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 28, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 260, damping: 28, mass: 0.6 });
  const onMove = (e) => { x.set(e.clientX); y.set(e.clientY); };

  return (
    <section id="life" className="gutter pt-[10vh] pb-[16vh]">
      <Reveal y={12} className="label border-t border-line pt-4 flex justify-between mb-8">
        <span>(06)</span>
        <h2>{ui.life.label}</h2>
      </Reveal>
      <ul className="dim-others" onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
        {vetrina.cards.map((c, i) => (
          <li key={c.title} className="border-b border-line" onMouseEnter={() => setHover(i)}>
            <a href={c.link.href} target="_blank" rel="noreferrer" className="group flex items-center gap-5 py-6 md:py-7">
              <img src={c.image} alt="" loading="lazy" decoding="async" className="md:hidden w-16 h-16 rounded-lg object-cover shrink-0" />
              <div className="flex-1 min-w-0 md:grid md:grid-cols-12 md:gap-x-6 md:items-baseline">
                <span className="block md:col-span-5 text-[clamp(1.4rem,3vw,2.8rem)] leading-none tracking-[-0.04em] text-fg">{c.title}</span>
                <span className="block md:col-span-6 mt-2 md:mt-0 text-[14px] md:text-[15px] leading-relaxed text-dim">{c.body}</span>
              </div>
              <ArrowUpRight className="w-5 h-5 text-dim group-hover:text-fg shrink-0 transition-[color,transform] duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </li>
        ))}
      </ul>

      {/* la foto che segue il cursore */}
      <motion.div aria-hidden="true" className="hidden md:block fixed top-0 left-0 z-40 pointer-events-none" style={{ x: sx, y: sy }}>
        <AnimatePresence>
          {hover !== null && (
            <motion.img
              key={hover}
              src={vetrina.cards[hover].image}
              alt=""
              initial={{ opacity: 0, scale: 0.85, rotate: -4 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="absolute max-w-none -translate-x-1/2 -translate-y-[115%] w-56 h-40 object-cover rounded-xl shadow-2xl shadow-black/70"
            />
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
