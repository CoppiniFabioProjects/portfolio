import { useEffect, useId, useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { X, Send, Linkedin, Github, FileDown } from "lucide-react";
import { nav, profile } from "../data/content";
import { ui } from "../data/ui";
import { lang, HOME } from "../i18n";
import CommandPalette from "./CommandPalette";

// L'isola: un'unica capsula fluttuante che cambia forma.
// Desktop: aperta in cima alla pagina (tutte le sezioni), si stringe scorrendo
// e mostra solo la sezione corrente con l'avanzamento; si riapre al passaggio del mouse.
// Mobile: capsula compatta in alto che si apre in un pannello.
// ⌘K / Ctrl+K / "/" aprono la palette dei comandi.

const other = lang === "en" ? "it" : "en";
const EASE = [0.22, 1, 0.36, 1];
const MORPH = { type: "spring", stiffness: 420, damping: 38, mass: 0.9 };
const NEUTRAL = ["hero", "manifesto"]; // lì l'isola mostra il nome, non una sezione

function useMedia(query) {
  const [match, setMatch] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    on();
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, [query]);
  return match;
}

// Scroll-spy: id della sezione visibile ("" in hero e manifesto)
function useActiveSection() {
  const [active, setActive] = useState("");
  useEffect(() => {
    const els = [...NEUTRAL, ...nav.map((n) => n.id)].map((id) => document.getElementById(id)).filter(Boolean);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const v = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (v) setActive(NEUTRAL.includes(v.target.id) ? "" : v.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return active;
}

// Monogramma con l'anello di avanzamento della pagina
function Mark({ progress }) {
  const gid = useId();
  return (
    <span className="relative grid place-items-center w-9 h-9 shrink-0">
      <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#c084fc" />
            <stop offset="1" stopColor="#2dd4bf" />
          </linearGradient>
        </defs>
        <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="1.5" />
        <motion.circle cx="18" cy="18" r="16" fill="none" stroke={`url(#${gid})`} strokeWidth="1.75" strokeLinecap="round" style={{ pathLength: progress }} />
      </svg>
      <span className="font-display italic text-[13px] leading-none text-white tracking-tight">FC</span>
    </span>
  );
}

// Nome della sezione corrente: scorre in su o in giù seguendo la direzione
function SectionLabel({ active }) {
  const i = nav.findIndex((n) => n.id === active);
  const prev = useRef(i);
  const dir = i >= prev.current ? 1 : -1;
  useEffect(() => { prev.current = i; }, [i]);
  return (
    <span className="relative flex items-center h-5 overflow-hidden">
      <AnimatePresence mode="popLayout" initial={false} custom={dir}>
        <motion.span
          key={active || "home"}
          custom={dir}
          variants={{
            enter: (d) => ({ y: d * 16, opacity: 0 }),
            center: { y: 0, opacity: 1 },
            exit: (d) => ({ y: d * -16, opacity: 0 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.38, ease: EASE }}
          className="flex items-center gap-2 whitespace-nowrap"
        >
          {i >= 0 && <span className="font-mono text-[11px] text-purple-glow/80">.{String(i + 1).padStart(2, "0")}</span>}
          <span className="text-[13px] text-white">{i >= 0 ? nav[i].label : profile.name}</span>
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

// Passa all'altra lingua restando nella stessa sezione (#ancora)
function LangSwitch({ className = "" }) {
  return (
    <a
      href={HOME[other]}
      hrefLang={other}
      lang={other}
      aria-label={ui.langSwitch.aria}
      onClick={(e) => { e.currentTarget.href = HOME[other] + window.location.hash; }}
      className={`grid place-items-center rounded-full font-mono text-[11px] font-bold tracking-wider text-mist hover:text-white hover:bg-white/[0.06] transition-colors ${className}`}
    >
      {ui.langSwitch.label}
    </a>
  );
}

const isMac = () => typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

/* ---------------- Desktop ---------------- */
function DesktopIsland({ active, progress, onSearch }) {
  const [atTop, setAtTop] = useState(true);
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [hl, setHl] = useState(null);
  const leaveT = useRef(0);

  useEffect(() => {
    const on = () => setAtTop(window.scrollY < 140);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => () => clearTimeout(leaveT.current), []);

  const open = atTop || hover || focus;
  const lit = hl ?? active;

  return (
    <motion.nav
      layout
      transition={MORPH}
      style={{ borderRadius: 999 }}
      aria-label={ui.nav.sections}
      onMouseEnter={() => { clearTimeout(leaveT.current); setHover(true); }}
      onMouseLeave={() => { leaveT.current = setTimeout(() => setHover(false), 260); }}
      onFocus={() => setFocus(true)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setFocus(false); }}
      className="island pointer-events-auto flex items-center p-1.5 select-none"
    >
      {/* il monogramma resta sempre lo stesso elemento: il focus da tastiera non si perde */}
      <motion.a layout="position" href="#hero" aria-label={ui.nav.home} className="rounded-full">
        <Mark progress={progress} />
      </motion.a>

      <AnimatePresence mode="popLayout" initial={false}>
        {open ? (
          <motion.div
            key="full"
            layout="position"
            initial={{ opacity: 0, filter: "blur(6px)" }}
            animate={{ opacity: 1, filter: "blur(0px)", transition: { duration: 0.35, delay: 0.08 } }}
            exit={{ opacity: 0, filter: "blur(6px)", transition: { duration: 0.15 } }}
            className="flex items-center"
          >
            <span className="hidden xl:block font-display text-[15px] text-white tracking-tight pl-2.5 pr-4 whitespace-nowrap">{profile.name}</span>
            <span className="hidden xl:block w-px h-5 bg-white/10" />
            <ul className="flex items-center px-1.5" onMouseLeave={() => setHl(null)}>
              {nav.map((n) => (
                <li key={n.id} className="relative">
                  <a
                    href={`#${n.id}`}
                    onMouseEnter={() => setHl(n.id)}
                    onFocus={() => setHl(n.id)}
                    onBlur={() => setHl(null)}
                    aria-current={active === n.id ? "location" : undefined}
                    className={`relative z-10 block px-3.5 py-2 rounded-full text-[13px] whitespace-nowrap transition-colors duration-300 ${lit === n.id ? "text-white" : "text-mist"}`}
                  >
                    {n.label}
                  </a>
                  {lit === n.id && (
                    <motion.span
                      layoutId="island-hl"
                      transition={{ type: "spring", stiffness: 520, damping: 42 }}
                      className="absolute inset-0 rounded-full bg-white/[0.08] border border-white/[0.06]"
                    />
                  )}
                  {active === n.id && <span className="absolute left-1/2 -translate-x-1/2 bottom-[3px] w-1 h-1 rounded-full bg-garuda shadow-[0_0_8px_#2dd4bf]" />}
                </li>
              ))}
            </ul>
            <span className="w-px h-5 bg-white/10" />
            <button
              type="button"
              onClick={onSearch}
              aria-label={ui.nav.search}
              aria-keyshortcuts="Meta+K Control+K"
              className="ml-1.5 h-9 px-3 rounded-full font-mono text-[11px] text-mist hover:text-white hover:bg-white/[0.06] transition-colors whitespace-nowrap"
            >
              {isMac() ? "⌘K" : "Ctrl K"}
            </button>
            <LangSwitch className="w-9 h-9" />
            <a
              href="#contact"
              className="ml-1 btn-primary inline-flex items-center gap-2 h-9 px-4 rounded-full text-[11px] font-bold uppercase tracking-wider whitespace-nowrap"
            >
              <Send className="w-3.5 h-3.5" /> {ui.nav.cta}
            </a>
          </motion.div>
        ) : (
          <motion.div
            key="mini"
            layout="position"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.3, delay: 0.1 } }}
            exit={{ opacity: 0, transition: { duration: 0.06 } }}
            className="pl-2.5 pr-4"
          >
            <SectionLabel active={active} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

/* ---------------- Mobile ---------------- */
// fruscio d'ali all'apertura (WebAudio, rispetta il mute del gioco)
function playWhoosh() {
  try {
    if (localStorage.getItem("garuda-muted") === "1") return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const dur = 0.55;
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 1.6);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass"; filter.Q.value = 0.7;
    filter.frequency.setValueAtTime(280, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(1900, ctx.currentTime + 0.4);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.11, ctx.currentTime + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    src.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    src.start(); src.stop(ctx.currentTime + dur);
    setTimeout(() => ctx.close(), 800);
  } catch { /* audio non disponibile */ }
}

function MobileIsland({ active, progress }) {
  const [open, setOpen] = useState(false);
  const openBtn = useRef(null);
  const closeBtn = useRef(null);

  const show = () => { setOpen(true); playWhoosh(); };
  const hide = () => setOpen(false);

  // pannello aperto: pagina ferma, Esc chiude, focus dentro e poi di nuovo sul pulsante
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    html.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    const t = setTimeout(() => closeBtn.current?.focus({ preventScroll: true }), 50);
    const btn = openBtn.current;
    return () => {
      html.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
      setTimeout(() => (openBtn.current || btn)?.focus({ preventScroll: true }), 0);
    };
  }, [open]);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-[60] bg-ink/75 backdrop-blur-sm"
            onClick={hide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: EASE }}
        className="fixed top-3 inset-x-0 z-[70] flex justify-center px-3 pointer-events-none"
      >
        <motion.div
          layout
          transition={MORPH}
          style={{ borderRadius: open ? 28 : 999 }}
          className={`island pointer-events-auto overflow-hidden select-none ${open ? "w-full max-w-md" : ""}`}
        >
          {open ? (
            <motion.div layout="position" className="p-5 max-h-[calc(100dvh-1.5rem)] overflow-y-auto" data-lenis-prevent>
              <div className="flex items-center justify-between">
                <a href="#hero" onClick={hide} aria-label={ui.nav.home} className="flex items-center gap-3 rounded-full">
                  <Mark progress={progress} />
                  <span className="font-display text-lg text-white tracking-tight">{profile.name}</span>
                </a>
                <button
                  ref={closeBtn}
                  type="button"
                  onClick={hide}
                  aria-label={ui.nav.closeMenu}
                  className="w-10 h-10 grid place-items-center rounded-full bg-white/[0.06] text-white active:scale-95 transition-transform"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav aria-label={ui.nav.sections} className="mt-6 flex flex-col">
                {nav.map((n, i) => (
                  <motion.a
                    key={n.id}
                    href={`#${n.id}`}
                    onClick={hide}
                    aria-current={active === n.id ? "location" : undefined}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.045, duration: 0.45, ease: EASE }}
                    className="group flex items-center gap-4 py-2 border-b border-white/[0.05] last:border-0"
                  >
                    <span className="font-mono text-[11px] text-purple-glow/60 w-7 shrink-0">.{String(i + 1).padStart(2, "0")}</span>
                    <span className={`font-display leading-none text-[1.85rem] tracking-tight transition-colors ${active === n.id ? "text-white" : "text-mist group-active:text-purple-glow"}`}>
                      {n.label}
                    </span>
                    {active === n.id && <span className="ml-auto w-2 h-2 rounded-full bg-garuda shadow-[0_0_12px_#2dd4bf]" />}
                  </motion.a>
                ))}
              </nav>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + nav.length * 0.045, duration: 0.45, ease: EASE }}
                className="mt-6"
              >
                <a
                  href="#contact"
                  onClick={hide}
                  className="btn-primary flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-full text-sm font-bold uppercase tracking-widest"
                >
                  <Send className="w-4 h-4" /> {ui.nav.menuCta}
                </a>
                <div className="mt-4 flex items-center gap-2">
                  <a href={profile.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="w-10 h-10 grid place-items-center rounded-full bg-white/[0.05] text-mist active:text-purple-glow">
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a href={profile.github} target="_blank" rel="noreferrer" aria-label="GitHub" className="w-10 h-10 grid place-items-center rounded-full bg-white/[0.05] text-mist active:text-purple-glow">
                    <Github className="w-4 h-4" />
                  </a>
                  <a href={ui.cv.href} download={ui.cv.file} aria-label={ui.nav.downloadCv} className="w-10 h-10 grid place-items-center rounded-full bg-white/[0.05] text-mist active:text-purple-glow">
                    <FileDown className="w-4 h-4" />
                  </a>
                  <LangSwitch className="w-10 h-10 bg-white/[0.05]" />
                  <span className="ml-auto font-display italic text-purple-glow text-sm text-right leading-tight max-w-[8rem]">“{profile.tagline}”</span>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div layout="position" className="flex items-center p-1.5">
              <button
                ref={openBtn}
                type="button"
                onClick={show}
                aria-label={ui.nav.openMenu}
                aria-expanded={false}
                className="flex items-center gap-2.5 pr-3 rounded-full active:scale-[0.98] transition-transform"
              >
                <Mark progress={progress} />
                <SectionLabel active={active} />
                {/* due tratti al posto del classico hamburger */}
                <span className="ml-1 flex flex-col items-end gap-[5px]" aria-hidden="true">
                  <span className="block w-4 h-px bg-white/80" />
                  <span className="block w-2.5 h-px bg-white/50" />
                </span>
              </button>
              <span className="w-px h-5 bg-white/10" />
              <LangSwitch className="w-9 h-9 ml-0.5" />
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </>
  );
}

export default function Nav() {
  const desktop = useMedia("(min-width: 1024px)");
  const active = useActiveSection();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });
  const [palette, setPalette] = useState(false);

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
      {desktop ? (
        <motion.header
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="fixed top-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none"
        >
          <DesktopIsland active={active} progress={progress} onSearch={() => setPalette(true)} />
        </motion.header>
      ) : (
        <header>
          <MobileIsland active={active} progress={progress} />
        </header>
      )}
      <CommandPalette open={palette} onClose={() => setPalette(false)} />
    </>
  );
}
