// Progetti — un solo dispositivo 3D che mostra un progetto alla volta:
// smartphone per le app mobile, portatile per le web app, con lo schermo del progetto.
// Scorrendo il dispositivo gira e si allontana; quando è sparito diventa il progetto
// successivo (forma e schermo) e torna avanti. Si inclina seguendo il mouse.
// Tutto costruito in codice, nessun modello esterno: geometrie, materiali e luci da studio.
import {
  Scene, Group, Mesh, MeshStandardMaterial, MeshPhysicalMaterial, MeshBasicMaterial, Shape, ShapeGeometry,
  BoxGeometry, PlaneGeometry, CylinderGeometry, CircleGeometry, InstancedMesh, Object3D, Color,
  CanvasTexture, SRGBColorSpace, PMREMGenerator, AmbientLight, PointLight, ShaderMaterial,
  AdditiveBlending, BackSide, DoubleSide,
} from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createStage, trackPointer, damp, isTouch } from "./stage";

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

/* ---------- Studio fotografico (mappa d'ambiente) ----------
   I riflessi sono la cosa che fa sembrare "vero" metallo e vetro. Invece di una stanza
   generica uso uno studio da foto di prodotto: un softbox grande in alto, due strisce
   di luce ai lati (le lunghe linee luminose sugli spigoli) e due controluce colorati
   nei toni del sito. Tutto calcolato in codice, nessuna immagine HDR da scaricare. */
export function studioEnvironment(renderer) {
  const env = new Scene();
  env.add(new Mesh(new BoxGeometry(24, 24, 24), new MeshBasicMaterial({ color: 0x07060b, side: BackSide })));
  const panel = (w, h, color, intensity, pos) => {
    const m = new Mesh(new PlaneGeometry(w, h), new MeshBasicMaterial({ color: new Color(color).multiplyScalar(intensity), side: DoubleSide }));
    m.position.set(...pos);
    m.lookAt(0, 0, 0);
    env.add(m);
  };
  panel(9, 4, 0xffffff, 9, [0, 8, 4]); // softbox principale, in alto davanti
  panel(1.4, 12, 0xffffff, 7, [-8, 1, 3]); // striscia a sinistra
  panel(1.4, 12, 0xffffff, 4.5, [8, 1, 2]); // striscia a destra
  panel(3, 7, 0xa855f7, 5, [9, 0.5, -2.5]); // controluce viola, di lato
  panel(3, 7, 0x2dd4bf, 4, [-9, 0.5, -3]); // controluce verde acqua, di lato
  panel(10, 3, 0x9a98a8, 0.9, [0, 3.5, -9]); // fondale grigio alto: riflesso neutro sulle superfici orizzontali
  panel(14, 3, 0xffffff, 0.8, [0, -7, 5]); // riempimento tenue dal basso
  const pmrem = new PMREMGenerator(renderer);
  const tex = pmrem.fromScene(env, 0.025).texture;
  pmrem.dispose();
  env.traverse((o) => { o.geometry?.dispose(); o.material?.dispose(); });
  return tex;
}

/* Vetro sopra gli schermi. Un display vero riflette la stanza, non dei punti luce:
   qui il riflesso è quello di un grande softbox e di una striscia laterale, calcolato
   dalla direzione di vista, e pesato con la legge di Fresnel (quasi niente guardando
   di fronte, molto guardando di sbieco). Si somma all'immagine dello schermo. */
function screenGlassMaterial() {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    toneMapped: false,
    vertexShader: /* glsl */ `
      varying vec3 vPos;
      varying vec3 vNormal;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vPos = wp.xyz;
        vNormal = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vPos;
      varying vec3 vNormal;
      void main() {
        vec3 V = normalize(vPos - cameraPosition);
        vec3 N = normalize(vNormal);
        vec3 R = reflect(V, N);
        float fres = 0.04 + 0.96 * pow(1.0 - clamp(dot(-V, N), 0.0, 1.0), 5.0);
        // softbox in alto (bordi morbidi) e striscia verticale a sinistra
        float box = smoothstep(0.18, 0.42, R.y) * (1.0 - smoothstep(0.45, 0.85, abs(R.x + 0.15)));
        float strip = (1.0 - smoothstep(0.0, 0.1, abs(R.x + 0.62))) * smoothstep(-0.5, 0.1, R.y);
        float L = 0.05 + 1.6 * box + 0.9 * strip;
        gl_FragColor = vec4(vec3(L * fres), 1.0);
      }
    `,
  });
}

