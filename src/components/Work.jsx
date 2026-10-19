import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { DustImage, DustCanvas } from "../dust/Dust";
import { SectionHead, Reveal } from "./primitives";
import { flagship, projects } from "../data/content";
import { ui } from "../data/ui";

const pad = (i) => String(i).padStart(2, "0");

// Tutti i progetti in fila: prima quelli di punta, poi gli altri
const items = [
  ...flagship.map((p) => ({ ...p, flagship: true })),
  ...projects.map((p, i) => ({ ...p, index: pad(flagship.length + i + 1) })),
];

// misure naturali delle immagini (servono per riservare lo spazio prima del caricamento)
const SIZES = {
  "/portfolio/spostiamoci-poster.webp": [720, 1280],
  "/portfolio/digitalions.webp": [1600, 1000],
  "/portfolio/CHALLENGE_2.webp": [1400, 671],
};

// Lo schema "da → via → a" disegnato a mano: linee sottili e testo, niente nomi interni.
// In orizzontale su schermi larghi, in verticale (e con il testo più grande) sul telefono.
function diagram(d, vertical) {
  return (ctx, W, H) => {
    const css = getComputedStyle(document.documentElement);
    const fg = css.getPropertyValue("--color-fg").trim() || "#edece8";
    const dim = css.getPropertyValue("--color-dim").trim() || "#8e8d95";
    const violet = css.getPropertyValue("--color-violet").trim() || "#a78bfa";
    const k = vertical ? 1.45 : 1;
    const box = (cx, cy, w, h, title, sub, hl) => {
      ctx.lineWidth = (hl ? 2.5 : 1.5) * k;
      ctx.strokeStyle = hl ? violet : fg;
      ctx.beginPath();
      ctx.roundRect(cx - w / 2, cy - h / 2, w, h, 18 * k);
      ctx.stroke();
      ctx.fillStyle = hl ? violet : fg;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `500 ${(hl ? 34 : 30) * k}px Inter, sans-serif`;
      ctx.fillText(title, cx, cy - (sub ? 18 * k : 0));
      if (sub) {
        ctx.fillStyle = dim;
        ctx.font = `400 ${22 * k}px 'JetBrains Mono', monospace`;
        ctx.fillText(sub, cx, cy + 24 * k);
      }
    };
    // doppia freccia tratteggiata: i dati vanno e tornano
    const link = (x1, y1, x2, y2) => {
      const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
      const ux = dx / len, uy = dy / len, nx = -uy * 10 * k, ny = ux * 10 * k, h = 12 * k;
      ctx.strokeStyle = fg;
      ctx.lineWidth = 1.5 * k;
      ctx.lineCap = "round";
      ctx.setLineDash([2 * k, 9 * k]);
      ctx.beginPath();
      ctx.moveTo(x1 + nx, y1 + ny); ctx.lineTo(x2 + nx, y2 + ny);
      ctx.moveTo(x1 - nx, y1 - ny); ctx.lineTo(x2 - nx, y2 - ny);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(x2 + nx - ux * h + nx * 0.8, y2 + ny - uy * h + ny * 0.8); ctx.lineTo(x2 + nx, y2 + ny); ctx.lineTo(x2 + nx - ux * h - nx * 0.8, y2 + ny - uy * h - ny * 0.8);
      ctx.moveTo(x1 - nx + ux * h + nx * 0.8, y1 - ny + uy * h + ny * 0.8); ctx.lineTo(x1 - nx, y1 - ny); ctx.lineTo(x1 - nx + ux * h - nx * 0.8, y1 - ny + uy * h - ny * 0.8);
      ctx.stroke();
    };
    if (vertical) {
      const bw = W * 0.82, bh = 190;
      const y1 = 120, y2 = 410, y3 = 700;
      box(W / 2, y1, bw, bh, d.from[0], d.from[1]);
      box(W / 2, y2, W * 0.62, 170, d.via, null, true);
      box(W / 2, y3, bw, bh, d.to[0], d.to[1]);
      link(W / 2, y1 + bh / 2 + 18, W / 2, y2 - 85 - 18);
      link(W / 2, y2 + 85 + 18, W / 2, y3 - bh / 2 - 18);
    } else {
      const y = H * 0.46, bw = W * 0.32;
      box(W * 0.17, y - 120, bw, 150, d.from[0], d.from[1]);
      box(W * 0.5, y + 70, W * 0.26, 130, d.via, null, true);
      box(W * 0.83, y - 120, bw, 150, d.to[0], d.to[1]);
      ctx.strokeStyle = fg;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(W * 0.17, y - 45); ctx.lineTo(W * 0.17, y + 70);
      ctx.moveTo(W * 0.83, y - 45); ctx.lineTo(W * 0.83, y + 70);
      ctx.stroke();
      link(W * 0.17, y + 70, W * 0.37 - 14, y + 70);
      link(W * 0.63 + 14, y + 70, W * 0.83, y + 70);
    }
    if (d.note) {
      ctx.fillStyle = dim;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `400 ${vertical ? 26 : 24}px 'JetBrains Mono', monospace`;
      ctx.fillText(`✓ ${d.note}`, W / 2, H - (vertical ? 80 : 70));
    }
  };
}
const drawers = new Map();
const drawerFor = (p, vertical) => {
  const key = `${p.title}-${vertical}`;
  if (!drawers.has(key)) drawers.set(key, diagram(p.screen.diagram, vertical));
  return drawers.get(key);
};
const narrow = () => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;

