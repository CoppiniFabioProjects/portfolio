import { useEffect, useState } from "react";

// Intro cinematografico: l'aquila plana verso lo schermo e "apre" la hero.
// Animazioni CSS pure (durata garantita). Una volta per sessione. Cliccando si salta.
export default function Intro() {
  const [show, setShow] = useState(() => {
    if (typeof window === "undefined") return false;
    if (sessionStorage.getItem("intro-seen")) return false;
    return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (!show) return;
    sessionStorage.setItem("intro-seen", "1");
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    window.scrollTo(0, 0);
    // l'animazione CSS dura 2.4s; smonto poco dopo, quando l'overlay è già sfumato
    const t = setTimeout(() => setShow(false), 2500);
    return () => { clearTimeout(t); html.style.overflow = prev; };
  }, [show]);

  if (!show) return null;

  return (
    <div
      onClick={() => setShow(false)}
      className="intro-overlay fixed inset-0 z-[300] grid place-items-center overflow-hidden bg-ink cursor-pointer"
    >
      <div className="intro-glow absolute w-[42rem] h-[42rem] max-w-[90vw] max-h-[90vw] rounded-full bg-purple/30 blur-[110px]" />
      <img
        src="/portfolio/garuda.png"
        alt=""
        aria-hidden="true"
        className="intro-eagle relative w-[440px] max-w-[80vw] object-contain drop-shadow-[0_0_70px_rgba(168,85,247,0.6)] select-none pointer-events-none"
      />
      <span className="intro-sign absolute bottom-[16%] kicker text-mist">
        Libero come un'aquila
      </span>
    </div>
  );
}
