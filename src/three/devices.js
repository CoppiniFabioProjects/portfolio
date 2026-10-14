// Progetti — un solo dispositivo 3D che mostra un progetto alla volta:
// smartphone per le app mobile, portatile per le web app, con lo schermo del progetto.
// Scorrendo il dispositivo gira e si allontana; quando è sparito diventa il progetto
// successivo (forma e schermo) e torna avanti. Si inclina seguendo il mouse.
// Tutto costruito in codice, nessun modello esterno.
import {
  Group, Mesh, MeshStandardMaterial, MeshBasicMaterial, Shape, ShapeGeometry, BoxGeometry, PlaneGeometry,
  CanvasTexture, SRGBColorSpace, PMREMGenerator, AmbientLight, PointLight, AdditiveBlending,
} from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { createStage, trackPointer, damp } from "./stage";

function roundedRect(w, h, r) {
  const s = new Shape();
  const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

// ShapeGeometry ha UV nelle coordinate della forma: le normalizzo in 0..1
function planeUV(geo, w, h) {
  const p = geo.attributes.position;
  const uv = geo.attributes.uv;
  for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / w + 0.5, p.getY(i) / h + 0.5);
  uv.needsUpdate = true;
  return geo;
}

// riflesso diagonale del vetro
function glareTexture() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const g = c.getContext("2d");
  const grad = g.createLinearGradient(0, 0, 256, 256);
  grad.addColorStop(0, "rgba(255,255,255,0.16)");
  grad.addColorStop(0.35, "rgba(255,255,255,0.04)");
  grad.addColorStop(0.36, "rgba(255,255,255,0)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

// Immagine del progetto adattata allo schermo (cover = riempie, contain = intera su fondo)
function screenTexture(img, aspect, { fit = "cover", bg = "#0a0a12" } = {}, anisotropy = 1) {
  const W = 1600;
  const H = Math.round(W / aspect);
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d");
  g.fillStyle = bg;
  g.fillRect(0, 0, W, H);
  const ia = img.width / img.height;
  let w, h;
  if ((fit === "cover") === (ia > aspect)) { h = H; w = H * ia; } else { w = W; h = W / ia; }
  if (fit === "contain") { w *= 0.92; h *= 0.92; }
  g.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = anisotropy;
  return t;
}

// Schermo disegnato in codice: uno schema "da → via → a" (per i progetti senza immagine pubblicabile)
function diagramTexture({ from, via, to, note }, aspect, anisotropy = 1) {
  const W = 1600;
  const H = Math.round(W / aspect);
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d");
  const bg = g.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#120f1e");
  bg.addColorStop(1, "#07070c");
  g.fillStyle = bg;
  g.fillRect(0, 0, W, H);
  // barra della finestra
  g.fillStyle = "rgba(255,255,255,0.04)";
  g.fillRect(0, 0, W, 70);
  ["#e31837", "#ffc72c", "#2dd4bf"].forEach((col, i) => {
    g.fillStyle = col;
    g.globalAlpha = 0.8;
    g.beginPath();
    g.arc(46 + i * 36, 35, 11, 0, Math.PI * 2);
    g.fill();
  });
  g.globalAlpha = 1;

  const box = (cx, cy, w, h, title, sub, accent) => {
    const x = cx - w / 2, y = cy - h / 2, r = 28;
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
    g.fillStyle = accent ? "rgba(168,85,247,0.18)" : "rgba(255,255,255,0.04)";
    g.fill();
    g.lineWidth = 3;
    g.strokeStyle = accent ? "#c084fc" : "rgba(255,255,255,0.22)";
    g.stroke();
    g.textAlign = "center";
    g.fillStyle = "#ffffff";
    // il titolo si rimpicciolisce finché non sta nel riquadro
    let size = accent ? 50 : 42;
    do {
      g.font = `600 ${size}px Inter, system-ui, sans-serif`;
      size -= 2;
    } while (g.measureText(title).width > w - 48 && size > 20);
    g.fillText(title, cx, sub ? cy - 4 : cy + 16);
    if (sub) {
      g.fillStyle = accent ? "#c084fc" : "#5eead4";
      g.font = "500 30px 'JetBrains Mono', ui-monospace, monospace";
      g.fillText(sub, cx, cy + 46);
    }
  };
  const arrow = (x1, x2, y) => {
    g.strokeStyle = "rgba(192,132,252,0.7)";
    g.fillStyle = "rgba(192,132,252,0.9)";
    g.lineWidth = 4;
    g.beginPath();
    g.moveTo(x1, y);
    g.lineTo(x2, y);
    g.stroke();
    [[x2, 1], [x1, -1]].forEach(([x, d]) => {
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x - d * 22, y - 13);
      g.lineTo(x - d * 22, y + 13);
      g.closePath();
      g.fill();
    });
  };
  const cy = H / 2 + 10;
  box(W * 0.2, cy, 420, 230, from[0], from[1]);
  box(W * 0.5, cy, 340, 190, via, null, true);
  box(W * 0.8, cy, 420, 230, to[0], to[1]);
  arrow(W * 0.2 + 225, W * 0.5 - 185, cy);
  arrow(W * 0.5 + 185, W * 0.8 - 225, cy);
  if (note) {
    g.textAlign = "center";
    g.fillStyle = "rgba(148,163,184,0.85)";
    g.font = "500 30px 'JetBrains Mono', ui-monospace, monospace";
    g.fillText(`✓ ${note}`, W / 2, H - 110);
  }
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = anisotropy;
  return t;
}