/* ---------- Materiali condivisi ---------- */
export function materials() {
  return {
    // titanio della scocca del telefono e del coperchio del portatile: spazzolato, con vernice trasparente
    titanium: new MeshPhysicalMaterial({ color: 0x46434f, metalness: 1, roughness: 0.27, anisotropy: 0.35, clearcoat: 0.25, clearcoatRoughness: 0.2 }),
    // alluminio "grigio siderale" della base del portatile
    alu: new MeshPhysicalMaterial({ color: 0x4a4852, metalness: 0.9, roughness: 0.52, anisotropy: 0.4, envMapIntensity: 0.55 }),
    // cerniera: alluminio anodizzato scuro
    hingeMetal: new MeshStandardMaterial({ color: 0x1b1a21, metalness: 0.8, roughness: 0.42 }),
    // vetro nero lucido attorno agli schermi
    glass: new MeshPhysicalMaterial({ color: 0x020203, metalness: 0, roughness: 0.04, clearcoat: 1, clearcoatRoughness: 0.03 }),
    // retro del telefono: vetro satinato
    frosted: new MeshPhysicalMaterial({ color: 0x1c1a22, metalness: 0.1, roughness: 0.5, clearcoat: 0.9, clearcoatRoughness: 0.45 }),
    // il gradino delle fotocamere: stesso vetro, ma lucido
    plateau: new MeshPhysicalMaterial({ color: 0x24212c, metalness: 0.1, roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.05 }),
    // lenti con il trattamento antiriflesso (iridescenza viola-verde, come le lenti vere)
    lens: new MeshPhysicalMaterial({ color: 0x010103, metalness: 0, roughness: 0.02, clearcoat: 1, iridescence: 1, iridescenceIOR: 1.8, iridescenceThicknessRange: [180, 520], envMapIntensity: 1.4 }),
    cameraLens: new MeshPhysicalMaterial({ map: lensTexture(), roughness: 0.05, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.02, iridescence: 0.5, iridescenceIOR: 1.8, envMapIntensity: 1.2 }),
    flash: new MeshPhysicalMaterial({ color: 0xf2e8d0, roughness: 0.35, metalness: 0, clearcoat: 1, emissive: 0x2a2416 }),
    // tasti: plastica satinata
    key: new MeshPhysicalMaterial({ color: 0x0a090d, metalness: 0, roughness: 0.62, clearcoat: 0.15, clearcoatRoughness: 0.6, envMapIntensity: 0.25 }),
    // pozzetto della tastiera: la retroilluminazione filtra tra i tasti
    well: new MeshStandardMaterial({ color: 0x050407, roughness: 0.8, emissive: 0x3a1a6e, emissiveIntensity: 0.28 }),
    dark: new MeshStandardMaterial({ color: 0x08070b, metalness: 0.2, roughness: 0.7 }),
    hole: new MeshBasicMaterial({ color: 0x020203 }),
    pad: new MeshPhysicalMaterial({ color: 0x2c2a33, metalness: 0.3, roughness: 0.5, clearcoat: 0.2, clearcoatRoughness: 0.55, envMapIntensity: 0.55 }),
    screenGlass: screenGlassMaterial(),
  };
}

