import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CommandPalette from "./CommandPalette";
import { smooth } from "./primitives";
import { nav, profile } from "../data/content";
import { ui } from "../data/ui";
import { lang, HOME } from "../i18n";

const other = lang === "en" ? "it" : "en";
const EASE = [0.22, 1, 0.36, 1];
// in barra solo le sezioni principali; le altre sono nel menu e nella palette
const TOP = nav.filter((n) => ["projects", "writing", "experience", "contact"].includes(n.id));

// Passa all'altra lingua restando nella stessa sezione (#ancora)
function LangSwitch({ className = "" }) {
  return (
    <a
      href={HOME[other]}
      hrefLang={other}
      lang={other}
      aria-label={ui.langSwitch.aria}
      onClick={(e) => { e.currentTarget.href = HOME[other] + window.location.hash; }}
      className={`u-link ${className}`}
    >
      {ui.langSwitch.label}
    </a>
  );
}

// La sezione in cui si trova chi legge (quella che occupa la parte alta dello schermo)
function useActive() {
  const [active, setActive] = useState(null);
  useEffect(() => {
    const ids = nav.map((n) => n.id);
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const line = window.innerHeight * 0.4;
        let cur = null;
        for (const id of ids) {
          const el = document.getElementById(id);
          if (el && el.getBoundingClientRect().top < line) cur = id;
        }
        setActive(cur);
      });
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => { window.removeEventListener("scroll", on); cancelAnimationFrame(raf); };
  }, []);
  return active;
}

// La barra si toglie di mezzo mentre si legge (scroll in giù) e torna appena si risale
function useHidden() {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    const on = () => {
      const y = window.scrollY;
      if (Math.abs(y - last) < 6) return;
      setHidden(y > last && y > 160);
      last = y;
    };
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return hidden;
}

// Menu del telefono: tutto lo schermo, le sezioni grandi
function Menu({ open, onClose }) {
  const closeBtn = useRef(null);
  useEffect(() => {
    if (!open) return;
    smooth.stop();
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const t = setTimeout(() => closeBtn.current?.focus({ preventScroll: true }), 60);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      html.style.overflow = prev;
      smooth.start();
    };
  }, [open, onClose]);

  const go = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
    setTimeout(() => smooth.to(id), 420);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="menu"
          role="dialog"
          aria-modal="true"
          aria-label={ui.nav.sections}
          className="fixed inset-0 z-[80] bg-ink flex flex-col gutter pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)", transition: { duration: 0.7, ease: EASE } }}
          exit={{ clipPath: "inset(0 0 100% 0)", transition: { duration: 0.55, ease: EASE, delay: 0.1 } }}
        >
          <div className="h-12 flex items-center justify-between text-[14px]">
            <span className="font-medium">{profile.name}</span>
            <button ref={closeBtn} type="button" onClick={onClose} aria-label={ui.nav.closeMenu} className="u-link-on">
              {ui.nav.close}
            </button>
          </div>
          <nav className="flex-1 flex flex-col justify-center">
            {nav.map((n, i) => (
              <a key={n.id} href={`#${n.id}`} onClick={(e) => go(e, n.id)} className="flex items-baseline gap-4 py-1 overflow-hidden">
                <motion.span
                  className="label w-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { delay: 0.35 + i * 0.05 } }}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                >
                  {String(i + 1).padStart(2, "0")}
                </motion.span>
                <motion.span
                  className="block text-[13.5vw] leading-[1.02] tracking-[-0.055em] text-fg"
                  initial={{ y: "100%" }}
                  animate={{ y: "0%", transition: { duration: 0.8, ease: EASE, delay: 0.2 + i * 0.05 } }}
                  exit={{ y: "100%", transition: { duration: 0.35, ease: EASE } }}
                >
                  {n.label}
                </motion.span>
              </a>
            ))}
          </nav>
          <motion.div
            className="grid gap-1.5 text-[14px] border-t border-line pt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.6 } }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
          >
            <a href={`mailto:${profile.email}`} className="text-fg">{profile.email}</a>
            <div className="flex gap-5 text-dim">
              <a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
              <a href={profile.github} target="_blank" rel="noreferrer">GitHub</a>
              <a href={ui.cv.href} download={ui.cv.file}>CV</a>
              <LangSwitch className="ml-auto text-fg" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Nav() {
  const [palette, setPalette] = useState(false);
  const [menu, setMenu] = useState(false);
  const closeMenu = useCallback(() => setMenu(false), []);
  const active = useActive();
  const hidden = useHidden() && !menu && !palette;

  // ⌘K / Ctrl+K ovunque; "/" quando non si sta scrivendo
  useEffect(() => {
    const onKey = (e) => {
      const typing = e.target.closest?.("input, textarea, [contenteditable='true']");
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPalette((p) => !p); }
      else if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey) { e.preventDefault(); setPalette(true); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* la barra si "inverte" sopra quello che le passa sotto: bianca sul nero, nera sul chiaro */}
      <motion.div
        className="fixed top-0 inset-x-0 z-50 mix-blend-difference"
        initial={false}
        animate={{ y: hidden ? "-100%" : "0%" }}
        transition={{ duration: hidden ? 0.5 : 0.6, ease: EASE }}
      >
        <motion.header
          className="gutter h-14 md:h-16 flex items-center justify-between text-white text-[14px]"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE, delay: 1.4 }}
        >
          <a href="#hero" aria-label={ui.nav.home} className="font-medium tracking-[-0.01em]">
            {profile.name}
          </a>
          <nav aria-label={ui.nav.sections} className="hidden md:flex items-center gap-8">
            {TOP.map((n) => (
              <a key={n.id} href={`#${n.id}`} aria-current={active === n.id ? "location" : undefined} className={active === n.id ? "u-link-on" : "u-link"}>
                {n.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-5">
            <LangSwitch />
            <button type="button" onClick={() => setPalette(true)} aria-label={ui.nav.search} className="hidden md:inline-flex items-center gap-2 group">
              <span className="u-link">{ui.nav.searchShort}</span>
              <kbd className="font-mono text-[11px] opacity-60 group-hover:opacity-100 transition-opacity">⌘K</kbd>
            </button>
            <button type="button" onClick={() => setMenu(true)} aria-expanded={menu} aria-controls="menu" aria-label={ui.nav.openMenu} className="md:hidden u-link-on">
              {ui.nav.menu}
            </button>
          </div>
        </motion.header>
      </motion.div>
      <Menu open={menu} onClose={closeMenu} />
      <CommandPalette open={palette} onClose={() => setPalette(false)} />
    </>
  );
}
