import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Send, Linkedin, Github, ArrowUpRight } from "lucide-react";
import { nav, profile } from "../data/content";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll-spy: evidenzia la sezione attualmente visibile
  useEffect(() => {
    const sections = nav.map((n) => document.getElementById(n.id)).filter(Boolean);
    if (!sections.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: [0, 0.25, 0.5, 1] }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  // blocca lo scroll quando il menu full-screen è aperto
  useEffect(() => {
    const html = document.documentElement;
    if (open) html.style.overflow = "hidden";
    else html.style.overflow = "";
    return () => { html.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 inset-x-0 z-50 flex justify-center px-4 pt-4"
      >
        <nav
          className={`w-full max-w-5xl flex items-center justify-between rounded-2xl px-5 py-3 transition-all duration-500 ${
            scrolled ? "glass shadow-2xl shadow-black/40" : "bg-transparent"
          }`}
        >
          <a href="#hero" className="group flex items-center gap-2">
            <span className="font-display text-lg text-white tracking-tight">Fabio Coppini</span>
            <span className="hidden sm:inline text-[9px] font-mono uppercase tracking-[0.2em] text-purple-glow/70 group-hover:text-purple-glow transition-colors">
              .dev
            </span>
          </a>

          <ul className="hidden md:flex items-center gap-1">
            {nav.map((n) => {
              const isActive = active === n.id;
              return (
                <li key={n.id}>
                  <a
                    href={`#${n.id}`}
                    aria-current={isActive ? "true" : undefined}
                    className={`px-3 py-2 text-sm transition-colors relative group ${isActive ? "text-white" : "text-mist hover:text-white"}`}
                  >
                    {n.label}
                    <span className={`absolute left-3 right-3 -bottom-0.5 h-px bg-purple transition-transform origin-left ${isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} />
                  </a>
                </li>
              );
            })}
          </ul>

          <a
            href="#contact"
            className="hidden md:inline-flex items-center gap-2 btn-primary px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider"
          >
            <Send className="w-3.5 h-3.5" /> Contatti
          </a>

          <button
            onClick={() => setOpen(true)}
            className="md:hidden w-11 h-11 grid place-items-center rounded-xl glass text-white active:scale-95 transition-transform"
            aria-label="Apri il menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </nav>
      </motion.header>

      {/* Menu full-screen — editoriale */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="md:hidden fixed inset-0 z-[70] flex flex-col bg-ink overflow-hidden"
            initial={{ clipPath: "circle(0% at 88% 6%)" }}
            animate={{ clipPath: "circle(150% at 88% 6%)" }}
            exit={{ clipPath: "circle(0% at 88% 6%)", transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* decor */}
            <div className="blob bg-purple w-[26rem] h-[26rem] -top-40 -right-28 opacity-30" />
            <div className="blob bg-garuda w-[22rem] h-[22rem] -bottom-32 -left-24 opacity-20" />
            <img
              src="/portfolio/garuda.png"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 m-auto w-[80vw] max-w-none object-contain opacity-[0.06] pointer-events-none"
            />

            {/* barra superiore */}
            <div className="relative flex items-center justify-between px-6 pt-6">
              <a href="#hero" onClick={() => setOpen(false)} className="font-display text-lg text-white tracking-tight">
                Fabio Coppini<span className="text-purple-glow">.</span>
              </a>
              <button
                onClick={() => setOpen(false)}
                className="w-11 h-11 grid place-items-center rounded-xl glass text-white active:scale-95 transition-transform"
                aria-label="Chiudi il menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* voci giganti */}
            <nav className="relative flex-1 flex flex-col justify-center px-7 gap-1">
              {nav.map((n, i) => {
                const isActive = active === n.id;
                return (
                  <motion.a
                    key={n.id}
                    href={`#${n.id}`}
                    onClick={() => setOpen(false)}
                    aria-current={isActive ? "true" : undefined}
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                    transition={{ delay: 0.12 + i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="group flex items-center gap-4 py-1.5"
                  >
                    <span className="font-mono text-xs text-purple-glow/60 w-7 shrink-0">.0{i + 1}</span>
                    <span className={`font-display leading-none text-[2.1rem] transition-colors ${isActive ? "text-white" : "text-mist group-active:text-purple-glow"}`}>
                      {n.label}
                    </span>
                    {isActive && <span className="w-2 h-2 rounded-full bg-garuda shadow-[0_0_12px_#2dd4bf]" />}
                  </motion.a>
                );
              })}
            </nav>

            {/* footer */}
            <motion.div
              className="relative px-7 pb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 + nav.length * 0.06, duration: 0.5 }}
            >
              <a
                href="#contact"
                onClick={() => setOpen(false)}
                className="btn-primary flex items-center justify-center gap-2 w-full px-6 py-4 rounded-full text-sm font-bold uppercase tracking-widest"
              >
                <Send className="w-4 h-4" /> Contattami
              </a>
              <div className="mt-5 flex items-center justify-between">
                <div className="flex gap-3">
                  <a href={profile.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="w-11 h-11 grid place-items-center rounded-xl glass text-mist active:text-purple-glow transition-colors">
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a href={profile.github} target="_blank" rel="noreferrer" aria-label="GitHub" className="w-11 h-11 grid place-items-center rounded-xl glass text-mist active:text-purple-glow transition-colors">
                    <Github className="w-4 h-4" />
                  </a>
                  <a href="/portfolio/cv-fabio-coppini.pdf" download aria-label="Scarica CV" className="w-11 h-11 grid place-items-center rounded-xl glass text-mist active:text-purple-glow transition-colors">
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>
                <span className="font-display italic text-purple-glow text-sm text-right max-w-[9rem] leading-tight">
                  “{profile.tagline}”
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