// lente fotografica vista di fronte: barilotto con anelli, vetro scuro con i riflessi
// colorati del trattamento antiriflesso e un piccolo punto di luce
function lensTexture() {
  const S = 256, c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d");
  const C = S / 2;
  const ring = (r, color, w) => { g.strokeStyle = color; g.lineWidth = w; g.beginPath(); g.arc(C, C, r, 0, Math.PI * 2); g.stroke(); };
  g.fillStyle = "#0b0b10";
  g.fillRect(0, 0, S, S);
  ring(118, "#2a2833", 12); // bordo del barilotto
  ring(104, "#141319", 8);
  ring(94, "#1d1c24", 3);
  // vetro: profondo, quasi nero al centro
  const glass = g.createRadialGradient(C - 10, C - 12, 4, C, C, 88);
  glass.addColorStop(0, "#1a1530");
  glass.addColorStop(0.55, "#07060c");
  glass.addColorStop(1, "#020204");
  g.fillStyle = glass;
  g.beginPath(); g.arc(C, C, 88, 0, Math.PI * 2); g.fill();
  // riflessi del trattamento: archi viola e verde acqua
  g.lineCap = "round";
  g.globalAlpha = 0.55;
  g.strokeStyle = "#8b5cf6"; g.lineWidth = 7; g.beginPath(); g.arc(C, C, 66, Math.PI * 1.05, Math.PI * 1.45); g.stroke();
  g.strokeStyle = "#2dd4bf"; g.lineWidth = 5; g.beginPath(); g.arc(C, C, 52, Math.PI * 0.15, Math.PI * 0.45); g.stroke();
  g.globalAlpha = 0.35;
  g.strokeStyle = "#c084fc"; g.lineWidth = 3; g.beginPath(); g.arc(C, C, 34, Math.PI * 1.1, Math.PI * 1.6); g.stroke();
  g.globalAlpha = 1;
  ring(26, "#0f0e14", 4); // anello interno dell'ottica
  // punto di luce
  const hl = g.createRadialGradient(C - 30, C - 34, 0, C - 30, C - 34, 16);
  hl.addColorStop(0, "rgba(255,255,255,0.95)");
  hl.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = hl;
  g.beginPath(); g.arc(C - 30, C - 34, 16, 0, Math.PI * 2); g.fill();
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

// monogramma sul retro del coperchio (si vede quando il portatile gira)
export function logoTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d");
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.font = "italic 400 150px Fraunces, Georgia, serif";
  g.shadowColor = "rgba(168,85,247,0.9)";
  g.shadowBlur = 28;
  g.fillStyle = "#d8b4fe";
  g.fillText("FC", 128, 136);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

// ombra a terra: impronta del dispositivo sfumata (nucleo scuro + alone largo), non un'ellisse generica
function shadowTexture(rect) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d");
  const blob = (w, h, r, blur, alpha) => {
    g.filter = `blur(${blur}px)`;
    g.fillStyle = `rgba(0,0,0,${alpha})`;
    g.beginPath();
    g.roundRect((256 - w) / 2, (256 - h) / 2, w, h, r);
    g.fill();
  };
  if (rect) {
    blob(190, 150, 14, 26, 0.35); // alone
    blob(170, 128, 10, 8, 0.55); // nucleo, dove la base tocca terra
  } else {
    blob(150, 46, 23, 22, 0.55);
    blob(120, 26, 13, 8, 0.45);
  }
  return new CanvasTexture(c);
}

// colore medio di un'immagine: è il colore della luce che lo schermo getta sulla tastiera
function averageColor(tex) {
  const c = document.createElement("canvas");
  c.width = c.height = 1;
  const g = c.getContext("2d");
  g.drawImage(tex.image, 0, 0, 1, 1);
  const [r, gg, b] = g.getImageData(0, 0, 1, 1).data;
  return new Color(`rgb(${r},${gg},${b})`);
}

// tanti cerchietti (fori di altoparlanti, griglie) in un'unica mesh
function holes(mat, points, radius) {
  const im = new InstancedMesh(new CircleGeometry(radius, 10), mat, points.length);
  const o = new Object3D();
  points.forEach(([x, y, z, rx = 0, ry = 0], i) => {
    o.position.set(x, y, z);
    o.rotation.set(rx, ry, 0);
    o.updateMatrix();
    im.setMatrixAt(i, o.matrix);
  });
  return im;
}

