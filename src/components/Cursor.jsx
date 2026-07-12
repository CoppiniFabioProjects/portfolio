import { useEffect, useRef, useState } from "react";

// Cursore custom — solo desktop (hover + pointer fine). Un punto che segue
// esatto e un anello che insegue con lerp; l'anello cresce sugli elementi interattivi.
export default function Cursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  // Calcolato subito alla prima render: così i div esistono quando l'effect parte
  const [enabled] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches
  );

  useEffect(() => {
    if (!enabled) return;
    document.body.classList.add("has-custom-cursor");

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let raf;
    let visible = false;

    const onMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
      if (!visible) {
        visible = true;
        dot.style.opacity = "1";
        ring.style.opacity = "1";
      }
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    };

    const loop = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const INTERACTIVE = "a, button, [data-cursor], input, textarea, select, summary, label";
    const onOver = (e) => {
      if (e.target.closest(INTERACTIVE)) document.body.classList.add("cursor-hover");
    };
    const onOut = (e) => {
      if (e.target.closest(INTERACTIVE)) document.body.classList.remove("cursor-hover");
    };
    const onDown = () => document.body.classList.add("cursor-down");
    const onUp = () => document.body.classList.remove("cursor-down");
    const onLeave = () => {
      visible = false;
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });
    document.addEventListener("mouseout", onOut, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      document.body.classList.remove("has-custom-cursor", "cursor-hover", "cursor-down");
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <>
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
    </>
  );
}
