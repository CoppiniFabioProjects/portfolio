import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createEngine } from "./engine";

// La polvere è un solo canvas fisso dietro la pagina. Le immagini che ne fanno parte
// (DustImage, DustCanvas) si registrano qui: finché il motore non le compone restano trasparenti.
// Senza WebGL, con "riduci movimento" o con il risparmio dati le immagini si vedono e basta.
const Ctx = createContext(null);

function supported() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if (navigator.connection?.saveData) return false;
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl"));
  } catch {
    return false;
  }
}

function grains() {
  const touch = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;
  if (!touch) return { count: 30000, touch };
  return { count: (navigator.hardwareConcurrency || 4) <= 4 ? 9000 : 13000, touch };
}

export function DustProvider({ children }) {
  const canvas = useRef(null);
  const engine = useRef(null);
  const pending = useRef(new Map());
  const [on, setOn] = useState(supported);

  useLayoutEffect(() => {
    document.documentElement.classList.toggle("dust-on", on);
  }, [on]);

  useEffect(() => {
    if (!on) return;
    const eng = createEngine(canvas.current, { ...grains(), onFail: () => setOn(false) });
    if (!eng) { setOn(false); return; }
    engine.current = eng;
    if (import.meta.env.DEV || new URLSearchParams(location.search).has("dust")) window.__dust = eng;
    pending.current.forEach((s) => eng.add(s));
    return () => {
      eng.destroy();
      engine.current = null;
    };
  }, [on]);

  // se la polvere si spegne, le immagini tornano visibili
  useEffect(() => {
    if (on) return;
    document.querySelectorAll("[data-dust]").forEach((el) => { el.style.opacity = ""; el.style.transition = ""; });
  }, [on]);

  const api = useMemo(
    () => ({
      register(slot) {
        pending.current.set(slot.id, slot);
        engine.current?.add(slot);
        return () => {
          pending.current.delete(slot.id);
          engine.current?.remove(slot.id);
        };
      },
    }),
    [],
  );

  return (
    <Ctx.Provider value={api}>
      {on && <canvas ref={canvas} aria-hidden="true" className="dust-canvas" />}
      {children}
    </Ctx.Provider>
  );
}

const loaded = (img) =>
  new Promise((ok, ko) => {
    if (img.complete && img.naturalWidth) return ok(img);
    img.addEventListener("load", () => ok(img), { once: true });
    img.addEventListener("error", ko, { once: true });
  });

// Un'immagine che nasce dalla polvere. `radius`: angoli arrotondati (frazione della larghezza),
// `fade(v)`: sfumatura verticale (la stessa della maschera CSS), `interactive`: si sbriciola sotto il cursore.
export function DustImage({ id, interactive = false, radius = 0, fade, ...img }) {
  const ref = useRef(null);
  const dust = useContext(Ctx);
  useEffect(() => {
    const el = ref.current;
    return dust?.register({ id, el, media: el, interactive, radius, fade, load: () => loaded(el) });
  }, [dust, id, interactive, radius, fade]);
  return <img ref={ref} data-dust="" decoding="async" {...img} />;
}

// Un disegno fatto a mano su canvas (es. lo schema del middleware), anche lui di polvere.
// `draw(ctx, w, h)` disegna in coordinate logiche; il canvas è nitido sugli schermi ad alta densità.
export function DustCanvas({ id, draw, width, height, label, className = "" }) {
  const ref = useRef(null);
  const dust = useContext(Ctx);
  useEffect(() => {
    const el = ref.current;
    const paint = async () => {
      await document.fonts?.ready;
      const k = 2;
      el.width = width * k;
      el.height = height * k;
      const ctx = el.getContext("2d");
      ctx.scale(k, k);
      draw(ctx, width, height);
      return el;
    };
    const ready = paint();
    return dust?.register({ id, el, media: el, load: () => ready });
  }, [dust, id, draw, width, height]);
  return <canvas ref={ref} data-dust="" role="img" aria-label={label} className={className} style={{ aspectRatio: `${width} / ${height}` }} />;
}
