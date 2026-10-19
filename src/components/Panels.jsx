import { useEffect, useRef, useState, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Terminal from "./Terminal";
import { smooth } from "./primitives";
import { ui } from "../data/ui";

// Il gioco è pesante e lo apre solo chi lo cerca: si scarica all'apertura
const Game = lazy(() => import("./Game"));

// Terminale e gioco non hanno una sezione: si aprono sopra la pagina, da qualunque punto
export const openPanel = (name) => window.dispatchEvent(new CustomEvent("fc:panel", { detail: name }));

export default function Panels() {
  const [panel, setPanel] = useState(null);
  const box = useRef(null);
  const returnFocus = useRef(null);

  useEffect(() => {
    const on = (e) => setPanel(e.detail);
    window.addEventListener("fc:panel", on);
    return () => window.removeEventListener("fc:panel", on);
  }, []);

  useEffect(() => {
    if (!panel) return;
    returnFocus.current = document.activeElement;
    smooth.stop();
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") setPanel(null); };
    window.addEventListener("keydown", onKey);
    const t = setTimeout(() => (box.current?.querySelector("input") || box.current?.querySelector("[tabindex]"))?.focus({ preventScroll: true }), 80);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      html.style.overflow = prev;
      smooth.start();
      returnFocus.current?.focus?.({ preventScroll: true });
    };
  }, [panel]);

  const title = panel === "game" ? ui.game.title : ui.panel.terminal;

  return (
    <AnimatePresence>
      {panel && (
        <motion.div
          className="fixed inset-0 z-[95] flex items-center justify-center p-4 md:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="absolute inset-0 bg-ink/80 backdrop-blur-md" onClick={() => setPanel(null)} />
          <motion.div
            ref={box}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            data-lenis-prevent
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.99 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-3xl max-h-full overflow-y-auto no-scrollbar"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="label">{panel === "game" ? ui.panel.game : "zsh"}</div>
                <h2 className="mt-1 text-2xl md:text-3xl tracking-[-0.03em] text-fg">{title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setPanel(null)}
                aria-label={ui.panel.close}
                className="w-11 h-11 grid place-items-center rounded-full btn-ghost text-fg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {panel === "game" ? (
              <Suspense fallback={<div className="h-80 grid place-items-center label">…</div>}>
                <p className="text-dim text-[14px] mb-5 max-w-xl">{ui.game.sub}</p>
                <Game />
              </Suspense>
            ) : (
              <Terminal />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