/* ---------- Smartphone (schermo 9:16) ---------- */
const P_SW = 1.0;
const P_SH = (P_SW * 16) / 9;
const P_BW = P_SW + 0.09;
const P_BH = P_SH + 0.09;
const P_D = 0.11;

export function buildPhone(M, logo) {
  const g = new Group();
  g.add(new Mesh(new RoundedBoxGeometry(P_BW, P_BH, P_D, 10, 0.13), M.titanium));

  // fronte: vetro nero con la cornice sottile, schermo, Dynamic Island
  const front = new Mesh(new ShapeGeometry(roundedRect(P_BW - 0.024, P_BH - 0.024, 0.115), 16), M.glass);
  front.position.z = P_D / 2 + 0.001;
  g.add(front);
  const screen = new Mesh(
    planeUV(new ShapeGeometry(roundedRect(P_SW, P_SH, 0.09), 14), P_SW, P_SH),
    new MeshBasicMaterial({ toneMapped: false }),
  );
  screen.position.z = P_D / 2 + 0.003;
  g.add(screen);
  const island = new Mesh(new ShapeGeometry(roundedRect(0.27, 0.075, 0.0375), 10), new MeshBasicMaterial({ color: 0x030303 }));
  island.position.set(0, P_SH / 2 - 0.075, P_D / 2 + 0.005);
  g.add(island);
  const selfie = new Mesh(new CircleGeometry(0.014, 16), M.lens);
  selfie.position.set(0.085, P_SH / 2 - 0.075, P_D / 2 + 0.0055);
  g.add(selfie);
  const glass = new Mesh(new ShapeGeometry(roundedRect(P_BW - 0.024, P_BH - 0.024, 0.115), 16), M.screenGlass);
  glass.position.z = P_D / 2 + 0.008;
  g.add(glass);

  // retro: vetro satinato e gradino delle fotocamere
  const back = new Mesh(new ShapeGeometry(roundedRect(P_BW - 0.03, P_BH - 0.03, 0.11), 16), M.frosted);
  back.rotation.y = Math.PI;
  back.position.z = -P_D / 2 - 0.001;
  g.add(back);
  const cam = new Group();
  cam.position.set(-P_BW / 2 + 0.255, P_BH / 2 - 0.255, -P_D / 2);
  cam.rotation.y = Math.PI; // da qui in poi +z esce dal retro
  g.add(cam);
  const plateau = new Mesh(new RoundedBoxGeometry(0.42, 0.42, 0.03, 6, 0.1), M.plateau);
  plateau.position.z = 0.01;
  cam.add(plateau);
  [[-0.095, 0.095], [-0.095, -0.095], [0.095, 0]].forEach(([x, y]) => {
    const ring = new Mesh(new CylinderGeometry(0.078, 0.082, 0.04, 48), M.titanium);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(x, y, 0.04);
    cam.add(ring);
    const lens = new Mesh(new CircleGeometry(0.066, 48), M.cameraLens);
    lens.position.set(x, y, 0.061);
    cam.add(lens);
  });
  const flash = new Mesh(new CircleGeometry(0.026, 24), M.flash);
  flash.position.set(0.095, 0.115, 0.026);
  cam.add(flash);
  const lidar = new Mesh(new CircleGeometry(0.022, 24), M.lens);
  lidar.position.set(0.095, -0.115, 0.026);
  cam.add(lidar);

  // il monogramma inciso sul retro, al centro
  if (logo) {
    const mark = new Mesh(new PlaneGeometry(0.22, 0.22), new MeshBasicMaterial({ map: logo, transparent: true, opacity: 0.55, toneMapped: false, depthWrite: false }));
    mark.rotation.y = Math.PI;
    mark.position.set(0, -0.05, -P_D / 2 - 0.003);
    g.add(mark);
  }

  // tasti laterali
  [[-1, 0.5, 0.09], [-1, 0.32, 0.15], [-1, 0.13, 0.15], [1, 0.3, 0.26]].forEach(([side, y, h]) => {
    const b = new Mesh(new RoundedBoxGeometry(0.022, h, 0.05, 3, 0.009), M.titanium);
    b.position.set(side * (P_BW / 2 + 0.007), y, 0);
    g.add(b);
  });
  // bande delle antenne: sottili inserti scuri sulla cornice
  [[-1, 0.62], [1, 0.62], [-1, -0.68], [1, -0.68]].forEach(([side, y]) => {
    const band = new Mesh(new PlaneGeometry(0.06, 0.008), M.dark);
    band.rotation.y = side * Math.PI / 2;
    band.position.set(side * (P_BW / 2 + 0.0005), y, 0);
    g.add(band);
  });
  // lato inferiore: porta USB-C e fori degli altoparlanti
  const bottom = -P_BH / 2 - 0.0008;
  const port = new Mesh(new ShapeGeometry(roundedRect(0.1, 0.028, 0.014), 8), M.hole);
  port.rotation.x = Math.PI / 2;
  port.position.set(0, bottom, 0);
  g.add(port);
  const grill = [];
  for (let k = 0; k < 6; k++) {
    grill.push([0.11 + k * 0.026, bottom, 0, Math.PI / 2], [-0.11 - k * 0.026, bottom, 0, Math.PI / 2]);
  }
  g.add(holes(M.hole, grill, 0.0075));

  return { group: g, screen, aspect: P_SW / P_SH, size: { w: P_BW, h: P_BH }, floor: -P_BH / 2 - 0.18, shadow: [1.6, 0.7] };
}

