import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, MousePointer2 } from "lucide-react";
import { profile } from "../data/content";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};
const item = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 1, ease: [0.22, 1, 0.36, 1] } },
};

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const garudaY = useTransform(scrollYProgress, [0, 1], [0, 220]);
  const garudaScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24">
      {/* Ambient blobs */}
      <div className="blob animate-blob bg-purple w-[38rem] h-[38rem] -top-40 -left-40" />
      <div className="blob animate-blob bg-garuda w-[32rem] h-[32rem] top-20 -right-40" style={{ animationDelay: "3s" }} />
      <div className="blob animate-blob bg-lions-blue w-[28rem] h-[28rem] bottom-0 left-1/4" style={{ animationDelay: "6s" }} />

      {/* Garuda parallax */}
      <motion.div
        style={{ y: garudaY, scale: garudaScale }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
      >
        <img
          src="/portfolio/garuda.png"
          alt=""
          aria-hidden="true"
          className="w-[90vw] md:w-[760px] max-w-none object-contain opacity-[0.18] animate-pulse-slow drop-shadow-[0_0_60px_rgba(168,85,247,0.35)]"
        />
      </motion.div>

      {/* Copy */}
      <motion.div
        style={{ y: textY, opacity: fade }}
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 container mx-auto px-6 text-center"
      >
        <motion.div variants={item}>
          <span className="inline-block py-1.5 px-4 rounded-full glass text-purple-glow text-[10px] font-bold uppercase tracking-[0.3em] mb-8">
            {profile.role}
          </span>
        </motion.div>

        <motion.h1
          variants={item}
          className="font-display font-light leading-[0.95] tracking-tight text-white text-6xl md:text-8xl lg:text-[8.5rem] mb-8"
        >
          Fabio
          <br />
          <span className="text-gradient italic">Coppini</span>
        </motion.h1>

        <motion.p variants={item} className="mx-auto max-w-2xl text-base md:text-xl text-mist/90 leading-relaxed font-light text-balance">
          {profile.intro}
        </motion.p>

        <motion.p variants={item} className="mt-6 font-display italic text-purple-glow text-xl md:text-2xl">
          “{profile.tagline}”
        </motion.p>

        <motion.div variants={item} className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <a href="#projects" className="btn-primary group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-sm font-bold uppercase tracking-widest">
            Esplora Portfolio
            <ArrowDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
          </a>
          <a href="#contact" className="btn-ghost inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-sm font-bold uppercase tracking-widest text-white">
            Contattami
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        style={{ opacity: fade }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-mist/60"
      >
        <MousePointer2 className="w-5 h-5 animate-bounce" />
        <span className="text-[9px] uppercase tracking-[0.3em]">Scroll</span>
      </motion.div>
    </section>
  );
}