/* ---------- Smartphone (schermo 9:16) ---------- */
const P_SW = 1.0;
const P_SH = (P_SW * 16) / 9;
const P_BW = P_SW + 0.09;
const P_BH = P_SH + 0.09;
const P_D = 0.11;

function buildPhone(metal, glare) {
  const g = new Group();
  g.add(new Mesh(new RoundedBoxGeometry(P_BW, P_BH, P_D, 6, 0.12), metal));
  const screen = new Mesh(
    planeUV(new ShapeGeometry(roundedRect(P_SW, P_SH, 0.09), 10), P_SW, P_SH),
    new MeshBasicMaterial({ toneMapped: false }),
  );
  screen.position.z = P_D / 2 + 0.002;
  g.add(screen);
  const island = new Mesh(new ShapeGeometry(roundedRect(0.27, 0.075, 0.0375), 8), new MeshBasicMaterial({ color: 0x050505 }));
  island.position.set(0, P_SH / 2 - 0.075, P_D / 2 + 0.004);
  g.add(island);
  const gl = new Mesh(
    planeUV(new ShapeGeometry(roundedRect(P_SW, P_SH, 0.09), 10), P_SW, P_SH),
    new MeshBasicMaterial({ map: glare, transparent: true, blending: AdditiveBlending, depthWrite: false }),
  );
  gl.position.z = P_D / 2 + 0.006;
  g.add(gl);
  const btn = new MeshStandardMaterial({ color: 0x24222e, metalness: 0.9, roughness: 0.3 });
  [[-1, 0.42, 0.16], [-1, 0.18, 0.16], [1, 0.3, 0.26]].forEach(([side, y, h]) => {
    const b = new Mesh(new BoxGeometry(0.018, h, 0.05), btn);
    b.position.set(side * (P_BW / 2 + 0.006), y, 0);
    g.add(b);
  });
  return { group: g, screen, glare: gl, aspect: P_SW / P_SH, size: { w: P_BW, h: P_BH } };
}

/* ---------- Portatile (schermo 16:10) ---------- */
const L_SW = 1.6;
const L_SH = 1.0;
const L_LW = L_SW + 0.1;
const L_LH = L_SH + 0.13;
const L_LD = 0.035;
const L_OPEN = -0.2; // coperchio un po' inclinato all'indietro