/* ---------- Portatile (schermo 16:10) ---------- */
const L_SW = 1.6;
const L_SH = 1.0;
const L_LW = L_SW + 0.1;
const L_LH = L_SH + 0.13;
const L_LD = 0.035;
const L_OPEN = -0.2; // coperchio un po' inclinato all'indietro

// file della tastiera: larghezze dei tasti in "unità" (come una tastiera vera)
const KEY_ROWS = [
  { d: 0.55, keys: Array(14).fill(1) }, // tasti funzione, più bassi
  { d: 1, keys: [...Array(13).fill(1), 1.5] },
  { d: 1, keys: [1.5, ...Array(12).fill(1), 1] },
  { d: 1, keys: [1.75, ...Array(11).fill(1), 1.75] },
  { d: 1, keys: [2.25, ...Array(10).fill(1), 2.25] },
  { d: 1, keys: [1, 1, 1, 1.25, 5, 1.25, 1, 1, 1, 1] },
];

// tasti con gli spigoli arrotondati, tutti fusi in un'unica geometria (una sola chiamata di disegno)
function buildKeyboard(M, width, z0) {
  const unitD = width / 14.5;
  const gap = 0.013;
  const parts = [];
  let z = z0;
  for (const row of KEY_ROWS) {
    const u = width / row.keys.reduce((a, b) => a + b, 0);
    const d = row.d * unitD;
    let x = -width / 2;
    for (const k of row.keys) {
      const w = k * u;
      const geo = new RoundedBoxGeometry(w - gap, 0.014, d - gap, 2, 0.006);
      geo.translate(x + w / 2, 0.007, z + d / 2);
      parts.push(geo);
      x += w;
    }
    z += d;
  }
  const keys = new Mesh(mergeGeometries(parts), M.key);
  parts.forEach((p) => p.dispose());
  return { keys, end: z };
}

