// Tech — ogni gruppo di competenze è un'orbita attorno al nucleo.
// Il gruppo "a fuoco" (scelto scorrendo o dai pulsanti) si porta davanti, si allarga
// e mostra tutte le sue tecnologie: etichette HTML proiettate dal 3D (nitide, col font del sito).
// Gli altri gruppi restano orbite tenui, per dare l'idea dell'insieme.
// L'orbita si trascina col mouse/dito con inerzia.
import {
  Group, Object3D, BufferGeometry, Float32BufferAttribute, LineBasicMaterial,
  IcosahedronGeometry, EdgesGeometry, LineSegments, Mesh, MeshStandardMaterial,
  AmbientLight, PointLight, Points, ShaderMaterial, AdditiveBlending, Color, Vector3,
} from "three";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";
import { createStage, trackPointer, damp, clamp01, smoothstep, isTouch } from "./stage";

const COLORS = { purple: "#c084fc", garuda: "#5eead4" };
const R_MIN = 1.45;
const R_MAX = 3.3;
const R_FOCUS = 3.75; // il gruppo a fuoco si allarga fino a qui
const AUTO = 0.07; // rotazione automatica (rad/s)

const glowVertex = /* glsl */ `
  attribute vec3 aColor;
  uniform float uSize;
  uniform float uPixelRatio;
  varying vec3 vColor;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixelRatio / -mv.z;
    vColor = aColor;
  }
`;
const glowFragment = /* glsl */ `
  uniform float uAlpha;
  varying vec3 vColor;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = pow(smoothstep(0.5, 0.0, d), 2.0) * uAlpha;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColor * a, a);
  }
`;

const lerp = (a, b, t) => a + (b - a) * t;

