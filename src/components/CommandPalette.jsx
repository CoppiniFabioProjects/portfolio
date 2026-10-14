import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileDown, Mail, Copy, Linkedin, Github, SquareTerminal, Languages, ArrowUp, CornerDownLeft } from "lucide-react";
import { nav, profile } from "../data/content";
import { ui } from "../data/ui";
import { lang, HOME } from "../i18n";
import { smooth } from "./primitives";

const P = ui.palette;
const other = lang === "en" ? "it" : "en";
const EASE = [0.22, 1, 0.36, 1];

// minuscolo e senza accenti, per cercare "attivita" e trovare "attività"
const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

const openUrl = (href) => window.open(href, "_blank", "noopener");

// Voci della palette. `keep`: resta aperta dopo l'azione (es. copia email, mostra la conferma)
function buildItems() {
  const sections = nav.map((n, i) => ({
    id: `s-${n.id}`,
    group: "sections",
    label: n.label,
    index: `.${String(i + 1).padStart(2, "0")}`,
    keywords: n.id,
    run: () => smooth.to(n.id),
  }));
  const actions = [
    { id: "cv", icon: FileDown, label: P.cv, keywords: "cv curriculum resume pdf scarica download", run: () => {
      const a = document.createElement("a");
      a.href = ui.cv.href; a.download = ui.cv.file;
      a.click();
    } },
    { id: "email", icon: Mail, label: P.email, keywords: "email mail scrivi write contatto contact", run: () => { window.location.href = `mailto:${profile.email}`; } },
    { id: "copy", icon: Copy, label: P.copyEmail, keywords: "copia copy email mail", keep: true, run: async (done) => {
      try { await navigator.clipboard.writeText(profile.email); done(P.copied); } catch { window.location.href = `mailto:${profile.email}`; }
    } },
    { id: "linkedin", icon: Linkedin, label: P.linkedin, keywords: "linkedin social post", run: () => openUrl(profile.linkedin) },
    { id: "github", icon: Github, label: P.github, keywords: "github codice code repo", run: () => openUrl(profile.github) },
    { id: "terminal", icon: SquareTerminal, label: P.terminal, keywords: "terminale terminal shell linux zsh comandi commands", run: () => {
      smooth.to("linux");
      // a scroll finito, il cursore nel terminale
      setTimeout(() => document.querySelector("#linux input")?.focus({ preventScroll: true }), 1100);
    } },
    { id: "lang", icon: Languages, label: P.lang, keywords: "english inglese italiano italian lingua language en it", run: () => {
      window.location.href = HOME[other] + window.location.hash;
    } },
    { id: "top", icon: ArrowUp, label: P.top, keywords: "home inizio top su hero intro", run: () => smooth.to("hero") },
  ].map((a) => ({ ...a, group: "actions" }));
  return [...sections, ...actions];
}

function search(items, q) {
  const words = norm(q).split(/\s+/).filter(Boolean);
  if (!words.length) return items;
  return items
    .filter((it) => {
      const hay = norm(`${it.label} ${it.keywords}`);
      return words.every((w) => hay.includes(w));
    })
    // prima chi comincia con la parola cercata
    .sort((a, b) => Number(norm(b.label).startsWith(words[0])) - Number(norm(a.label).startsWith(words[0])));
}