export function buildLaptop(M, logo) {
  const g = new Group();
  // il perno della rotazione è al centro dello schermo, non sulla cerniera
  const body = new Group();
  body.position.set(0, -L_LH * 0.5, -0.2);
  g.add(body);

  const hinge = new Group();
  hinge.rotation.x = L_OPEN;
  body.add(hinge);
  const lid = new Mesh(new RoundedBoxGeometry(L_LW, L_LH, L_LD, 6, 0.03), M.titanium);
  lid.position.y = L_LH / 2;
  hinge.add(lid);
  // cornice in vetro nero, schermo con gli angoli in alto arrotondati, vetro che riflette
  const bezel = new Mesh(new ShapeGeometry(roundedRect(L_LW - 0.02, L_LH - 0.02, 0.028), 10), M.glass);
  bezel.position.set(0, L_LH / 2, L_LD / 2 + 0.001);
  hinge.add(bezel);
  const screen = new Mesh(
    planeUV(new ShapeGeometry(roundedRect(L_SW, L_SH, 0.012), 6), L_SW, L_SH),
    new MeshBasicMaterial({ toneMapped: false }),
  );
  screen.position.set(0, L_LH / 2 + 0.025, L_LD / 2 + 0.003);
  hinge.add(screen);
  const glassPane = new Mesh(new ShapeGeometry(roundedRect(L_LW - 0.02, L_LH - 0.02, 0.028), 10), M.screenGlass);
  glassPane.position.set(0, L_LH / 2, L_LD / 2 + 0.006);
  hinge.add(glassPane);
  const camera = new Mesh(new CircleGeometry(0.011, 20), M.lens);
  camera.position.set(0, L_LH - 0.032, L_LD / 2 + 0.004);
  hinge.add(camera);
  // il monogramma sul retro
  const mark = new Mesh(new PlaneGeometry(0.26, 0.26), new MeshBasicMaterial({ map: logo, transparent: true, toneMapped: false, depthWrite: false }));
  mark.rotation.y = Math.PI;
  mark.position.set(0, L_LH / 2, -L_LD / 2 - 0.002);
  hinge.add(mark);
  // la luce dello schermo: illumina la tastiera del colore di quello che mostra
  // (una luce puntiforme davanti alla parte bassa dello schermo: leggera e convincente)
  const glow = new PointLight(0xffffff, 1.1, 2.4, 1.5);
  glow.position.set(0, L_LH * 0.5, 0.06);
  hinge.add(glow);

  // cerniera
  const BW = L_LW + 0.04;
  const BD = 1.08;
  const pin = new Mesh(new CylinderGeometry(0.026, 0.026, BW - 0.34, 32), M.hingeMetal);
  pin.rotation.z = Math.PI / 2;
  pin.position.set(0, 0.004, 0.005);
  body.add(pin);

  // base in alluminio
  const base = new Mesh(new RoundedBoxGeometry(BW, 0.045, BD, 6, 0.02), M.alu);
  base.position.set(0, -0.0225, BD / 2);
  body.add(base);
  // tastiera nel suo pozzetto (con la retroilluminazione che filtra) e griglie degli altoparlanti ai lati
  const KW = BW - 0.32;
  const well = new Mesh(new ShapeGeometry(roundedRect(KW + 0.03, 0.6, 0.02), 6), M.well);
  well.rotation.x = -Math.PI / 2;
  well.position.set(0, 0.0006, 0.085 + 0.3);
  body.add(well);
  const kb = buildKeyboard(M, KW, 0.1);
  body.add(kb.keys);
  const grill = [];
  for (const side of [-1, 1]) {
    for (let c = 0; c < 3; c++) {
      for (let r = 0; r < 26; r++) {
        grill.push([side * (KW / 2 + 0.05 + c * 0.022), 0.0008, 0.1 + r * 0.022, -Math.PI / 2]);
      }
    }
  }
  body.add(holes(M.hole, grill, 0.0055));
  const pad = new Mesh(new ShapeGeometry(roundedRect(0.66, 0.31, 0.03), 10), M.pad);
  pad.rotation.x = -Math.PI / 2;
  pad.position.set(0, 0.0012, kb.end + 0.06 + 0.155);
  body.add(pad);
  // incavo per aprire il coperchio, sul bordo anteriore
  const notch = new Mesh(new ShapeGeometry(roundedRect(0.22, 0.02, 0.01), 6), M.dark);
  notch.position.set(0, -0.01, BD + 0.0005);
  body.add(notch);

  return {
    group: g, screen, glow, aspect: L_SW / L_SH,
    size: { w: BW, h: L_LH + 0.55 }, // visto dall'alto anche la base occupa spazio in altezza
    floor: -L_LH * 0.5 - 0.05,
    shadow: [BW * 1.3, BD * 1.45],
    rectShadow: true,
  };
}

