// Il motore della polvere: un solo strato di particelle per tutta la pagina.
// Ogni immagine "con la polvere" (uno slot) viene campionata in N granelli. Quando lo slot
// arriva al centro dello schermo i granelli ci volano sopra e lo compongono; appena sono
// fermi l'immagine vera compare al loro posto e il motore si spegne (zero lavoro da fermo).
// Quando lo slot se ne va, l'immagine si sbriciola e la sua polvere vola verso il successivo.
// WebGL puro, niente librerie: la fisica (molle + un campo di flusso) gira in JS, la GPU disegna i punti.
import { sample, rng } from "./sample";

const VERT = `
attribute vec4 aP;
attribute vec4 aC;
uniform vec2 uView;
uniform float uDpr;
uniform float uAlpha;
varying vec4 vC;
varying float vE;
void main() {
  vec2 c = aP.xy / uView * 2.0 - 1.0;
  gl_Position = vec4(c.x, -c.y, 0.0, 1.0);
  gl_PointSize = max(1.0, aP.z * uDpr);
  vC = vec4(aC.rgb, aC.a * uAlpha);
  vE = aP.w;
}`;

// un granello è un disco morbido; in volo si accende e tende al violetto dell'aquila
const FRAG = `
precision mediump float;
varying vec4 vC;
varying float vE;
void main() {
  float r = length(gl_PointCoord - 0.5);
  float a = 1.0 - smoothstep(0.5 - mix(0.16, 0.42, vE), 0.5, r);
  vec3 col = mix(vC.rgb, vec3(0.80, 0.74, 1.0), vE * 0.6);
  float al = vC.a * a * (1.0 + vE * 0.4);
  gl_FragColor = vec4(col * al, al);
}`;

function program(gl) {
  const sh = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  };
  const p = gl.createProgram();
  gl.attachShader(p, sh(gl.VERTEX_SHADER, VERT));
  gl.attachShader(p, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  return p;
}

const FLOW = 1500; // forza del vento che fa vorticare la polvere in volo (px/s²)

