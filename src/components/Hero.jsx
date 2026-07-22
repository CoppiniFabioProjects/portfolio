import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { AnimatedLines } from "./primitives";
import { profile } from "../data/content";

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const garudaY = useTransform(scrollYProgress, [0, 1], [0, 260]);
  const garudaScale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <section ref={ref} id="hero" className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-28 pb-16">
      {/* Ambient */}
      <div className="blob animate-blob bg-purple w-[40rem] h-[40rem] -top-40 -left-40" />
      <div className="blob animate-blob bg-garuda w-[30rem] h-[30rem] top-1/3 -right-40" style={{ animationDelay: "4s" }} />

      {/* Garuda */}
      <motion.div style={{ y: garudaY, scale: garudaScale }} className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <img
          src="/portfolio/garuda.png"
          alt=""
          aria-hidden="true"
          className="w-[92vw] md:w-[620px] max-w-none object-contain opacity-[0.12] animate-pulse-slow drop-shadow-[0_0_60px_rgba(168,85,247,0.35)]"
        />
      </motion.div>

      {/* Ritratto — sfuma nel fondo scuro (desktop e mobile) */}
      <motion.div
        style={{ y: garudaY }}
        className="block absolute right-0 bottom-0 top-0 w-[85%] sm:w-[62%] lg:w-[46%] pointer-events-none z-0 select-none"
      >
        <div className="absolute right-[6%] bottom-[16%] w-[20rem] h-[20rem] lg:w-[26rem] lg:h-[26rem] rounded-full bg-purple/25 blur-3xl" />
        <img
          src="/portfolio/fabio-portrait.webp"
          alt=""
          aria-hidden="true"
          className="absolute right-0 bottom-0 h-[44vh] sm:h-[58vh] lg:h-[86vh] w-auto object-contain object-bottom opacity-80 lg:opacity-90
            [filter:grayscale(0.25)_contrast(1.02)]
            [-webkit-mask-image:linear-gradient(to_bottom,#000_74%,transparent_98%),linear-gradient(to_left,#000_55%,transparent_100%)]
            [-webkit-mask-composite:source-in] [mask-composite:intersect]
            [mask-image:linear-gradient(to_bottom,#000_74%,transparent_98%),linear-gradient(to_left,#000_55%,transparent_100%)]"
        />
      </motion.div>

      {/* Kicker row */}
      <motion.div style={{ opacity: fade }} className="container mx-auto px-6 relative z-10 mb-6">
        <div className="flex items-center justify-between">
          <span className="kicker">{profile.role}</span>
          <span className="hidden md:block kicker text-mist/60">Pistoia · IT</span>
        </div>
      </motion.div>

      {/* Giant name */}
      <motion.div style={{ y: titleY, opacity: fade }} className="container mx-auto px-6 relative z-10">
        <h1 className="display-xl text-white">
          <AnimatedLines lines={["Fabio"]} immediate />
          <span className="block text-outline">
            <AnimatedLines lines={["Coppini"]} delay={0.12} immediate />
          </span>
        </h1>

        {/* Editorial bottom row */}
        <div className="mt-10 md:mt-14 grid md:grid-cols-2 gap-8 items-end">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-md text-base md:text-lg text-mist leading-relaxed"
          >
            {profile.intro}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="md:justify-self-end text-left md:text-right"
          >
            <p className="display-serif italic text-2xl md:text-3xl text-purple-glow mb-5">“{profile.tagline}”</p>
            <div className="flex flex-col sm:flex-row gap-3 md:justify-end">
              <a href="#projects" className="btn-primary group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest">
                Esplora <ArrowDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
              </a>
              <a href="#contact" className="btn-ghost inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest text-white">
                Contattami
              </a>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div style={{ opacity: fade }} className="container mx-auto px-6 relative z-10 mt-14">
        <div className="flex items-center gap-3 text-mist/60">
          <span className="w-10 h-px bg-mist/40" />
          <span className="kicker">Scorri per iniziare</span>
        </div>
      </motion.div>
    </section>
  );
}
