import { useEffect, useState } from "react";
import { motion, useScroll, useSpring, AnimatePresence, MotionConfig } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useSmoothScroll } from "./components/primitives";
import Nav from "./components/Nav";
import Cursor from "./components/Cursor";
import ScrollGuide from "./components/ScrollGuide";
import Hero from "./components/Hero";
import Manifesto from "./components/Manifesto";
import Vetrina from "./components/Vetrina";
import Tech from "./components/Tech";
import Linux from "./components/Linux";
import Timeline from "./components/Timeline";
import Projects from "./components/Projects";
import Game from "./components/Game";
import Contact from "./components/Contact";
import EasterEggs from "./components/EasterEggs";

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple via-purple-glow to-garuda origin-left z-[60]"
    />
  );
}

function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 grid place-items-center rounded-full btn-primary"
          aria-label="Torna su"
        >
          <ArrowUp className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  useSmoothScroll();
  return (
    <MotionConfig reducedMotion="user">
      <a href="#hero" className="skip-link">Salta al contenuto</a>
      <div className="grain" />
      <Cursor />
      <ScrollProgress />
      <Nav />
      <ScrollGuide />
      <main>
        <Hero />
        <Manifesto />
        <Vetrina />
        <Tech />
        <Linux />
        <Timeline />
        <Projects />
        <Game />
      </main>
      <Contact />
      <BackToTop />
      <EasterEggs />
    </MotionConfig>
  );
}