function Media({ p }) {
  const id = `p-${p.title}`;
  const [vertical] = useState(narrow);
  if (!p.image) {
    return (
      <DustCanvas
        id={id}
        draw={drawerFor(p, vertical)}
        width={vertical ? 760 : 1200}
        height={vertical ? 1000 : 760}
        label={`${p.screen.diagram.from[0]} ⇄ ${p.screen.diagram.via} ⇄ ${p.screen.diagram.to[0]}`}
        className={`block h-auto ${vertical ? "w-[86%] mx-auto" : "w-full"}`}
      />
    );
  }
  const [w, h] = SIZES[p.image] || [1600, 1000];
  const tall = h > w;
  return (
    <div className={`frame ${tall ? "w-fit mx-auto" : "w-full"}`}>
      <DustImage
        id={id}
        src={p.image}
        alt={`${ui.projects.preview} ${p.title}`}
        width={w}
        height={h}
        loading="lazy"
        radius={14}
        className={`block ${tall ? "h-[min(68svh,700px)] w-auto" : "w-full h-auto"}`}
      />
    </div>
  );
}

function Text({ p, n }) {
  return (
    <div className="max-w-xl">
      <div className="label flex items-center gap-3 mb-6">
        <span className="text-fg">{p.index}</span>
        <span>/ {pad(n)}</span>
        <span>· {p.flagship ? ui.projects.flagship : ui.projects.others}</span>
        {p.status && (
          <span className="ml-auto inline-flex items-center gap-1.5 text-violet">
            <span className="w-1.5 h-1.5 rounded-full bg-violet blink" /> {p.status}
          </span>
        )}
      </div>
      <h3 className="text-[clamp(2.5rem,5vw,5.4rem)] font-medium leading-[0.92] tracking-[-0.055em] text-fg break-words">{p.title}</h3>
      {p.tagline && <p className="serif-i text-[clamp(1.3rem,2vw,1.9rem)] text-dim mt-3">{p.tagline}</p>}
      <p className="mt-6 text-[15px] md:text-base leading-relaxed text-dim">{p.body}</p>
      {p.metrics && (
        <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-line pt-5">
          {p.metrics.map((m) => (
            <div key={m.label}>
              <dt className="sr-only">{m.label}</dt>
              <dd className="text-[clamp(1.25rem,2.2vw,2rem)] font-medium tracking-[-0.03em] text-fg leading-none">{m.value}</dd>
              <dd className="mt-2 text-[11px] leading-snug text-dim">{m.label}</dd>
            </div>
          ))}
        </dl>
      )}
      <p className="mt-6 font-mono text-[11px] text-dim">{p.tags.join("  ·  ")}</p>
      {p.link && (
        <a
          href={p.link}
          target="_blank"
          rel="noreferrer"
          className="group mt-8 inline-flex items-center gap-2 text-[15px] text-fg"
        >
          <span className="u-link-on pb-0.5">{p.linkLabel}</span>
          <ArrowUpRight className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
      )}
    </div>
  );
}

export default function Work() {
  return (
    <section id="projects" className="gutter pt-[14vh] pb-[10vh]">
      <SectionHead index="02" label={ui.projects.label} sub={ui.projects.sub} />
      <div className="space-y-[22vh] md:space-y-[26vh]">
        {items.map((p, i) => (
          <article key={p.title} className="grid md:grid-cols-12 gap-y-10 md:gap-x-6 items-center">
            <div className={`md:col-span-7 ${i % 2 ? "md:order-2 md:col-start-6" : ""}`}>
              <Media p={p} />
            </div>
            <Reveal className={`md:col-span-5 ${i % 2 ? "md:order-1 md:col-start-1 md:row-start-1" : "md:col-start-8 lg:col-start-9 lg:col-span-4"}`}>
              <Text p={p} n={items.length} />
            </Reveal>
          </article>
        ))}
      </div>
    </section>
  );
}
