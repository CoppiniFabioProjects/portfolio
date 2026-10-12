import { useEffect, useRef, useState } from "react";

// Intro cinematografico: l'aquila Garuda si compone in 3D da migliaia di particelle
// (Three.js, caricato in lazy solo qui) e poi esplode aprendo la hero con un crossfade.
// Se WebGL non c'è o il caricamento tarda, usa l'animazione CSS vettoriale.
// Una volta per sessione, skip al click, rispetta prefers-reduced-motion.
const LOAD_TIMEOUT = 1500; // oltre questo, meglio il fallback CSS che uno schermo nero
const CSS_EXIT_AT = 2600;

export default function Intro() {
  const canvasRef = useRef(null);
  const [show, setShow] = useState(() => {
    if (typeof window === "undefined") return false;
    if (sessionStorage.getItem("intro-seen")) return false;
    return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });
  const [mode, setMode] = useState("loading"); // loading | webgl | css
  const [exiting, setExiting] = useState(false);

  // Avvio: blocca lo scroll e prova la scena 3D
  useEffect(() => {
    if (!show) return;
    sessionStorage.setItem("intro-seen", "1");
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    window.scrollTo(0, 0);

    let settled = false; // la prima tra 3D pronta / timeout / errore decide la modalità
    let stopScene = null;
    const useCss = () => {
      if (settled) return;
      settled = true;
      setMode("css");
    };
    const timer = setTimeout(useCss, LOAD_TIMEOUT);

    import("./EagleParticles")
      .then(({ createEagleScene }) =>
        createEagleScene(canvasRef.current, {
          src: "/portfolio/garuda.png",
          onExit: () => setExiting(true),
        }),
      )
      .then((stop) => {
        if (settled) { stop(); return; } // arrivata troppo tardi: resta il CSS
        settled = true;
        stopScene = stop;
        clearTimeout(timer);
        setMode("webgl");
      })
      .catch(useCss);

    return () => {
      settled = true;
      clearTimeout(timer);
      stopScene?.();
      html.style.overflow = prev;
    };
  }, [show]);

  // Fallback CSS: dissolvenza al termine dell'animazione
  useEffect(() => {
    if (mode !== "css") return;
    const t = setTimeout(() => setExiting(true), CSS_EXIT_AT);
    return () => clearTimeout(t);
  }, [mode]);

  // Durante la dissolvenza: sblocca lo scroll, poi smonta
  useEffect(() => {
    if (!exiting) return;
    document.documentElement.style.overflow = "";
    const t = setTimeout(() => setShow(false), 950);
    return () => clearTimeout(t);
  }, [exiting]);

  if (!show) return null;

  return (
    <div
      onClick={() => setExiting(true)}
      style={{
        opacity: exiting ? 0 : 1,
        transition: "opacity 0.9s ease-in-out",
        pointerEvents: exiting ? "none" : "auto",
      }}
      className="fixed inset-0 z-[300] grid place-items-center overflow-hidden bg-ink cursor-pointer"
      aria-hidden="true"
    >
      {/* bagliore di fondo, comune a entrambe le modalità */}
      <div className="absolute w-[42rem] h-[42rem] max-w-[90vw] max-h-[90vw] rounded-full bg-purple/20 blur-[120px]" />

      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${mode === "webgl" ? "opacity-100" : "opacity-0"}`}
      />

      {mode === "css" && (
        <>
          <div className="intro-glow absolute w-[42rem] h-[42rem] max-w-[90vw] max-h-[90vw] rounded-full bg-purple/30 blur-[110px]" />
          <img
            src="/portfolio/garuda.png"
            alt=""
            className="intro-eagle relative w-[440px] max-w-[80vw] object-contain drop-shadow-[0_0_70px_rgba(168,85,247,0.6)] select-none pointer-events-none"
          />
        </>
      )}

      {mode !== "loading" && (
        <span
          className="intro-sign absolute bottom-[12%] kicker text-mist"
          // in 3D compare quando l'aquila è formata, non durante il vortice
          style={mode === "webgl" ? { animationDelay: "0.9s", animationFillMode: "both" } : undefined}
        >
          Libero come un'aquila
        </span>
      )}

      {!exiting && (
        <span className="absolute bottom-6 right-6 text-[11px] font-mono text-mist/50 pointer-events-none">
          clicca per saltare
        </span>
      )}
    </div>
  );
}
