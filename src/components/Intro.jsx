import { useEffect, useRef, useState } from "react";

// Intro cinematografico: il video dell'aquila Garuda plana verso lo schermo e apre la hero.
// Alla fine l'overlay si dissolve (crossfade) sulla hero: nessuno stacco netto.
// Se il video non parte usa il fallback CSS. Una volta per sessione, skip al click.
export default function Intro() {
  const videoRef = useRef(null);
  const [show, setShow] = useState(() => {
    if (typeof window === "undefined") return false;
    if (sessionStorage.getItem("intro-seen")) return false;
    return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });
  const [fallback, setFallback] = useState(false);
  const [exiting, setExiting] = useState(false); // avvia la dissolvenza

  useEffect(() => {
    if (!show) return;
    sessionStorage.setItem("intro-seen", "1");
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    window.scrollTo(0, 0);
    const v = videoRef.current;
    if (v) {
      v.muted = true;
      const p = v.play();
      if (p && p.catch) p.catch(() => setFallback(true));
    }
    // rete di sicurezza: se il video si blocca, esci dopo 9s
    const t = setTimeout(() => setExiting(true), 9000);
    return () => { clearTimeout(t); html.style.overflow = prev; };
  }, [show]);

  // fallback CSS: dopo 2.4s avvia la dissolvenza
  useEffect(() => {
    if (!fallback) return;
    const t = setTimeout(() => setExiting(true), 2400);
    return () => clearTimeout(t);
  }, [fallback]);

  // durante la dissolvenza sblocca lo scroll, poi smonta
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
      className={`fixed inset-0 z-[300] grid place-items-center overflow-hidden bg-ink cursor-pointer ${fallback ? "intro-overlay" : ""}`}
      aria-hidden="true"
    >
      {!fallback ? (
        <video
          ref={videoRef}
          src="/portfolio/intro-garuda.mp4"
          poster="/portfolio/intro-poster.jpg"
          autoPlay
          muted
          playsInline
          preload="auto"
          onEnded={() => setExiting(true)}
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

      {!exiting && (
        <span className="absolute bottom-6 right-6 text-[11px] font-mono text-mist/50 pointer-events-none">
          clicca per saltare
        </span>
      )}
    </div>
  );
}
