import { useEffect, useState, lazy, Suspense } from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useSmoothScroll, Magnetic } from "./components/primitives";
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
import Contact from "./components/Contact";
import EasterEggs from "./components/EasterEggs";
import Intro from "./components/Intro";
import { KineticText, SectionReveal } from "./components/transitions";

// Game: componente pesante e sotto la piega → caricato in chunk separato
const Game = lazy(() => import("./components/Game"));

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
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <Magnetic strength={0.5}>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="w-12 h-12 grid place-items-center rounded-full btn-primary"
              aria-label="Torna su"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          </Magnetic>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  useSmoothScroll();
  return (
    <MotionConfig reducedMotion="user">
      <Intro />
      <a href="#hero" className="skip-link">Salta al contenuto</a>
      <div className="aurora" />
      <div className="grain" />
      <div className="vignette" />
      <Cursor />
      <Nav />
      <ScrollGuide />
      <main>
        <Hero />
        <Manifesto />
        <Vetrina />
        <KineticText text="FULL-STACK · NLP · LINUX · ROBOTICA" baseVelocity={2} />
        <SectionReveal>
          <Tech />
        </SectionReveal>
        <SectionReveal>
          <Linux />
        </SectionReveal>
        <Timeline />
        <KineticText text="GARUDA" baseVelocity={-2.4} />
        <Projects />
        <Suspense fallback={null}>
          <Game />
        </Suspense>
      </main>
      <Contact />
      <BackToTop />
      <EasterEggs />
    </MotionConfig>
  );
}
