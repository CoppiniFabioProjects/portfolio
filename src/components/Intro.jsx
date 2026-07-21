import { useEffect, useRef, useState } from "react";

// Intro cinematografico: il video dell'aquila Garuda plana verso lo schermo e apre la hero.
// Se il video non parte (autoplay bloccato/errore) usa il fallback in CSS.
// Una volta per sessione, skip al click, rispetta prefers-reduced-motion.
export default function Intro() {
  const videoRef = useRef(null);
  const [show, setShow] = useState(() => {
    if (typeof window === "undefined") return false;
    if (sessionStorage.getItem("intro-seen")) return false;
    return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    if (!show) return;
    sessionStorage.setItem("intro-seen", "1");
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    window.scrollTo(0, 0);
    // prova a far partire il video; se fallisce → fallback CSS
    const v = videoRef.current;
    if (v) {
      v.muted = true;
      const p = v.play();
      if (p && p.catch) p.catch(() => setFallback(true));
    }
    // rete di sicurezza: se qualcosa si blocca, chiudi dopo 9s
    const t = setTimeout(() => setShow(false), 9000);
    return () => { clearTimeout(t); html.style.overflow = prev; };
  }, [show]);

  // durata del fallback CSS (2.4s)
  useEffect(() => {
    if (!fallback) return;
    const t = setTimeout(() => setShow(false), 2600);
    return () => clearTimeout(t);
  }, [fallback]);

  if (!show) return null;

  return (
    <div
      onClick={() => setShow(false)}
      className={`fixed inset-0 z-[300] grid place-items-center overflow-hidden bg-ink cursor-pointer ${fallback ? "intro-overlay" : ""}`}
      aria-hidden="true"
    >
      {!fallback ? (
        <video
          ref={videoRef}
          src="/portfolio/intro-garuda.mp4"
          autoPlay
          muted
          playsInline
          preload="auto"
          onEnded={() => setShow(false)}
          onError={() => setFallback(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <>
          <div className="intro-glow absolute w-[42rem] h-[42rem] max-w-[90vw] max-h-[90vw] rounded-full bg-purple/30 blur-[110px]" />
          <img
            src="/portfolio/garuda.png"
            alt=""
            className="intro-eagle relative w-[440px] max-w-[80vw] object-contain drop-shadow-[0_0_70px_rgba(168,85,247,0.6)] select-none pointer-events-none"
          />
          <span className="intro-sign absolute bottom-[16%] kicker text-mist">
            Libero come un'aquila
          </span>
        </>
      )}

      {/* suggerimento skip */}
      <span className="absolute bottom-6 right-6 text-[11px] font-mono text-mist/50 pointer-events-none">
        clicca per saltare
      </span>
    </div>
  );
}
