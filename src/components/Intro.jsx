import { useEffect, useState } from "react";

// Intro cinematografico: l'aquila Garuda (low-poly, nitida) plana verso lo schermo
// e apre la hero con un crossfade morbido. Animazione 100% CSS/vettoriale: niente
// video, massima qualità e peso quasi nullo. Una volta per sessione, skip al click.
export default function Intro() {
  const [show, setShow] = useState(() => {
    if (typeof window === "undefined") return false;
    if (sessionStorage.getItem("intro-seen")) return false;
    return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });
  const [exiting, setExiting] = useState(false);

  // Blocca lo scroll e avvia la dissolvenza al termine dell'animazione (~2.6s)
  useEffect(() => {
    if (!show) return;
    sessionStorage.setItem("intro-seen", "1");
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    window.scrollTo(0, 0);
    const t = setTimeout(() => setExiting(true), 2600);
    return () => { clearTimeout(t); html.style.overflow = prev; };
  }, [show]);

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
      <div className="intro-glow absolute w-[42rem] h-[42rem] max-w-[90vw] max-h-[90vw] rounded-full bg-purple/30 blur-[110px]" />
      <img
        src="/portfolio/garuda.png"
        alt=""
        className="intro-eagle relative w-[440px] max-w-[80vw] object-contain drop-shadow-[0_0_70px_rgba(168,85,247,0.6)] select-none pointer-events-none"
      />
      <span className="intro-sign absolute bottom-[16%] kicker text-mist">
        Libero come un'aquila
      </span>

      {!exiting && (
        <span className="absolute bottom-6 right-6 text-[11px] font-mono text-mist/50 pointer-events-none">
          clicca per saltare
        </span>
      )}
    </div>
  );
}