function buildLaptop(metal, baseMetal, glare) {
  const g = new Group();
  // il perno della rotazione è al centro dello schermo, non sulla cerniera
  const body = new Group();
  body.position.set(0, -L_LH * 0.5, -0.2);
  g.add(body);

  const hinge = new Group();
  hinge.rotation.x = L_OPEN;
  body.add(hinge);
  const lid = new Mesh(new RoundedBoxGeometry(L_LW, L_LH, L_LD, 4, 0.03), metal);
  lid.position.y = L_LH / 2;
  hinge.add(lid);
  const screen = new Mesh(new PlaneGeometry(L_SW, L_SH), new MeshBasicMaterial({ toneMapped: false }));
  screen.position.set(0, L_LH / 2 + 0.025, L_LD / 2 + 0.002);
  hinge.add(screen);
  const gl = new Mesh(
    new PlaneGeometry(L_SW, L_SH),
    new MeshBasicMaterial({ map: glare, transparent: true, blending: AdditiveBlending, depthWrite: false }),
  );
  gl.position.set(0, L_LH / 2 + 0.025, L_LD / 2 + 0.006);
  hinge.add(gl);
  // webcam
  const cam = new Mesh(new ShapeGeometry(roundedRect(0.025, 0.025, 0.0125), 8), new MeshBasicMaterial({ color: 0x050505 }));
  cam.position.set(0, L_LH - 0.04, L_LD / 2 + 0.003);
  hinge.add(cam);

  // base con tastiera e trackpad
  const BW = L_LW + 0.04;
  const BD = 1.08;
  const base = new Mesh(new RoundedBoxGeometry(BW, 0.045, BD, 4, 0.02), baseMetal);
  base.position.set(0, -0.0225, BD / 2);
  body.add(base);
  const deck = new Mesh(new PlaneGeometry(BW - 0.18, 0.46), new MeshStandardMaterial({ color: 0x08070c, roughness: 0.8, metalness: 0.1, envMapIntensity: 0.25 }));
  deck.rotation.x = -Math.PI / 2;
  deck.position.set(0, 0.001, 0.32);
  body.add(deck);
  const pad = new Mesh(new ShapeGeometry(roundedRect(0.52, 0.3, 0.03), 6), new MeshStandardMaterial({ color: 0x22202c, metalness: 0.6, roughness: 0.35 }));
  pad.rotation.x = -Math.PI / 2;
  pad.position.set(0, 0.0012, 0.8);
  body.add(pad);

  return { group: g, screen, glare: gl, aspect: L_SW / L_SH, size: { w: BW, h: L_LH + 0.35 } };
}