export default async function create(canvas, { groups = [], reducedMotion, swipe = false }) {
  // su touch (o quando il gruppo si cambia con lo swipe) l'orbita sta ferma finché non cambi gruppo:
  // niente trascinamento, niente rotazione continua, e la GPU riposa
  const still = swipe || isTouch();
  const pointer = trackPointer(canvas);
  const stage = createStage(canvas, { fov: 35, reducedMotion, onResize: layout, onFrame: frame });
  const { scene, camera, renderer, size } = stage;

  // livello HTML per le etichette, sopra al canvas
  const layer = document.createElement("div");
  layer.style.cssText = "position:absolute;inset:0;pointer-events:none;overflow:hidden;";
  canvas.parentElement.appendChild(layer);

  const system = new Group();
  scene.add(system);

  // cerchio di raggio 1 (chiuso): ogni anello lo scala al suo raggio
  const SEG = 240;
  const circle = [];
  for (let k = 0; k <= SEG; k++) {
    const a = (k / SEG) * Math.PI * 2;
    circle.push(Math.cos(a), 0, Math.sin(a));
  }
  const lineMats = [];

  const n = groups.length;
  const rings = groups.map((group, i) => {
    const hex = COLORS[group.accent] || COLORS.purple;
    const color = new Color(hex);
    const R = n > 1 ? lerp(R_MIN, R_MAX, i / (n - 1)) : R_MAX;
    // inclinazioni diverse per ogni anello: l'insieme sembra un atomo, non una pila di cerchi
    const base = { x: 0.22 + ((i * 0.41) % 0.75), z: (i % 2 ? -1 : 1) * (0.1 + ((i * 0.13) % 0.32)) };
    const tilt = new Group();
    const spin = new Group();
    tilt.add(spin);
    system.add(tilt);

    // l'orbita: linea spessa e antialiasata; la metà lontana sfuma (profondità).
    // Sta su un gruppo che non gira: il gradiente resta fermo, scorrono solo le tecnologie
    const orbit = new Group();
    tilt.add(orbit);
    const geo = new LineGeometry();
    geo.setPositions(circle);
    const cols = [];
    for (let k = 0; k <= SEG; k++) {
      const f = 0.22 + 0.78 * smoothstep(-1, 1, Math.sin((k / SEG) * Math.PI * 2));
      cols.push(color.r * f, color.g * f, color.b * f);
    }
    geo.setColors(cols);
    const lineMat = new LineMaterial({ vertexColors: true, linewidth: 1, transparent: true, opacity: 0.12, depthWrite: false });
    lineMats.push(lineMat);
    const line = new Line2(geo, lineMat);
    orbit.add(line);

    const pos = [];
    const labels = group.items.map((name, j) => {
      const a = (j / group.items.length) * Math.PI * 2;
      const anchor = new Object3D();
      anchor.position.set(Math.cos(a), 0, Math.sin(a));
      spin.add(anchor);
      pos.push(Math.cos(a), 0, Math.sin(a));

      const el = document.createElement("span");
      el.textContent = name;
      el.className = "font-mono whitespace-nowrap";
      el.style.cssText = `position:absolute;left:0;top:0;padding:4px 11px;border-radius:999px;
        font-size:13px;letter-spacing:-0.01em;color:${hex};border:1px solid ${hex}55;
        background:rgba(8,8,16,0.7);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);
        will-change:transform,opacity;display:none;`;
      layer.appendChild(el);
      return { el, anchor, half: 40, shown: false };
    });

    const dg = new BufferGeometry();
    dg.setAttribute("position", new Float32BufferAttribute(pos, 3));
    dg.setAttribute("aColor", new Float32BufferAttribute(group.items.flatMap(() => [color.r, color.g, color.b]), 3));
    const dotsMat = new ShaderMaterial({
      vertexShader: glowVertex,
      fragmentShader: glowFragment,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: { uSize: { value: 80 }, uAlpha: { value: 0.6 }, uPixelRatio: { value: renderer.getPixelRatio() } },
    });
    spin.add(new Points(dg, dotsMat));

    return { R, base, tilt, spin, orbit, line, dotsMat, labels, phase: i * 0.9 };
  });

  // nucleo: cristallo low-poly con spigoli viola e un cuore luminoso
  const core = new Group();
  core.add(new Mesh(
    new IcosahedronGeometry(0.55, 1),
    new MeshStandardMaterial({ color: 0x2b1650, emissive: 0x1c0838, metalness: 0.45, roughness: 0.25, flatShading: true }),
  ));
  core.add(new LineSegments(
    new EdgesGeometry(new IcosahedronGeometry(0.6, 1)),
    new LineBasicMaterial({ color: 0xc084fc, transparent: true, opacity: 0.45 }),
  ));
  const heartGeo = new BufferGeometry();
  heartGeo.setAttribute("position", new Float32BufferAttribute([0, 0, 0], 3));
  heartGeo.setAttribute("aColor", new Float32BufferAttribute([0.66, 0.33, 0.97], 3));
  core.add(new Points(heartGeo, new ShaderMaterial({
    vertexShader: glowVertex,
    fragmentShader: glowFragment,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: { uSize: { value: 2200 }, uAlpha: { value: 1 }, uPixelRatio: { value: renderer.getPixelRatio() } },
  })));
  system.add(core);

  scene.add(new AmbientLight(0x6d4aa8, 0.9));
  const purple = new PointLight(0xa855f7, 30, 10, 2);
  purple.position.set(2, 2, 3);
  const teal = new PointLight(0x2dd4bf, 22, 10, 2);
  teal.position.set(-2.5, -1.5, 2);
  scene.add(purple, teal);

  // --- Trascinamento con inerzia (orizzontale; in verticale scorre la pagina) ---
  let angle = 0;
  let vel = still ? 0 : AUTO;
  let dragging = false;
  let lastX = 0;
  let lastMove = 0;
  canvas.style.touchAction = "pan-y";
  if (!still) canvas.style.cursor = "grab";
  const onDown = (e) => {
    dragging = true;
    lastX = e.clientX;
    lastMove = performance.now();
    canvas.setPointerCapture?.(e.pointerId);
    canvas.style.cursor = "grabbing";
  };
  const onMove = (e) => {
    if (!dragging) return;
    const now = performance.now();
    const delta = (e.clientX - lastX) * 0.008;
    angle += delta;
    vel = delta / Math.max(0.008, (now - lastMove) / 1000);
    lastX = e.clientX;
    lastMove = now;
    if (reducedMotion) stage.invalidate();
  };
  const onUp = () => {
    dragging = false;
    canvas.style.cursor = "grab";
  };
  if (!still) {
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
  }

  // inclinazione con cui si presenta il gruppo a fuoco: su schermi stretti più "di fronte",
  // così l'ellisse è più alta e le etichette hanno spazio in verticale
  let present = 0.55;
  let stretch = 1; // su schermi verticali l'orbita a fuoco diventa un'ellisse alta, che riempie lo spazio
  let compact = false;
  function layout(s) {
    lineMats.forEach((m) => m.resolution.set(s.w, s.h));
    compact = s.w < 640;
    present = s.aspect < 1.25 ? 1.0 : 0.55;
    stretch = s.aspect < 0.8 ? 1.5 : 1;
    for (const r of rings) {
      for (const l of r.labels) {
        l.el.style.fontSize = compact ? "12.5px" : "13px";
        l.el.style.padding = compact ? "4px 10px" : "4px 11px";
        const was = l.el.style.display;
        l.el.style.display = "block";
        l.half = l.el.offsetWidth / 2; // larghezza misurata una volta: tiene le etichette dentro i bordi
        l.el.style.display = was;
      }
    }
    // l'anello a fuoco (con le etichette) deve stare nel riquadro, in larghezza e in altezza
    const fitW = (R_FOCUS * (compact ? 1.12 : 1.3)) / (s.tanV * s.aspect);
    const fitH = (R_FOCUS * stretch * Math.sin(present) + 0.9) / s.tanV;
    camera.position.set(0, 0.35, Math.max(7, fitW, fitH));
    camera.lookAt(0, 0, 0);
  }

  let focus = 0;
  let target = 0;
  const v = new Vector3();
  const c = new Vector3();
  const tiltNow = { x: 0 };
  let quiet = 0;
  function frame(t, dt) {
    const step = dt || 1;
    if (!dragging && dt) {
      angle += vel * dt;
      vel = damp(vel, still ? 0 : AUTO, 1.2, dt); // l'inerzia torna alla rotazione lenta
    }
    const prevFocus = focus;
    const prevTilt = tiltNow.x;
    focus = reducedMotion ? target : damp(focus, target, 7, step);
    tiltNow.x = damp(tiltNow.x, pointer.inside ? -pointer.y * 0.08 : 0, 3, step);
    if (still) {
      // ferma: si ridisegna solo mentre passa da un gruppo all'altro
      const moving = Math.abs(focus - prevFocus) > 1e-5 || Math.abs(tiltNow.x - prevTilt) > 1e-5 || Math.abs(vel) > 1e-4;
      quiet = moving ? 0 : quiet + 1;
      if (quiet > 2) return false;
    }
    system.rotation.set(tiltNow.x, 0, 0);
    // il nucleo gira sempre sul desktop; da ferma ruota solo mentre cambi gruppo
    if (still) core.rotation.set(focus * 0.9, focus * 1.4, 0);
    else core.rotation.set(t * 0.2, t * 0.32, 0);

    scene.updateMatrixWorld();
    camera.updateMatrixWorld();
    const camDist = camera.position.length();

    rings.forEach((r, i) => {
      const w = smoothstep(0, 1, clamp01(1 - Math.abs(focus - i)));
      const R = lerp(r.R, R_FOCUS, w);
      r.spin.scale.setScalar(R);
      r.orbit.scale.setScalar(R);
      // l'allungamento sta sul piano fisso dell'orbita: la forma resta ferma, le tecnologie ci scorrono sopra
      r.tilt.scale.set(1, 1, lerp(1, stretch, w));
      // il gruppo a fuoco si raddrizza verso chi guarda; gli anelli restano fermi
      // e sono le tecnologie a scorrere lungo l'orbita (trascinando le sposti tu)
      r.tilt.rotation.set(lerp(r.base.x, present, w), 0, lerp(r.base.z, 0, w));
      r.spin.rotation.y = r.phase + angle * (1 - i * 0.06);
      r.line.material.opacity = 0.14 + 0.76 * w;
      r.line.material.linewidth = 1 + 1.6 * w;
      r.dotsMat.uniforms.uSize.value = 60 + 190 * w;
      r.dotsMat.uniforms.uAlpha.value = 0.35 + 0.65 * w;

      // etichette: solo per il gruppo a fuoco (e quello che entra/esce durante il passaggio)
      for (const l of r.labels) {
        if (w < 0.03) {
          if (l.shown) { l.el.style.display = "none"; l.shown = false; }
          continue;
        }
        if (!l.shown) { l.el.style.display = "block"; l.shown = true; }
        l.anchor.getWorldPosition(v);
        c.copy(v).applyMatrix4(camera.matrixWorldInverse);
        const depth = c.z + camDist; // >0 = davanti al centro
        const k = clamp01(0.5 + depth / (2 * R_FOCUS));
        v.project(camera);
        const scale = 0.8 + k * 0.3;
        const edge = l.half * scale + 6;
        const x = Math.min(Math.max((v.x * 0.5 + 0.5) * size.w, edge), size.w - edge);
        const y = (-v.y * 0.5 + 0.5) * size.h;
        l.el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) translate(-50%,-135%) scale(${scale.toFixed(3)})`;
        l.el.style.opacity = (w * (0.38 + k * 0.62)).toFixed(3);
        l.el.style.zIndex = String(Math.round(k * 100));
      }
    });
  }

  await stage.warmup();
  stage.resize();

  return {
    setVisible: stage.setVisible,
    // posizione continua del gruppo a fuoco (0..n-1), dallo scroll o dai pulsanti
    setProgress(f) {
      target = f;
      if (reducedMotion) stage.invalidate();
    },
    dispose() {
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      pointer.dispose();
      layer.remove();
      stage.dispose();
    },
  };
}
