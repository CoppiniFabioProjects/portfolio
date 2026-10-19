import { useId, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

// Una riga di elenco che si apre: in chiusa mostra l'essenziale, aperta il resto.
// `head` è la riga sempre visibile, `children` il contenuto che si apre.
export function Row({ head, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <li className="border-b border-line">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="group w-full text-left py-6 md:py-8 flex items-start gap-4"
      >
        <div className="flex-1 min-w-0 transition-transform duration-500 ease-out md:group-hover:translate-x-2">{head}</div>
        <span
          aria-hidden="true"
          className={`relative mt-2 w-4 h-4 shrink-0 text-dim group-hover:text-fg transition-[transform,color] duration-500 ${open ? "rotate-45" : ""}`}
        >
          <span className="absolute left-0 top-1/2 w-4 h-px bg-current" />
          <span className="absolute top-0 left-1/2 h-4 w-px bg-current" />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1, transition: { height: { duration: 0.6, ease: EASE }, opacity: { duration: 0.5, delay: 0.1 } } }}
            exit={{ height: 0, opacity: 0, transition: { height: { duration: 0.45, ease: EASE }, opacity: { duration: 0.2 } } }}
            className="overflow-hidden"
          >
            <div className="pb-8 md:pb-10">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}