export function createEngine(canvas, { count, touch = false, onFail } = {}) {
  const gl = canvas.getContext("webgl", {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "high-performance",
  });
  if (!gl) return null;
  let prog;
  try { prog = program(gl); } catch { return null; }

  const N = count;
  const P = new Float32Array(N * 4); // x, y, dimensione, energia → GPU
  const C = new Uint8Array(N * 4); // colore → GPU
  const cf = new Float32Array(N * 4); // colore corrente, sfumato verso quello dello slot
  const vx = new Float32Array(N);
  const vy = new Float32Array(N);
  const rel = new Float32Array(N); // quando il granello si stacca dall'immagine di partenza
  const om = new Float32Array(N); // rigidità della molla: chi arriva prima, chi dopo
  const ph = new Float32Array(N); // fase nel campo di flusso
  const rnd = rng(11);
  for (let i = 0; i < N; i++) {
    om[i] = 3.1 + rnd() * 2.7;
    ph[i] = rnd() * Math.PI * 2;
  }

  gl.useProgram(prog);
  const loc = {
    aP: gl.getAttribLocation(prog, "aP"),
    aC: gl.getAttribLocation(prog, "aC"),
    uView: gl.getUniformLocation(prog, "uView"),
    uDpr: gl.getUniformLocation(prog, "uDpr"),
    uAlpha: gl.getUniformLocation(prog, "uAlpha"),
  };
  const bufP = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufP);
  gl.bufferData(gl.ARRAY_BUFFER, P.byteLength, gl.DYNAMIC_DRAW);
  gl.enableVertexAttribArray(loc.aP);
  gl.vertexAttribPointer(loc.aP, 4, gl.FLOAT, false, 0, 0);
  const bufC = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufC);
  gl.bufferData(gl.ARRAY_BUFFER, C.byteLength, gl.DYNAMIC_DRAW);
  gl.enableVertexAttribArray(loc.aC);
  gl.vertexAttribPointer(loc.aC, 4, gl.UNSIGNED_BYTE, true, 0, 0);
  gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  let vw = 1, vh = 1, dpr = 1;
  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, touch ? 1.5 : 2);
    vw = canvas.clientWidth || window.innerWidth;
    vh = canvas.clientHeight || window.innerHeight;
    canvas.width = Math.round(vw * dpr);
    canvas.height = Math.round(vh * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    if (mode === "hidden") gl.clear(gl.COLOR_BUFFER_BIT);
    else wake();
    schedulePick();
  };

  // ---- slot ------------------------------------------------------------
  const slots = new Map();
  let frame = 0;
  const rectOf = (s) => {
    if (s._f !== frame) { s._r = s.el.getBoundingClientRect(); s._f = frame; }
    return s._r;
  };
  // granelli abbastanza grandi da coprire l'immagine senza buchi
  const grain = (s, r) => Math.min(7, Math.max(1.1, Math.sqrt((r.width * r.height * s.s.coverage) / N) * 1.45));
  const setMedia = (s, o, ms) => {
    s.media.style.transition = `opacity ${ms}ms ease`;
    s.media.style.opacity = String(o);
  };

  // ---- stato -----------------------------------------------------------
  let mode = "hidden"; // hidden: nessun granello, si vede l'immagine vera di `shown` | live | settling
  let target = null; // dove vanno i granelli (null: si disperdono nell'aria)
  let source = null; // da dove partono quelli non ancora staccati
  let shown = null;
  let alpha = 0, alphaTo = 0, alphaRate = 2;
  let clock = 0, last = 0, raf = 0;
  let lastRelease = 0, retargetAt = 0, driftAt = 0;
  let dead = false;
  const pointer = { x: -1e5, y: -1e5, on: false, insideAt: -10 };

  const wake = () => {
    if (raf || dead) return;
    last = performance.now();
    raf = requestAnimationFrame(tick);
  };

  const outOfView = (r) => r.bottom < 0 || r.top > vh || r.right < 0 || r.left > vw;

  // i granelli si staccano dall'immagine di partenza a ondata, dal lato più vicino alla meta
  function crumble(from, next) {
    const rF = rectOf(from);
    const rN = next ? rectOf(next) : null;
    const down = rN ? rN.top + rN.height / 2 >= rF.top + rF.height / 2 : true;
    const col = from.s.col;
    for (let i = 0; i < N; i++) {
      const v = from.s.v[i];
      rel[i] = clock + 0.04 + (down ? 1 - v : v) * 0.6 + rnd() * 0.16;
      vx[i] = 0; vy[i] = 0;
      cf[i * 4] = col[i * 4]; cf[i * 4 + 1] = col[i * 4 + 1]; cf[i * 4 + 2] = col[i * 4 + 2]; cf[i * 4 + 3] = col[i * 4 + 3];
    }
    lastRelease = clock + 0.84;
    source = from;
    setMedia(from, 0, 160);
    alpha = 1; alphaTo = 1;
  }

  // dal nulla: un vortice che si stringe intorno alla meta
  function spawn(next) {
    const r = rectOf(next);
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const R = Math.max(vw, vh);
    const col = next.s.col;
    for (let i = 0; i < N; i++) {
      const a = rnd() * Math.PI * 2;
      const d = R * (0.3 + rnd() * 0.5);
      P[i * 4] = cx + Math.cos(a) * d;
      P[i * 4 + 1] = cy + Math.sin(a) * d * 0.75;
      const s = 340 * (0.5 + rnd());
      vx[i] = -Math.sin(a) * s;
      vy[i] = Math.cos(a) * s;
      rel[i] = clock;
      cf[i * 4] = col[i * 4]; cf[i * 4 + 1] = col[i * 4 + 1]; cf[i * 4 + 2] = col[i * 4 + 2]; cf[i * 4 + 3] = col[i * 4 + 3];
    }
    lastRelease = clock;
    source = null;
    alpha = 0; alphaTo = 1; alphaRate = 1.6;
  }

  function goTo(next) {
    if (dead) return;
    if (mode === "hidden" && next === shown) return;
    if (mode !== "hidden" && next === target) {
      if (mode === "settling") { mode = "live"; setMedia(next, 0, 120); alphaTo = 1; alphaRate = 4; }
      return;
    }
    const from = mode === "hidden" ? shown : mode === "settling" ? target : null;
    if (from && !outOfView(rectOf(from))) {
      crumble(from, next);
    } else if (from) {
      setMedia(from, 0, 0); // fuori schermo: tornerà a comporsi quando ci si ritorna
      if (next) spawn(next);
    } else if (mode === "hidden") {
      if (!next) { shown = null; return; }
      spawn(next);
    } else {
      alphaTo = 1; alphaRate = 3;
    }
    shown = null;
    target = next;
    retargetAt = clock;
    driftAt = clock;
    mode = "live";
    wake();
  }

  // il cursore (o il dito) sull'aquila: l'immagine torna polvere e si scansa
  function touchSlot(s) {
    const r = rectOf(s);
    for (let i = 0; i < N; i++) {
      P[i * 4] = r.left + s.s.u[i] * r.width;
      P[i * 4 + 1] = r.top + s.s.v[i] * r.height;
      vx[i] = 0; vy[i] = 0; rel[i] = clock;
      for (let k = 0; k < 4; k++) cf[i * 4 + k] = s.s.col[i * 4 + k];
    }
    source = null;
    target = s;
    shown = null;
    mode = "live";
    retargetAt = clock;
    lastRelease = clock;
    alpha = 1; alphaTo = 1;
    setMedia(s, 0, 90);
    wake();
  }

  const inside = (r, m = 0) =>
    pointer.x > r.left - m && pointer.x < r.right + m && pointer.y > r.top - m && pointer.y < r.bottom + m;

  // ---- quale slot è "di turno": il più centrato tra quelli visibili per almeno metà
  let pickQueued = false;
  function pick() {
    pickQueued = false;
    if (dead) return;
    frame++;
    const h = window.innerHeight;
    const cur = mode === "hidden" ? shown : target;
    let best = null, bs = Infinity, curFrac = 0;
    for (const s of slots.values()) {
      if (!s.ready) continue;
      const r = rectOf(s);
      const vis = Math.max(0, Math.min(r.bottom, h) - Math.max(r.top, 0));
      const frac = vis / Math.max(1, Math.min(r.height, h));
      if (s === cur) curFrac = frac;
      if (frac < 0.5) continue;
      let score = Math.abs(r.top + r.height / 2 - h / 2);
      if (s === cur) score -= 60; // un po' di isteresi: niente ripensamenti sul confine
      if (score < bs) { bs = score; best = s; }
    }
    if (!best && cur && curFrac > 0.1) best = cur;
    if (best !== cur) goTo(best);
  }
  function schedulePick() {
    if (pickQueued) return;
    pickQueued = true;
    requestAnimationFrame(pick);
  }

  // ---- il passo della simulazione ---------------------------------------
  function tick(now) {
    raf = 0;
    if (dead) return;
    const dt = Math.min(1 / 20, Math.max(0.001, (now - last) / 1000));
    last = now;
    clock += dt;
    frame++;

    const rT = target ? rectOf(target) : null;
    const rS = source ? rectOf(source) : null;
    const gT = rT ? grain(target, rT) : 1.6;
    const gS = rS ? grain(source, rS) : gT;
    const tu = target?.s.u, tv = target?.s.v, tc = target?.s.col;
    const su = source?.s.u, sv = source?.s.v;
    const locked = mode === "settling";
    const interactive = target?.interactive;
    const pIn = rT && interactive && pointer.on && inside(rT, 30);
    if (pIn) pointer.insideAt = clock;
    const push = pointer.on && (interactive || !target);
    const PR = touch ? 74 : 110;
    const PR2 = PR * PR;
    const kc = 1 - Math.exp(-dt * 2.6);
    const t = clock;
    let settled = 0;

    for (let i = 0, j = 0; i < N; i++, j += 4) {
      let x = P[j], y = P[j + 1], g, e = 0;
      if (rS && t < rel[i]) {
        // ancora attaccato all'immagine di partenza (che intanto scorre con la pagina)
        x = rS.left + su[i] * rS.width;
        y = rS.top + sv[i] * rS.height;
        g = gS;
      } else if (locked) {
        x = rT.left + tu[i] * rT.width;
        y = rT.top + tv[i] * rT.height;
        vx[i] = 0; vy[i] = 0;
        g = gT;
      } else {
        let ax, ay;
        const fx = Math.sin(y * 0.0105 + t * 0.7 + ph[i]) + 0.5 * Math.sin(y * 0.027 - t * 1.1);
        const fy = Math.cos(x * 0.0095 - t * 0.6 + ph[i]) + 0.5 * Math.cos(x * 0.023 + t * 0.9);
        if (rT) {
          const dx = rT.left + tu[i] * rT.width - x;
          const dy = rT.top + tv[i] * rT.height - y;
          const d = Math.sqrt(dx * dx + dy * dy);
          const w = om[i];
          const k = w * w;
          const c = 1.64 * w;
          // il vento conta in volo e si spegne vicino all'arrivo (più in fretta della molla, così si fermano)
          const m = Math.min(1, d / 280);
          const fa = FLOW * m * m;
          ax = k * dx - c * vx[i] + fx * fa;
          ay = k * dy - c * vy[i] + fy * fa;
          if (d < 0.9 && vx[i] * vx[i] + vy[i] * vy[i] < 64) settled++;
          // il colore va verso quello del pixel di arrivo
          cf[j] += (tc[j] - cf[j]) * kc;
          cf[j + 1] += (tc[j + 1] - cf[j + 1]) * kc;
          cf[j + 2] += (tc[j + 2] - cf[j + 2]) * kc;
          cf[j + 3] += (tc[j + 3] - cf[j + 3]) * kc;
        } else {
          // nessuna meta: la polvere resta sospesa nell'aria e si spegne piano
          ax = fx * 90 - 1.1 * vx[i];
          ay = fy * 90 - 1.1 * vy[i];
        }
        if (push) {
          const px = x - pointer.x, py = y - pointer.y;
          const d2 = px * px + py * py;
          if (d2 < PR2 && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const f = (1 - d / PR) * (1 - d / PR) * 30000;
            ax += (px / d) * f - (py / d) * f * 0.35;
            ay += (py / d) * f + (px / d) * f * 0.35;
          }
        }
        vx[i] += ax * dt;
        vy[i] += ay * dt;
        x += vx[i] * dt;
        y += vy[i] * dt;
        e = Math.min(1, Math.sqrt(vx[i] * vx[i] + vy[i] * vy[i]) / 700);
        g = (rT ? gT : 1.7) * (1 + e * 0.8);
      }
      P[j] = x; P[j + 1] = y; P[j + 2] = g; P[j + 3] = e;
      C[j] = cf[j]; C[j + 1] = cf[j + 1]; C[j + 2] = cf[j + 2]; C[j + 3] = cf[j + 3];
    }

    // ---- regia
    if (mode === "live" && rT) {
      const calm = !interactive || clock - pointer.insideAt > 0.35;
      const done = clock > lastRelease + 0.15 && settled >= N * 0.985;
      if (calm && (done || clock - retargetAt > 5)) {
        // composta: l'immagine vera prende il posto dei granelli
        mode = "settling";
        setMedia(target, 1, 420);
        alphaTo = 0; alphaRate = 2.2;
      }
    } else if (mode === "live" && !rT && clock > Math.max(lastRelease, driftAt) + 0.9) {
      alphaTo = 0; alphaRate = 0.7;
    }
    alpha += Math.sign(alphaTo - alpha) * Math.min(Math.abs(alphaTo - alpha), alphaRate * dt);

    gl.clear(gl.COLOR_BUFFER_BIT);
    if (alpha > 0.001) {
      gl.useProgram(prog);
      gl.uniform2f(loc.uView, vw, vh);
      gl.uniform1f(loc.uDpr, dpr);
      gl.uniform1f(loc.uAlpha, alpha);
      gl.bindBuffer(gl.ARRAY_BUFFER, bufP);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, P);
      gl.bindBuffer(gl.ARRAY_BUFFER, bufC);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, C);
      gl.drawArrays(gl.POINTS, 0, N);
    }

    const faded = alpha <= 0.001 && alphaTo === 0;
    if (faded && (mode === "settling" || !target)) {
      // fine: si vede l'immagine vera (o niente), e il motore si ferma
      shown = mode === "settling" ? target : null;
      target = null;
      source = null;
      mode = "hidden";
      gl.clear(gl.COLOR_BUFFER_BIT);
      return;
    }
    raf = requestAnimationFrame(tick);
  }

  // ---- input -----------------------------------------------------------
  const onMove = (x, y) => {
    pointer.x = x; pointer.y = y; pointer.on = true;
    if (mode === "hidden" && shown?.interactive) {
      frame++;
      if (inside(rectOf(shown), -8)) touchSlot(shown);
    } else if (mode !== "hidden") wake();
  };
  const onPointerMove = (e) => { if (e.pointerType === "mouse") onMove(e.clientX, e.clientY); };
  const onPointerDown = (e) => onMove(e.clientX, e.clientY);
  const onTouch = (e) => { const t0 = e.touches[0]; if (t0) onMove(t0.clientX, t0.clientY); };
  const onOff = (e) => { if (!e || e.pointerType !== "mouse") pointer.on = false; };
  const onLeave = () => { pointer.on = false; };
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerdown", onPointerDown, { passive: true });
  window.addEventListener("touchmove", onTouch, { passive: true });
  window.addEventListener("touchend", onLeave, { passive: true });
  window.addEventListener("pointerup", onOff, { passive: true });
  window.addEventListener("pointercancel", onOff, { passive: true });
  document.documentElement.addEventListener("mouseleave", onLeave);
  window.addEventListener("blur", onLeave);
  window.addEventListener("scroll", schedulePick, { passive: true });
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  const onLost = (e) => {
    e.preventDefault();
    dead = true;
    cancelAnimationFrame(raf);
    onFail?.();
  };
  canvas.addEventListener("webglcontextlost", onLost);
  resize();

  return {
    // registra un'immagine: viene campionata appena è pronta
    async add(s) {
      const slot = { ...s, ready: false, _f: -1 };
      slots.set(s.id, slot);
      try {
        const src = await s.load();
        if (slots.get(s.id) !== slot || dead) return;
        // il raggio degli angoli arriva in px: per il campionamento serve in frazione della larghezza
        const w = slot.el.getBoundingClientRect().width || 1;
        slot.s = sample(src, N, { radius: (s.radius || 0) / w, fade: s.fade, seed: s.id.length * 31 + 7 });
        slot.ready = true;
        schedulePick();
      } catch {
        setMedia(slot, 1, 300); // senza polvere, l'immagine si vede e basta
      }
    },
    remove(id) {
      const s = slots.get(id);
      if (!s) return;
      slots.delete(id);
      if (target === s || source === s || shown === s) {
        if (source === s) source = null;
        if (shown === s) shown = null;
        if (target === s) { target = null; driftAt = clock; }
      }
    },
    destroy() {
      dead = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchend", onLeave);
      window.removeEventListener("pointerup", onOff);
      window.removeEventListener("pointercancel", onOff);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("blur", onLeave);
      window.removeEventListener("scroll", schedulePick);
      canvas.removeEventListener("webglcontextlost", onLost);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
    // per le verifiche: a che punto è
    state: () => ({ mode, target: target?.id ?? null, shown: shown?.id ?? null, alpha }),
  };
}