export default async function create(canvas, { items = [], reducedMotion }) {
  const pointer = trackPointer(canvas);
  const stage = createStage(canvas, { fov: 30, reducedMotion, onResize: layout, onFrame: frame });
  const { scene, camera, renderer } = stage;
  const aniso = renderer.capabilities.getMaxAnisotropy();

  // riflessi metallici credibili senza file esterni
  const pmrem = new PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  scene.environment = pmrem.fromScene(room, 0.04).texture;
  room.dispose?.();
  pmrem.dispose();

  const metal = new MeshStandardMaterial({ color: 0x1c1a24, metalness: 0.9, roughness: 0.32, envMapIntensity: 1.1 });
  // la base del portatile riflette meno: vista dall'alto non deve sembrare una lastra chiara
  const baseMetal = new MeshStandardMaterial({ color: 0x111017, metalness: 0.7, roughness: 0.5, envMapIntensity: 0.3 });
  const glare = glareTexture();
  const models = { phone: buildPhone(metal, glare), laptop: buildLaptop(metal, baseMetal, glare) };
  const holder = new Group();
  scene.add(holder);
  Object.values(models).forEach((m) => { m.group.visible = false; holder.add(m.group); });

  // una texture per progetto, già adattata allo schermo del suo dispositivo
  const images = await Promise.all(items.map((it) => (it.image ? loadImage(it.image) : null)));
  await document.fonts?.ready; // gli schemi disegnati usano i font del sito
  const screens = items.map((it, i) => {
    const m = models[it.device === "phone" ? "phone" : "laptop"];
    const map = it.screen?.diagram
      ? diagramTexture(it.screen.diagram, m.aspect, aniso)
      : screenTexture(images[i], m.aspect, it.screen, aniso);
    return { model: m, map };
  });

  scene.add(new AmbientLight(0xffffff, 0.25));
  const rimTeal = new PointLight(0x2dd4bf, 18, 12, 2);
  rimTeal.position.set(-2.4, 1.3, -0.8);
  const rimPurple = new PointLight(0xa855f7, 22, 12, 2);
  rimPurple.position.set(2.4, -1, -0.6);
  const key = new PointLight(0xffffff, 6, 12, 2);
  key.position.set(0, 2.5, 3);
  scene.add(rimTeal, rimPurple, key);

  // ogni dispositivo occupa la sua parte di riquadro: il telefono in altezza, il portatile in larghezza
  const DIST = 6;
  const fit = { phone: 1, laptop: 1 };
  function layout(s) {
    camera.position.set(0, 0.25, DIST);
    camera.lookAt(0, 0, 0);
    const vh = 2 * DIST * s.tanV;
    const vw = vh * s.aspect;
    fit.phone = Math.min((0.84 * vh) / models.phone.size.h, (0.62 * vw) / models.phone.size.w);
    fit.laptop = Math.min((0.72 * vw) / models.laptop.size.w, (0.64 * vh) / models.laptop.size.h);
  }

  let target = 0;
  let pos = 0;
  let shown = -1;
  const tilt = { x: 0, y: 0 };
  function show(k) {
    if (k === shown || !screens[k]) return;
    shown = k;
    const { model, map } = screens[k];
    Object.values(models).forEach((m) => { m.group.visible = m === model; });
    model.screen.material.map = map;
    model.screen.material.needsUpdate = true;
  }

  function frame(t, dt) {
    const step = dt || 1;
    pos = reducedMotion ? target : damp(pos, target, 7, step);
    const k = Math.min(screens.length - 1, Math.max(0, Math.round(pos)));
    show(k);
    const model = screens[k].model;
    // u: distanza dal centro della tappa (-0.5..0.5). Al bordo il dispositivo è sparito
    const u = pos - k;
    const a = Math.min(1, Math.abs(2 * u));
    const away = Math.pow(a, 2.4);

    tilt.x = damp(tilt.x, -pointer.y * 0.14, 3.5, step);
    tilt.y = damp(tilt.y, pointer.x * 0.26, 3.5, step);
    const turn = Math.sign(u) * away * 1.6; // gira mentre si allontana
    const rest = model === models.phone ? -0.22 : -0.2; // di tre quarti, non piatto

    const phone = model === models.phone;
    // il portatile si guarda quasi ad altezza schermo: si vede la tastiera, non tutta la base
    holder.rotation.set(tilt.x + (phone ? 0.08 : -0.06), tilt.y + rest + turn, phone ? -0.04 : 0);
    holder.scale.setScalar(fit[phone ? "phone" : "laptop"] * (1 - 0.92 * away));
    holder.position.set(0, -away * 0.6 + Math.sin(t * 1.1) * 0.025, -away * 1.5);
    model.glare.material.opacity = Math.min(1, Math.max(0.15, 0.6 + holder.rotation.y * 0.5));
  }

  await stage.warmup();
  stage.resize();

  return {
    setVisible: stage.setVisible,
    // posizione continua del progetto mostrato (0..n-1)
    setProgress(v) {
      target = v;
      if (reducedMotion) stage.invalidate();
    },
    dispose() {
      pointer.dispose();
      screens.forEach((s) => s.map.dispose());
      glare.dispose();
      stage.dispose();
    },
  };
}
