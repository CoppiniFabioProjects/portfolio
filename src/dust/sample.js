// Campionamento: da un'immagine (o un canvas) a N granelli di polvere.
// Ogni granello ha una posizione normalizzata (u, v in 0..1 sul riquadro dell'immagine)
// e il colore del pixel da cui viene. I punti sono quasi uniformi (niente grumi né buchi):
// si sceglie una risoluzione con tanti pixel pieni quanti granelli, poi si pescano senza ripetere.

// generatore pseudo-casuale con seme: lo stesso disegno a ogni caricamento
export function rng(seed = 1) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

function draw(src, w, h, radius) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (radius > 0) {
    // stessi angoli arrotondati dell'immagine nella pagina
    const r = radius * w;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(0, 0, w, h, r) : ctx.rect(0, 0, w, h);
    ctx.clip();
  }
  ctx.drawImage(src, 0, 0, w, h);
  return ctx.getImageData(0, 0, w, h).data;
}

const ALPHA_MIN = 96;

/**
 * @param src   HTMLImageElement già caricata, o HTMLCanvasElement
 * @param N     numero di granelli
 * @param opts  radius: raggio degli angoli in frazione della larghezza;
 *              fade(v): opacità in base all'altezza (per immagini sfumate in basso)
 * @returns { u, v, col (Uint8 RGBA), coverage }
 */
export function sample(src, N, { radius = 0, fade = null, seed = 7 } = {}) {
  const sw = src.naturalWidth || src.width;
  const sh = src.naturalHeight || src.height;
  const aspect = sw / sh;

  // 1) quanto dell'immagine è pieno (le immagini con trasparenza ne riempiono solo una parte)
  const pw = 96;
  const ph = Math.max(1, Math.round(pw / aspect));
  const probe = draw(src, pw, ph, radius);
  let full = 0;
  for (let i = 3; i < probe.length; i += 4) if (probe[i] > ALPHA_MIN) full++;
  const cov0 = Math.max(0.02, full / (pw * ph));

  // 2) risoluzione con circa un pixel pieno per granello (un po' di più, per scegliere)
  const total = (N * 1.08) / cov0;
  const w = Math.max(8, Math.round(Math.sqrt(total * aspect)));
  const h = Math.max(8, Math.round(w / aspect));
  const data = draw(src, w, h, radius);
  const filled = [];
  for (let i = 0, p = 0; p < data.length; i++, p += 4) if (data[p + 3] > ALPHA_MIN) filled.push(i);
  if (!filled.length) filled.push(0);

  // 3) pesca senza ripetere (se i pixel non bastano, si ricomincia con un piccolo scarto)
  const rand = rng(seed);
  for (let i = filled.length - 1; i > 0; i--) {
    const j = (rand() * (i + 1)) | 0;
    const t = filled[i]; filled[i] = filled[j]; filled[j] = t;
  }
  const pts = new Array(N);
  for (let k = 0; k < N; k++) {
    const idx = filled[k % filled.length];
    const x = idx % w;
    const y = (idx / w) | 0;
    const p = idx * 4;
    const u = (x + 0.2 + rand() * 0.6) / w;
    const v = (y + 0.2 + rand() * 0.6) / h;
    const f = fade ? fade(v) : 1;
    // l'ordine per altezza (con un po' di disordine) collega i granelli tra un'immagine e l'altra:
    // la parte bassa di un'immagine diventa la parte bassa della successiva
    pts[k] = { u, v, key: v + (rand() - 0.5) * 0.08, r: data[p], g: data[p + 1], b: data[p + 2], a: Math.round(255 * f) };
  }
  pts.sort((a, b) => a.key - b.key);

  const u = new Float32Array(N);
  const v = new Float32Array(N);
  const col = new Uint8Array(N * 4);
  pts.forEach((q, k) => {
    u[k] = q.u;
    v[k] = q.v;
    col[k * 4] = q.r;
    col[k * 4 + 1] = q.g;
    col[k * 4 + 2] = q.b;
    col[k * 4 + 3] = q.a;
  });
  return { u, v, col, coverage: filled.length / (w * h) };
}
