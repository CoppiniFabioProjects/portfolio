import { MotionConfig } from "framer-motion";
import { useSmoothScroll } from "./components/primitives";
import { DustProvider } from "./dust/Dust";
import Nav from "./components/Nav";
import Cursor from "./components/Cursor";
import Hero from "./components/Hero";
import About from "./components/About";
import Work from "./components/Work";
import Writing from "./components/Writing";
import Path from "./components/Path";
import Skills from "./components/Skills";
import Life from "./components/Life";
import Contact from "./components/Contact";
import Panels from "./components/Panels";
import EasterEggs from "./components/EasterEggs";
import { ui } from "./data/ui";

export default function App() {
  useSmoothScroll();
  return (
    <MotionConfig reducedMotion="user">
      <DustProvider>
        <a href="#main" className="skip-link">{ui.app.skipLink}</a>
        <div className="grain" aria-hidden="true" />
        <Cursor />
        <Nav />
        <main id="main">
          <Hero />
          <About />
          <Work />
          <Writing />
          <Path />
          <Skills />
          <Life />
        </main>
        <Contact />
        <Panels />
        <EasterEggs />
      </DustProvider>
    </MotionConfig>
  );
}
