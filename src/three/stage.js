// Infrastruttura condivisa delle scene 3D: renderer trasparente, camera, loop
// che gira solo quando la scena è visibile, resize automatico, cleanup completo.
import { WebGLRenderer, Scene, PerspectiveCamera, ACESFilmicToneMapping } from "three";

export const clamp01 = (t) => Math.min(1, Math.max(0, t));
export const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
export const smoothstep = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
// Avvicinamento esponenziale indipendente dal framerate
export const damp = (current, target, lambda, dt) => current + (target - current) * (1 - Math.exp(-lambda * dt));

export function createStage(canvas, {
  fov = 35, near = 0.1, far = 100, maxDpr = 2, antialias = true,
  reducedMotion = false, onFrame, onResize, toneMapping = false, exposure = 1,
} = {}) {
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias, powerPreference: "high-performance" });
  // tone mapping "da cinema" per le scene con materiali realistici (metallo, vetro)
  if (toneMapping) {
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = exposure;
  }
  const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new PerspectiveCamera(fov, 1, near, far);
  const size = { w: 1, h: 1, dpr, aspect: 1, tanV: Math.tan((fov * Math.PI) / 360) };

  let raf = 0;
  let running = false;
  let last = 0;
  let time = 0;

  const draw = (dt) => {
    onFrame?.(time, dt);
    renderer.render(scene, camera);
  };
  const loop = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    time += dt;
    draw(dt);
    raf = requestAnimationFrame(loop);
  };
  const start = () => {
    if (running || reducedMotion) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(loop);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    Object.assign(size, { w, h, aspect: w / h });
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    onResize?.(size);
    if (!running) draw(0);
  };
  // Il ResizeObserver parte solo alla prima resize() esplicita, cioè quando la scena
  // ha finito di costruirsi: prima non deve mai partire un frame (gli oggetti non esistono).
  const ro = new ResizeObserver(resize);
  let observing = false;

  return {
    renderer, scene, camera, size,
    /**
     * Compila gli shader prima del primo render. Dove il browser supporta la
     * compilazione parallela (KHR_parallel_shader_compile) non blocca lo scroll.
     */
    async warmup() {
      try {
        await renderer.compileAsync(scene, camera);
      } catch {
        /* compileAsync non disponibile: compilerà al primo render */
      }
    },
    /** Da chiamare a fine costruzione della scena: dimensiona e avvia l'osservazione. */
    resize() {
      if (!observing) {
        observing = true;
        ro.observe(canvas);
      }
      resize();
    },
    get time() { return time; },
    /** Ridisegna un frame quando il loop è fermo (reduced motion, fuori schermo). */
    invalidate() { if (!running) draw(0); },
    setVisible(v) {
      if (v) { start(); if (reducedMotion) draw(0); } else stop();
    },
    dispose() {
      stop();
      ro.disconnect();
      scene.traverse((o) => {
        o.geometry?.dispose?.();
        const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
        mats.forEach((m) => {
          Object.values(m).forEach((v) => v?.isTexture && v.dispose());
          m.dispose();
        });
      });
      scene.environment?.dispose?.();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}

/** Puntatore normalizzato (-1..1) rispetto a un elemento; `inside` se è sopra di esso. */
export function trackPointer(el) {
  const p = { x: 0, y: 0, inside: false, active: false };
  const onMove = (e) => {
    const r = el.getBoundingClientRect();
    p.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    p.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
    p.inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    p.active = true;
  };
  const onLeave = () => { p.inside = false; };
  window.addEventListener("pointermove", onMove, { passive: true });
  document.documentElement.addEventListener("pointerleave", onLeave);
  p.dispose = () => {
    window.removeEventListener("pointermove", onMove);
    document.documentElement.removeEventListener("pointerleave", onLeave);
  };
  return p;
}
