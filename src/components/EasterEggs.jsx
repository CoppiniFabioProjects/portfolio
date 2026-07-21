import { useEffect, useState, useRef } from "react";

const KONAMI = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a",
];

export default function EasterEggs() {
  const [eagles, setEagles] = useState(null); // array | null
  const idx = useRef(0);
  const timer = useRef(0);

  // Saluto per gli sviluppatori curiosi (DevTools)
  useEffect(() => {
    const s1 = "color:#c084fc;font-size:20px;font-weight:bold";
    const s2 = "color:#5eead4;font-size:12px";
    const s3 = "color:#94a3b8;font-size:11px";
    console.log("%c🦅 Ciao, smanettone.", s1);
    console.log("%cSe sei qui, sei uno dei miei. Libero come un'aquila.", s2);
    console.log("%cProva il codice Konami sulla pagina: ↑ ↑ ↓ ↓ ← → ← → B A", s3);
    console.log("%c…oppure scrivi 'help' nel terminale nella sezione Linux.", s3);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      idx.current = key === KONAMI[idx.current] ? idx.current + 1 : (key === KONAMI[0] ? 1 : 0);
      if (idx.current === KONAMI.length) {
        idx.current = 0;
        trigger();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const trigger = () => {
    const emojis = ["🦅", "🦅", "🦅", "✨", "🐧"];
    const arr = Array.from({ length: 42 }, (_, i) => ({
      id: i + "-" + Date.now(),
      left: Math.random() * 100,
      delay: Math.random() * 1.2,
      dur: 2.6 + Math.random() * 2.4,
      size: 1.4 + Math.random() * 2,
      char: emojis[Math.floor(Math.random() * emojis.length)],
    }));
    setEagles(arr);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setEagles(null), 5200);
  };

  if (!eagles) return null;

  return (
    <div className="fixed inset-0 z-[205] pointer-events-none" aria-hidden="true">
      {eagles.map((e) => (
        <span
          key={e.id}
          className="egg-emoji"
          style={{
            left: `${e.left}vw`,
            fontSize: `${e.size}rem`,
            animationDelay: `${e.delay}s`,
            animationDuration: `${e.dur}s`,
          }}
        >
          {e.char}
        </span>
      ))}
      <div className="egg-toast glass rounded-full px-6 py-3 border border-purple/40 shadow-2xl shadow-purple/30">
        <span className="font-display text-white text-sm md:text-base">
          🦅 Modalità Aquila attivata — <span className="text-gradient italic">libero come un'aquila</span>
        </span>
      </div>
    </div>
  );
}