export default function CommandPalette({ open, onClose }) {
  const items = useMemo(buildItems, []);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const [note, setNote] = useState("");
  const inputRef = useRef(null);
  const returnFocus = useRef(null);

  const results = search(items, q);
  const current = results[Math.min(sel, results.length - 1)];

  // apertura: ricorda il focus, ferma lo scroll della pagina; chiusura: ripristina
  useEffect(() => {
    if (!open) return;
    returnFocus.current = document.activeElement;
    setQ(""); setSel(0); setNote("");
    smooth.stop();
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    return () => {
      clearTimeout(t);
      smooth.start();
      returnFocus.current?.focus?.({ preventScroll: true });
    };
  }, [open]);

  // tiene visibile la voce scelta con le frecce
  useEffect(() => {
    if (!current) return;
    document.getElementById(`cmdk-${current.id}`)?.scrollIntoView?.({ block: "nearest" });
  }, [current]);

  const runItem = (it) => {
    if (!it) return;
    if (it.keep) {
      it.run((msg) => {
        setNote(msg);
        setTimeout(onClose, 900);
      });
      return;
    }
    onClose();
    // dopo la chiusura, così lo scroll della pagina è di nuovo attivo
    setTimeout(() => it.run(), 60);
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => (s + 1) % Math.max(results.length, 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => (s - 1 + results.length) % Math.max(results.length, 1)); }
    else if (e.key === "Enter") { e.preventDefault(); runItem(current); }
    else if (e.key === "Escape") { e.preventDefault(); onClose(); }
  };

  const groups = [
    ["sections", P.sections],
    ["actions", P.actions],
  ].map(([g, title]) => [title, results.filter((r) => r.group === g)]).filter(([, list]) => list.length);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-start justify-center px-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 bg-ink/70 backdrop-blur-md" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={P.title}
            initial={{ opacity: 0, y: -14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="island relative w-full max-w-xl rounded-2xl overflow-hidden select-none"
          >
            {/* barra in stile terminale */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06]">
              <span className="w-2.5 h-2.5 rounded-full bg-lions-red/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-lions-gold/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-garuda/70" />
              <span className="ml-2 font-mono text-[11px] text-mist">{P.prompt}</span>
              <kbd className="ml-auto font-mono text-[10px] text-mist/70 border border-white/10 rounded px-1.5 py-0.5">esc</kbd>
            </div>

            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.06]">
              <span className="font-mono text-garuda" aria-hidden="true">➜</span>
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => { setQ(e.target.value); setSel(0); }}
                onKeyDown={onKeyDown}
                role="combobox"
                aria-expanded="true"
                aria-controls="cmdk-list"
                aria-autocomplete="list"
                aria-activedescendant={current ? `cmdk-${current.id}` : undefined}
                aria-label={P.title}
                placeholder={P.placeholder}
                spellCheck={false}
                autoComplete="off"
                className="flex-1 min-w-0 bg-transparent outline-none text-white font-mono text-sm caret-garuda placeholder:text-mist/45"
              />
            </div>

            <ul id="cmdk-list" role="listbox" aria-label={P.title} data-lenis-prevent className="max-h-[min(52vh,420px)] overflow-y-auto p-2">
              {groups.map(([title, list]) => (
                <li key={title} role="presentation">
                  <div className="px-3 pt-2.5 pb-1.5 kicker text-[10px] text-mist/60">{title}</div>
                  <ul role="presentation">
                    {list.map((it) => {
                      const on = current?.id === it.id;
                      const Icon = it.icon;
                      return (
                        <li
                          key={it.id}
                          id={`cmdk-${it.id}`}
                          role="option"
                          aria-selected={on}
                          onMouseMove={() => setSel(results.indexOf(it))}
                          onClick={() => runItem(it)}
                          className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${on ? "text-white" : "text-mist"}`}
                        >
                          {on && (
                            <motion.span
                              layoutId="cmdk-hl"
                              transition={{ type: "spring", stiffness: 500, damping: 40 }}
                              className="absolute inset-0 rounded-xl bg-white/[0.07] border border-white/[0.06]"
                            />
                          )}
                          <span className="relative w-7 grid place-items-center shrink-0">
                            {Icon ? <Icon className={`w-4 h-4 ${on ? "text-purple-glow" : ""}`} /> : <span className={`font-mono text-[11px] ${on ? "text-purple-glow" : "text-purple-glow/60"}`}>{it.index}</span>}
                          </span>
                          <span className="relative flex-1 text-sm">{it.label}</span>
                          {on && <CornerDownLeft className="relative w-3.5 h-3.5 text-mist/70" aria-hidden="true" />}
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
              {!results.length && (
                <li role="presentation" className="px-3 py-6 text-center font-mono text-xs text-mist">
                  {P.empty} «{q}»
                </li>
              )}
            </ul>

            <div className="flex items-center gap-4 px-4 py-2.5 border-t border-white/[0.06] font-mono text-[10px] text-mist/60">
              {note ? (
                <span className="text-garuda" role="status">✓ {note}</span>
              ) : (
                <>
                  <span><kbd className="text-mist">↑↓</kbd> {P.move}</span>
                  <span><kbd className="text-mist">↵</kbd> {P.run}</span>
                  <span><kbd className="text-mist">esc</kbd> {P.close}</span>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
