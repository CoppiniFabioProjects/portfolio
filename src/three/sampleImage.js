// Campiona i pixel visibili di un'immagine (es. garuda.png) per costruire
// nuvole di particelle. Restituisce coordinate normalizzate, colore e luminosità.
export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * @returns {Promise<Array<{u:number, v:number, r:number, g:number, b:number, lum:number}>>}
 *   u/v in 0..1 (v cresce verso il basso), colori in 0..1.
 */
export async function sampleImage(src, { size = 460, step = 3, alphaMin = 120 } = {}) {
  const img = await loadImage(src);
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, size, size);
  const { data } = ctx.getImageData(0, 0, size, size);
  const out = [];
  for (let y = 0; y < size; y += step) {
    for (let x = 0; x < size; x += step) {
      const i = (y * size + x) * 4;
      if (data[i + 3] < alphaMin) continue;
      const r = data[i] / 255, g = data[i + 1] / 255, b = data[i + 2] / 255;
      out.push({ u: x / size, v: y / size, r, g, b, lum: 0.299 * r + 0.587 * g + 0.114 * b });
    }
  }
  return out;
}
