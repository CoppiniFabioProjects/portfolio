import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Send } from "lucide-react";
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
    const sections = nav
      .map((n) => document.getElementById(n.id))
      .filter(Boolean);
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

  return (
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
          onClick={() => setOpen((o) => !o)}
          className="md:hidden w-10 h-10 grid place-items-center rounded-xl glass text-white"
          aria-label="Menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden absolute top-20 left-4 right-4 glass rounded-2xl p-4 flex flex-col gap-1"
          >
            {nav.map((n) => {
              const isActive = active === n.id;
              return (
                <a
                  key={n.id}
                  href={`#${n.id}`}
                  onClick={() => setOpen(false)}
                  aria-current={isActive ? "true" : undefined}
                  className={`px-4 py-3 rounded-xl transition-colors ${isActive ? "text-white bg-white/5" : "text-mist hover:text-white hover:bg-white/5"}`}
                >
                  {n.label}
                </a>
              );
            })}
            <a
              href="#contact"
              onClick={() => setOpen(false)}
              className="mt-1 btn-primary text-center px-4 py-3 rounded-xl text-sm font-bold"
            >
              Contattami
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
