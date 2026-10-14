import { useEffect, useRef, useState } from "react";

// Contenitore per le scene Three.js (src/three/*):
// - carica il modulo solo quando la sezione si avvicina al viewport (lazy);
// - fa girare il render loop solo mentre la scena è visibile;
// - inoltra un MotionValue di scroll (opzionale) alla scena;
// - se WebGL non c'è o qualcosa va storto, mostra il `fallback`;
// - finché la scena si prepara mostra il `placeholder` (niente riquadro vuoto), poi sfuma nel 3D.
// `className` deve posizionare il contenitore (relative/absolute): il canvas lo riempie.
export default function Scene3D({ load, options, progress, className = "relative", canvasClassName = "", fallback = null, placeholder = null }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let api = null;
    let disposed = false;

    const visIO = new IntersectionObserver(
      ([e]) => api?.setVisible(e.isIntersecting),
      { rootMargin: "120px 0px" },
    );
    const loadIO = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        loadIO.disconnect();
        load()
          .then((m) => m.default(canvasRef.current, { ...options, reducedMotion }))
          .then((scene) => {
            if (disposed) { scene.dispose(); return; }
            api = scene;
            if (progress) api.setProgress?.(progress.get());
            visIO.observe(el); // la prima notifica avvia (o ferma) il loop
            setReady(true);
          })
          .catch((err) => {
            console.warn("[Scene3D] scena 3D non disponibile:", err?.message || err);
            if (!disposed) setFailed(true);
          });
      },
      { rootMargin: "500px 0px" },
    );
    loadIO.observe(el);
    const unsub = progress?.on("change", (v) => api?.setProgress?.(v));

    return () => {
      disposed = true;
      loadIO.disconnect();
      visIO.disconnect();
      unsub?.();
      api?.dispose();
    };
    // la scena viene creata una sola volta per montaggio
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={wrapRef} className={className} aria-hidden="true">
      {failed ? (
        fallback
      ) : (
        <>
          {placeholder && (
            <div className={`absolute inset-0 transition-opacity duration-700 ${ready ? "opacity-0" : "opacity-100"}`}>{placeholder}</div>
          )}
          <canvas
            ref={canvasRef}
            className={`absolute inset-0 w-full h-full block transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"} ${canvasClassName}`}
          />
        </>
      )}
    </div>
  );
}
