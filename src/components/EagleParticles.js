// Aquila Garuda in 3D: migliaia di particelle campionate dai pixel di garuda.png.
// Partono sparse nello spazio, vorticano e convergono a formare l'aquila (con
// rilievo dato dalla luminosità), poi esplodono verso la camera aprendo la hero.
// Caricato in lazy solo dall'intro: three.js non pesa sul bundle principale.
import {
  WebGLRenderer, Scene, PerspectiveCamera, BufferGeometry, Float32BufferAttribute,
  Points, ShaderMaterial, AdditiveBlending, Group,
} from "three";

const vertexShader = /* glsl */ `
  uniform float uProgress;   // 0 → 1: assemblaggio
  uniform float uExplode;    // 0 → 1: esplosione finale
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  attribute vec3 aStart;
  attribute vec3 aColor;
  attribute float aRand;
  varying vec3 vColor;
  varying float vAlpha;

  float easeOutCubic(float t) { return 1.0 - pow(1.0 - t, 3.0); }

  void main() {
    // ogni particella parte con un piccolo ritardo: l'aquila "si compone"
    float delay = aRand * 0.35;
    float p = clamp((uProgress - delay) / 0.65, 0.0, 1.0);
    float e = easeOutCubic(p);

    // vortice: la posizione di partenza ruota attorno all'asse Y e si srotola
    float ang = (1.0 - e) * (2.4 + aRand * 2.2);
    float c = cos(ang), s = sin(ang);
    vec3 start = vec3(aStart.x * c - aStart.z * s, aStart.y, aStart.x * s + aStart.z * c);
    vec3 pos = mix(start, position, e);

    // respiro leggero quando l'aquila è formata
    pos += 0.014 * e * vec3(sin(uTime * 2.1 + aRand * 40.0), cos(uTime * 1.7 + aRand * 31.0), 0.0);

    // esplosione: verso l'esterno e verso la camera
    float x = uExplode * uExplode;
    pos.xy += normalize(position.xy + 0.0001) * x * (1.5 + aRand * 3.5);
    pos.z += x * (3.0 + aRand * 5.0);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    float size = uSize * (0.65 + aRand * 0.7) * uPixelRatio / max(-mv.z, 0.1);
    gl_PointSize = min(size, 56.0 * uPixelRatio);

    vColor = aColor;
    vAlpha = (0.18 + 0.82 * e) * (1.0 - uExplode);
  }
`;

const fragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = pow(smoothstep(0.5, 0.0, d), 1.5) * vAlpha;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColor * a, a);
  }
