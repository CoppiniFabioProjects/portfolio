import { useEffect, useRef, useState } from "react";

// Cursore (solo desktop con mouse): un punto bianco in "differenza" che si allarga
// sugli elementi cliccabili e sulle immagini di polvere.
export default function Cursor() {
  const ref = useRef(null);
  const [enabled] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches,
  );

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    document.body.classList.add("has-custom-cursor");
    let mx = -100, my = -100, x = -100, y = -100, s = 0.2, sTo = 0.2, raf = 0, shown = false;

    const loop = () => {
      x += (mx - x) * 0.22;
      y += (my - y) * 0.22;
      s += (sTo - s) * 0.18;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${s})`;
      raf = Math.abs(mx - x) + Math.abs(my - y) + Math.abs(sTo - s) > 0.05 ? requestAnimationFrame(loop) : 0;
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
    const onMove = (e) => {
      mx = e.clientX; my = e.clientY;
      if (!shown) { shown = true; x = mx; y = my; el.style.opacity = "1"; }
      kick();
    };
    const INTERACTIVE = "a, button, input, textarea, select, label, [role='option'], [role='application']";
    const onOver = (e) => {
      const t = e.target;
      sTo = t.closest?.(INTERACTIVE) ? 1 : t.closest?.("[data-dust]") ? 0.4 : 0.2;
      kick();
    };
    const onLeave = () => { shown = false; el.style.opacity = "0"; };
    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      document.body.classList.remove("has-custom-cursor");
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;
  return <div ref={ref} className="cursor" aria-hidden="true" />;
}
