import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { AnimatedLines, WordReveal } from "./primitives";
import { manifesto } from "../data/content";

export default function Manifesto() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  // Giant faint background word drifts across as you scroll
  const bgX = useTransform(scrollYProgress, [0, 1], ["12%", "-12%"]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.06, 0]);

  return (
    <section id="manifesto" ref={ref} className="relative h-[200vh]">
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
        {/* Drifting watermark */}
        <motion.div
          style={{ x: bgX, opacity: bgOpacity }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <span className="display-xl text-outline whitespace-nowrap">LEVITAS</span>
        </motion.div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <span className="section-index">.00</span>
            <span className="kicker">{manifesto.kicker}</span>
          </div>

          <h2 className="display-serif text-white text-6xl md:text-8xl lg:text-9xl mb-10">
            <AnimatedLines lines={manifesto.lines} stagger={0.15} />
          </h2>

          <p className="max-w-xl text-lg md:text-xl text-mist leading-relaxed">
            <WordReveal text={manifesto.body} />
          </p>
        </div>

        {/* progress hairline at bottom */}
        <motion.div
          style={{ scaleX: scrollYProgress }}
          className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-purple to-garuda origin-left"
        />
      </div>
    </section>
  );
}