`;

const clamp01 = (t) => Math.min(1, Math.max(0, t));
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeInQuad = (t) => t * t;

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Timeline (secondi)
const ASSEMBLE = 1.9;    // l'aquila si compone
const EXPLODE_AT = 2.75; // dopo un attimo di "posa", esplode
const EXPLODE_DUR = 0.85;
const EXIT_AT = 2.85;    // l'overlay inizia a dissolversi sulla hero

/**
 * Avvia la scena sul canvas. Ritorna una funzione di cleanup.
 * Lancia un errore se WebGL non è disponibile (l'intro userà il fallback CSS).
 */
export async function createEagleScene(canvas, { src, onExit }) {
  const img = await loadImage(src);
  const mobile = window.matchMedia("(max-width: 767px)").matches;

  // --- Campionamento dei pixel dell'aquila ---
  const S = 460;
  const off = document.createElement("canvas");
  off.width = off.height = S;
  const ctx = off.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, S, S);
  const { data } = ctx.getImageData(0, 0, S, S);

  const step = mobile ? 4 : 3;
  const W = 3; // lato dell'aquila in unità mondo
  const targets = [], starts = [], colors = [], rands = [];
  const rnd = Math.random;

  const pushStart = () => {
    // guscio sferico attorno all'aquila, mai oltre la camera
    const r = 3.5 + rnd() * 5.5;
    const th = rnd() * Math.PI * 2;
    const ph = Math.acos(2 * rnd() - 1);
    starts.push(
      r * Math.sin(ph) * Math.cos(th),
      r * Math.cos(ph) * 0.8,
      Math.min(2, r * Math.sin(ph) * Math.sin(th)),
    );
  };

  for (let y = 0; y < S; y += step) {
    for (let x = 0; x < S; x += step) {
      const i = (y * S + x) * 4;
      if (data[i + 3] < 120) continue;
      const r = data[i] / 255, g = data[i + 1] / 255, b = data[i + 2] / 255;
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      // il rilievo: le sfaccettature più chiare stanno più avanti
      targets.push((x / S - 0.5) * W, (0.5 - y / S) * W, (lum - 0.4) * 0.9 + (rnd() - 0.5) * 0.06);
      colors.push(r * 1.15, g * 1.1, b * 1.2);
      rands.push(rnd());
      pushStart();
    }
  }

  // polvere ambientale viola/teal: dà profondità mentre la camera ruota
  const DUST = mobile ? 250 : 500;
  for (let k = 0; k < DUST; k++) {
    pushStart();
    const n = starts.length - 3;
    targets.push(starts[n] * 1.2, starts[n + 1] * 1.2, starts[n + 2] - 1.5);
    const teal = rnd() < 0.35;
    colors.push(teal ? 0.1 : 0.42, teal ? 0.42 : 0.18, teal ? 0.4 : 0.7);
    rands.push(rnd());
  }

  // --- Three.js ---
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "high-performance" });
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(pixelRatio);
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new PerspectiveCamera(35, 1, 0.1, 100);
  const group = new Group();
  scene.add(group);

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(targets, 3));
  geometry.setAttribute("aStart", new Float32BufferAttribute(starts, 3));
  geometry.setAttribute("aColor", new Float32BufferAttribute(colors, 3));
  geometry.setAttribute("aRand", new Float32BufferAttribute(rands, 1));

  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: {
      uProgress: { value: 0 },
      uExplode: { value: 0 },
      uTime: { value: 0 },
      uSize: { value: 40 },
      uPixelRatio: { value: pixelRatio },
    },
  });

  const points = new Points(geometry, material);
  points.frustumCulled = false; // le posizioni di partenza sono fuori dal bounding box
  group.add(points);

  // --- Dimensionamento: stessa misura e posizione del Garuda di sfondo della hero
  // (620px su desktop, 92vw su mobile), così l'esplosione "atterra" su di lui ---
  const tanV = Math.tan((35 * Math.PI) / 360);
  let dist = 8;
  const resize = () => {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const squarePx = Math.min(w < 768 ? 0.92 * w : 620, 0.95 * h);
    dist = (W * h) / (2 * tanV * squarePx);
    // dimensione punto ≈ 2,4× la spaziatura dei campioni sullo schermo
    material.uniforms.uSize.value = ((W / S) * step * 2.4 * h) / (2 * tanV);
  };
  resize();
  window.addEventListener("resize", resize);

  // --- Animazione ---
  const t0 = performance.now();
  let raf = 0;
  let exited = false;
  const tick = (now) => {
    const t = (now - t0) / 1000;
    const u = material.uniforms;
    u.uTime.value = t;
    u.uProgress.value = clamp01(t / ASSEMBLE);
    const boom = easeInQuad(clamp01((t - EXPLODE_AT) / EXPLODE_DUR));
    u.uExplode.value = boom;

    // la camera "gira attorno" mentre l'aquila si compone: si vede il rilievo
    const settle = easeOutCubic(clamp01(t / (ASSEMBLE + 0.3)));
    group.rotation.y = -0.9 * (1 - settle) + Math.sin(t * 0.9) * 0.06;
    group.rotation.x = 0.25 * (1 - settle) + Math.sin(t * 0.7) * 0.03;
    camera.position.set(0, 0, dist * (1 - 0.3 * boom));

    renderer.render(scene, camera);
    if (!exited && t >= EXIT_AT) {
      exited = true;
      onExit?.();
    }
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", resize);
    geometry.dispose();
    material.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
  };
}
