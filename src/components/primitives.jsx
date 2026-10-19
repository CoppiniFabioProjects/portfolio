import { Fragment, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Lenis from "lenis";

const EASE = [0.22, 1, 0.36, 1];

/* Scroll morbido (Lenis) su desktop; su touch resta quello nativo. Rispetta "riduci movimento". */
let lenis = null;

// Posizione "di layout" di un elemento: ignora le trasformazioni delle animazioni d'ingresso
export const layoutTop = (el) => {
  let y = 0;
  for (let n = el; n; n = n.offsetParent) y += n.offsetTop;
  return y;
};
const target = (el) => Math.max(0, layoutTop(el) - (el.id === "hero" ? 0 : 24));

// Scorre a una sezione (con Lenis se attivo) e ferma/riprende lo scroll sotto i pannelli aperti
export const smooth = {
  to(id) {
    const el = document.getElementById(id);
    if (!el) return;
    if (lenis) lenis.scrollTo(target(el), { duration: 1.6 });
    else window.scrollTo({ top: target(el), behavior: "smooth" });
  },
  toY(y) {
    if (lenis) lenis.scrollTo(Math.max(0, y));
    else window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
  },
  stop: () => lenis?.stop(),
  start: () => lenis?.start(),
};

export function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const l = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenis = l;
    let raf;
    const loop = (time) => {
      l.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // link interni (#sezione) → scroll morbido
    const onClick = (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const el = document.querySelector(id);
      if (el) {
        e.preventDefault();
        l.scrollTo(target(el), { duration: 1.6 });
      }
    };
    document.addEventListener("click", onClick);
    return () => {
      cancelAnimationFrame(raf);
      l.destroy();
      if (lenis === l) lenis = null;
      document.removeEventListener("click", onClick);
    };
  }, []);
}

/* Compare salendo appena entra nello schermo */
export function Reveal({ children, delay = 0, className = "", as = "div", y = 28 }) {
  const Tag = motion[as] || motion.div;
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 1, ease: EASE, delay }}
    >
      {children}
    </Tag>
  );
}

/* Titolo che sale parola per parola da dietro una maschera */
export function Words({ text, className = "", delay = 0, stagger = 0.06, immediate = false, as = "span" }) {
  const Tag = motion[as] || motion.span;
  const trigger = immediate ? { animate: "show" } : { whileInView: "show", viewport: { once: true, margin: "-6% 0px" } };
  return (
    <Tag className={className} initial="hidden" {...trigger}>
      <span className="sr-only">{text}</span>
      {text.split(" ").map((w, i) => (
        <Fragment key={i}>
          {i > 0 && " "}
          <span aria-hidden="true" className="inline-block overflow-hidden align-bottom pb-[0.1em] -mb-[0.1em]">
            <motion.span
              className="inline-block"
              variants={{
                hidden: { y: "105%" },
                show: { y: "0%", transition: { duration: 1, ease: EASE, delay: delay + i * stagger } },
              }}
            >
              {w}
            </motion.span>
          </span>
        </Fragment>
      ))}
    </Tag>
  );
}

/* Un paragrafo che si accende parola per parola mentre lo si scorre */
function Word({ progress, from, to, children }) {
  const opacity = useTransform(progress, [from, to], [0.16, 1]);
  return <motion.span style={{ opacity }}>{children} </motion.span>;
}
export function ScrollWords({ text, className = "" }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.5"] });
  const words = text.split(" ");
  return (
    <p ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((w, i) => (
          <Word key={i} progress={scrollYProgress} from={i / words.length} to={(i + 1) / words.length}>
            {w}
          </Word>
        ))}
      </span>
    </p>
  );
}

/* Testata di sezione: numero, nome e una riga sottile; sotto, il titolo grande (se c'è) */
export function SectionHead({ index, label, sub, title = true }) {
  return (
    <header className="mb-14 md:mb-20">
      <Reveal y={12} className="flex items-baseline justify-between gap-6 border-t border-line pt-4 text-[13px]">
        <span className="font-mono text-dim">({index})</span>
        {sub && <span className="hidden md:block text-dim max-w-md text-right">{sub}</span>}
      </Reveal>
      {title && (
        <h2 className="mt-6 md:mt-8 text-[clamp(3rem,10vw,10rem)] font-medium leading-[0.86] tracking-[-0.055em] text-fg">
          <Words text={label} />
        </h2>
      )}
      {sub && <p className="md:hidden mt-5 text-dim text-[15px] leading-relaxed max-w-md">{sub}</p>}
    </header>
  );
}
