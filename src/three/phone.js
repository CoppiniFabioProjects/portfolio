// spostiamoci — smartphone 3D "da lancio prodotto": il poster di samo sullo schermo,
// si inclina seguendo il mouse e ruota con lo scroll. Tutto costruito in codice.
import {
  Group, Mesh, MeshStandardMaterial, MeshBasicMaterial, Shape, ShapeGeometry, BoxGeometry,
  TextureLoader, CanvasTexture, SRGBColorSpace, PMREMGenerator, AmbientLight, PointLight,
  AdditiveBlending,
} from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { createStage, trackPointer, clamp01, damp, easeOutCubic } from "./stage";

// Proporzioni: schermo 9:16 (come il poster 720×1280)
const SCREEN_W = 1.0;
const SCREEN_H = (SCREEN_W * 16) / 9;
const BODY_W = SCREEN_W + 0.09;
const BODY_H = SCREEN_H + 0.09;
const DEPTH = 0.11;

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
  c.height = 456;
  const g = c.getContext("2d");
  const grad = g.createLinearGradient(0, 0, 256, 456);
  grad.addColorStop(0, "rgba(255,255,255,0.20)");
  grad.addColorStop(0.35, "rgba(255,255,255,0.05)");
  grad.addColorStop(0.36, "rgba(255,255,255,0)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 456);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

export default async function create(canvas, { src, reducedMotion }) {
  let progress = 0.5;
  let shown = false;
  let enterT = 0;
  const pointer = trackPointer(canvas);
  const tilt = { x: 0, y: 0 };

  const stage = createStage(canvas, { fov: 30, reducedMotion, onResize: layout, onFrame: frame });
  const { scene, camera, renderer } = stage;

  // riflessi metallici credibili senza file esterni
  const pmrem = new PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  scene.environment = pmrem.fromScene(room, 0.04).texture;
  room.dispose?.();
  pmrem.dispose();

  const poster = await new TextureLoader().loadAsync(src);
  poster.colorSpace = SRGBColorSpace;
  poster.anisotropy = renderer.capabilities.getMaxAnisotropy();

  const phone = new Group();

  // scocca in titanio scuro
  const body = new Mesh(
    new RoundedBoxGeometry(BODY_W, BODY_H, DEPTH, 6, 0.12),
    new MeshStandardMaterial({ color: 0x1c1a24, metalness: 0.9, roughness: 0.32, envMapIntensity: 1.1 }),
  );
  phone.add(body);

  // schermo con il poster (non illuminato: è un display)
  const screen = new Mesh(
    planeUV(new ShapeGeometry(roundedRect(SCREEN_W, SCREEN_H, 0.09), 10), SCREEN_W, SCREEN_H),
    new MeshBasicMaterial({ map: poster, toneMapped: false }),
  );
  screen.position.z = DEPTH / 2 + 0.002;
  phone.add(screen);

  // Dynamic Island
  const island = new Mesh(
    new ShapeGeometry(roundedRect(0.27, 0.075, 0.0375), 8),
    new MeshBasicMaterial({ color: 0x050505 }),
  );
  island.position.set(0, SCREEN_H / 2 - 0.075, DEPTH / 2 + 0.004);
  phone.add(island);

  // riflesso del vetro, scorre un po' quando il telefono ruota
  const glare = new Mesh(
    planeUV(new ShapeGeometry(roundedRect(SCREEN_W, SCREEN_H, 0.09), 10), SCREEN_W, SCREEN_H),
    new MeshBasicMaterial({ map: glareTexture(), transparent: true, blending: AdditiveBlending, depthWrite: false }),
  );
  glare.position.z = DEPTH / 2 + 0.006;
  phone.add(glare);

  // tasti laterali
  const btnMat = new MeshStandardMaterial({ color: 0x24222e, metalness: 0.9, roughness: 0.3 });
  [[-1, 0.42, 0.16], [-1, 0.18, 0.16], [1, 0.3, 0.26]].forEach(([side, y, h]) => {
    const b = new Mesh(new BoxGeometry(0.018, h, 0.05), btnMat);
    b.position.set(side * (BODY_W / 2 + 0.006), y, 0);
    phone.add(b);
  });

  scene.add(phone);

  // luci di contorno nei colori del sito
  scene.add(new AmbientLight(0xffffff, 0.25));
  const rimTeal = new PointLight(0x2dd4bf, 18, 10, 2);
  rimTeal.position.set(-2.2, 1.2, -0.8);
  const rimPurple = new PointLight(0xa855f7, 22, 10, 2);
  rimPurple.position.set(2.2, -1, -0.6);
  scene.add(rimTeal, rimPurple);

  // il telefono occupa ~80% dell'altezza disponibile
  function layout(size) {
    const fitH = BODY_H / (2 * 0.8 * size.tanV);
    const fitW = BODY_W / (2 * 0.62 * size.tanV * size.aspect);
    camera.position.set(0, 0, Math.max(fitH, fitW));
  }

  function frame(t, dt) {
    const step = dt || 1;
    if (shown && !enterT) enterT = t || 0.0001;
    // entrata: sale dal basso ruotando, la prima volta che compare
    const enter = reducedMotion ? 1 : easeOutCubic(clamp01((t - enterT) / 1.3));
    tilt.x = damp(tilt.x, -pointer.y * 0.18, 3.5, step);
    tilt.y = damp(tilt.y, pointer.x * 0.32, 3.5, step);
    const scrollTurn = (0.5 - progress) * 0.9; // da destra a sinistra mentre scorri

    phone.rotation.set(
      tilt.x + 0.06,
      tilt.y + scrollTurn - 0.25 + (1 - enter) * 1.4,
      -0.04 + (1 - enter) * 0.2,
    );
    phone.position.y = (1 - enter) * -1.2 + Math.sin(t * 1.1) * 0.03;
    glare.material.opacity = Math.min(1, Math.max(0.2, 0.6 + phone.rotation.y * 0.5));
    glare.position.x = -phone.rotation.y * 0.06;
  }

  await stage.warmup();
  stage.resize();

  return {
    setVisible(v) {
      if (v) shown = true;
      stage.setVisible(v);
    },
    setProgress(v) {
      progress = v;
    },
    dispose() {
      pointer.dispose();
      poster.dispose();
      stage.dispose();
    },
  };
}
