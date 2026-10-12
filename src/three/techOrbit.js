// Tech — le tecnologie orbitano in 3D su tre anelli attorno a un nucleo low-poly.
// Le etichette sono testo HTML proiettato dal 3D (nitido, col font del sito);
// l'orbita si trascina col mouse/dito con inerzia.
import {
  Group, Object3D, BufferGeometry, Float32BufferAttribute, LineLoop, LineBasicMaterial,
  IcosahedronGeometry, EdgesGeometry, LineSegments, Mesh, MeshStandardMaterial,
  AmbientLight, PointLight, Points, ShaderMaterial, AdditiveBlending, Color, Vector3,
} from "three";
import { createStage, trackPointer, damp, clamp01, smoothstep } from "./stage";

const RADII = [1.9, 2.75, 3.6];
// inclinazioni piccole: anelli quasi orizzontali visti di taglio (ellissi, come Saturno)
const TILTS = [[0.42, 0.16], [0.26, -0.24], [0.56, 0.34]];
const SPEEDS = [0.3, -0.2, 0.14];
const AUTO = 0.1; // rotazione automatica (rad/s)

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
  varying vec3 vColor;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = pow(smoothstep(0.5, 0.0, d), 2.0);
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColor * a, a);
  }
`;

export default async function create(canvas, { rings = [], reducedMotion }) {
  const pointer = trackPointer(canvas);
  const stage = createStage(canvas, { fov: 35, reducedMotion, onResize: layout, onFrame: frame });
  const { scene, camera, renderer, size } = stage;

  // livello HTML per le etichette, sopra al canvas
  const layer = document.createElement("div");
  layer.style.cssText = "position:absolute;inset:0;pointer-events:none;overflow:hidden;";
  canvas.parentElement.appendChild(layer);

  const system = new Group();
  scene.add(system);
  const spinners = [];
  const labels = [];

  rings.forEach((ring, i) => {
    const R = RADII[i % RADII.length];
    const color = new Color(ring.color);
    const tilt = new Group();
    tilt.rotation.set(TILTS[i % 3][0], 0, TILTS[i % 3][1]);
    const spin = new Group();
    tilt.add(spin);
    system.add(tilt);
    spinners.push(spin);

    const pts = [];
    const SEG = 180;
    for (let k = 0; k < SEG; k++) {
      const a = (k / SEG) * Math.PI * 2;
      pts.push(Math.cos(a) * R, 0, Math.sin(a) * R);
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new Float32BufferAttribute(pts, 3));
    spin.add(new LineLoop(g, new LineBasicMaterial({ color, transparent: true, opacity: 0.3 })));

    // un punto luminoso per tecnologia, in coordinate dell'anello
    const ringDots = [];
    ring.items.forEach((name, j) => {
      const a = (j / ring.items.length) * Math.PI * 2 + i * 0.6;
      const anchor = new Object3D();
      anchor.position.set(Math.cos(a) * R, 0, Math.sin(a) * R);
      spin.add(anchor);
      ringDots.push(anchor.position.x, 0, anchor.position.z);

      const el = document.createElement("span");
      el.textContent = name;
      el.className = "font-mono whitespace-nowrap";
      el.style.cssText = `position:absolute;left:0;top:0;padding:3px 10px;border-radius:999px;
        font-size:12px;letter-spacing:-0.01em;color:${ring.color};border:1px solid ${ring.color}55;
        background:rgba(8,8,16,0.62);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);
        will-change:transform,opacity;`;
      layer.appendChild(el);
      labels.push({ el, anchor, half: 40 });
    });
    const dg = new BufferGeometry();
    dg.setAttribute("position", new Float32BufferAttribute(ringDots, 3));
    dg.setAttribute("aColor", new Float32BufferAttribute(ring.items.flatMap(() => [color.r, color.g, color.b]), 3));
    const dots = new Points(dg, new ShaderMaterial({
      vertexShader: glowVertex,
      fragmentShader: glowFragment,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: { uSize: { value: 220 }, uPixelRatio: { value: renderer.getPixelRatio() } },
    }));
    spin.add(dots);
  });

  // nucleo: cristallo low-poly con spigoli viola e un cuore luminoso
  const core = new Group();
  core.add(new Mesh(
    new IcosahedronGeometry(0.72, 1),
    new MeshStandardMaterial({ color: 0x2b1650, emissive: 0x1c0838, metalness: 0.45, roughness: 0.25, flatShading: true }),
  ));
  core.add(new LineSegments(
    new EdgesGeometry(new IcosahedronGeometry(0.78, 1)),
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
    uniforms: { uSize: { value: 2600 }, uPixelRatio: { value: renderer.getPixelRatio() } },
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
  let vel = AUTO;
  let dragging = false;
  let lastX = 0;
  let lastMove = 0;
  canvas.style.touchAction = "pan-y";
  canvas.style.cursor = "grab";
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
    const dx = e.clientX - lastX;
    const delta = dx * 0.008;
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
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);

  const maxR = RADII[Math.min(rings.length, RADII.length) - 1] || 3.6;
  let compact = false; // schermi stretti: etichette più piccole e solo quelle davanti
  function layout(s) {
    compact = s.w < 640;
    for (const l of labels) {
      l.el.style.fontSize = compact ? "10px" : "12px";
      l.el.style.padding = compact ? "2px 7px" : "3px 10px";
    }
    // larghezze misurate una volta sola: servono a tenere le etichette dentro i bordi
    for (const l of labels) l.half = l.el.offsetWidth / 2;

    // tutti gli anelli (e le etichette) devono stare nel riquadro, in larghezza e in altezza
    const fitW = (maxR * 1.22) / (s.tanV * s.aspect);
    const fitH = (maxR * 0.9 + 0.4) / s.tanV;
    camera.position.set(0, 0.6, Math.max(8.5, fitW, fitH));
    camera.lookAt(0, 0, 0);
  }

  const v = new Vector3();
  const tiltNow = { x: 0 };
  function frame(t, dt) {
    if (!dragging && dt) {
      angle += vel * dt;
      vel = damp(vel, AUTO, 1.2, dt); // l'inerzia torna alla rotazione lenta
    }
    tiltNow.x = damp(tiltNow.x, pointer.inside ? -pointer.y * 0.12 : 0, 3, dt || 1);
    system.rotation.set(0.12 + tiltNow.x, angle, 0);
    spinners.forEach((s, i) => { s.rotation.y = t * SPEEDS[i % SPEEDS.length]; });
    core.rotation.set(t * 0.2, t * 0.32, 0);

    // proiezione delle etichette: davanti grandi e nitide, dietro piccole e sbiadite
    scene.updateMatrixWorld();
    camera.updateMatrixWorld();
    const camDist = camera.position.length();
    for (const l of labels) {
      const { el, anchor } = l;
      anchor.getWorldPosition(v);
      const depth = v.clone().applyMatrix4(camera.matrixWorldInverse).z + camDist; // >0 = davanti
      const k = clamp01(0.5 + depth / (2 * maxR));
      v.project(camera);
      const scale = 0.74 + k * 0.38;
      const edge = l.half * scale + 4;
      const x = Math.min(Math.max((v.x * 0.5 + 0.5) * size.w, edge), size.w - edge);
      const y = (-v.y * 0.5 + 0.5) * size.h;
      el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) translate(-50%,-140%) scale(${scale.toFixed(3)})`;
      el.style.opacity = (compact ? smoothstep(0.45, 0.65, k) : 0.22 + k * 0.78).toFixed(3);
      el.style.zIndex = String(Math.round(k * 100));
    }
  }

  await stage.warmup();
  stage.resize();

  return {
    setVisible: stage.setVisible,
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