export default async function create(canvas, { items = [], reducedMotion }) {
  const pointer = trackPointer(canvas);
  const stage = createStage(canvas, { fov: 30, reducedMotion, onResize: layout, onFrame: frame, toneMapping: true, exposure: 1.15 });
  const { scene, camera, renderer } = stage;
  const aniso = renderer.capabilities.getMaxAnisotropy();

  // riflessi da studio fotografico, calcolati in codice
  scene.environment = studioEnvironment(renderer);

  await document.fonts?.ready; // logo e schemi disegnati usano i font del sito
  const M = materials();
  const logo = logoTexture();
  const models = { phone: buildPhone(M, logo), laptop: buildLaptop(M, logo) };
  const holder = new Group();
  scene.add(holder);
  Object.values(models).forEach((m) => { m.group.visible = false; holder.add(m.group); });

  const shadowMaps = { round: shadowTexture(false), rect: shadowTexture(true) };
  const shadow = new Mesh(new PlaneGeometry(1, 1), new MeshBasicMaterial({ map: shadowMaps.round, transparent: true, depthWrite: false, toneMapped: false }));
  shadow.rotation.x = -Math.PI / 2;
  scene.add(shadow);

  // una texture per progetto, già adattata allo schermo del suo dispositivo
  const images = await Promise.all(items.map((it) => (it.image ? loadImage(it.image) : null)));
  const screens = items.map((it, i) => {
    const m = models[it.device === "phone" ? "phone" : "laptop"];
    const map = it.screen?.diagram
      ? diagramTexture(it.screen.diagram, m.aspect, aniso)
      : screenTexture(images[i], m.aspect, it.screen, aniso);
    return { model: m, map, light: averageColor(map) };
  });

  // luci: poche e morbide, il grosso lo fanno i riflessi dello studio; i controluce colorati
  // disegnano i bordi nei toni del sito
  scene.add(new AmbientLight(0xffffff, 0.12));
  const rimTeal = new PointLight(0x2dd4bf, 14, 12, 2);
  rimTeal.position.set(-2.4, 1.3, -0.8);
  const rimPurple = new PointLight(0xa855f7, 18, 12, 2);
  rimPurple.position.set(2.4, -1, -0.6);
  const key = new PointLight(0xffffff, 2.5, 12, 2);
  key.position.set(0.6, 2.6, 3);
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
    const { model, map, light } = screens[k];
    Object.values(models).forEach((m) => { m.group.visible = m === model; });
    model.screen.material.map = map;
    model.screen.material.needsUpdate = true;
    model.glow?.color.copy(light);
    shadow.material.map = model.rectShadow ? shadowMaps.rect : shadowMaps.round;
    shadow.material.needsUpdate = true;
  }

  const still = isTouch(); // su telefono: niente mouse da seguire, niente ondeggiamento
  let quiet = 0;
  function frame(t, dt) {
    const step = dt || 1;
    const prevPos = pos;
    pos = reducedMotion ? target : damp(pos, target, still ? 9 : 7, step);
    if (still) {
      quiet = Math.abs(pos - prevPos) > 1e-5 ? 0 : quiet + 1;
      if (quiet > 2) return false;
    }
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
    // il portatile si guarda un po' dall'alto, come su una scrivania: si vedono tastiera e trackpad
    holder.rotation.set(tilt.x + (phone ? 0.08 : 0.16), tilt.y + rest + turn, phone ? -0.04 : 0);
    const sc = fit[phone ? "phone" : "laptop"] * (1 - 0.92 * away);
    holder.scale.setScalar(sc);
    holder.position.set(0, -away * 0.6 + (still ? 0 : Math.sin(t * 1.1) * 0.025), -away * 1.5);
    // l'ombra resta a terra sotto il dispositivo e si allarga/sbiadisce con lui
    shadow.position.set(holder.position.x, holder.position.y + model.floor * sc, holder.position.z);
    shadow.scale.set(model.shadow[0] * sc, model.shadow[1] * sc, 1);
    shadow.material.opacity = 0.9 * (1 - away);
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
      [logo, shadowMaps.round, shadowMaps.rect].forEach((t) => t.dispose());
      stage.dispose();
    },
  };
}
