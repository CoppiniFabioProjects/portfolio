// Contatti — il cerchio si chiude: le particelle riformano il Garuda in fondo alla
// pagina, e col mouse (o col dito) lo disperdi: le particelle sfuggono al cursore
// e poi tornano al loro posto.
import {
  BufferGeometry, Float32BufferAttribute, Points, ShaderMaterial, AdditiveBlending, Group,
  Raycaster, Plane, Vector2, Vector3,
} from "three";
import { createStage, trackPointer, damp, clamp01 } from "./stage";
import { sampleImage } from "./sampleImage";

const vertexShader = /* glsl */ `
  uniform float uProgress;
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform vec2 uMouse;      // in coordinate locali dell'aquila
  uniform float uMouseOn;
  uniform float uRadius;
  uniform float uAlpha;
  attribute vec3 aStart;
  attribute vec3 aColor;
  attribute float aRand;
  varying vec3 vColor;
  varying float vAlpha;

  float easeOutCubic(float t) { return 1.0 - pow(1.0 - t, 3.0); }

  void main() {
    float p = clamp((uProgress - aRand * 0.35) / 0.65, 0.0, 1.0);
    float e = easeOutCubic(p);
    float ang = (1.0 - e) * (2.2 + aRand * 2.0);
    float c = cos(ang), s = sin(ang);
    vec3 start = vec3(aStart.x * c - aStart.z * s, aStart.y, aStart.x * s + aStart.z * c);
    vec3 pos = mix(start, position, e);
    pos += 0.016 * e * vec3(sin(uTime * 1.9 + aRand * 40.0), cos(uTime * 1.5 + aRand * 31.0), 0.0);

    // il cursore spinge via le particelle vicine (e le porta verso di te)
    vec2 d = pos.xy - uMouse;
    float f = (1.0 - smoothstep(0.0, uRadius, length(d))) * uMouseOn * e;
    pos.xy += normalize(d + 1e-4) * f * (0.45 + aRand * 0.55);
    pos.z += f * (0.6 + aRand * 0.9);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = min(uSize * (0.65 + aRand * 0.7) * (1.0 + f * 0.6) * uPixelRatio / max(-mv.z, 0.1), 48.0 * uPixelRatio);
    vColor = aColor * (1.0 + f * 0.8); // le particelle smosse si accendono
    vAlpha = (0.15 + 0.85 * e) * uAlpha;
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

const W = 3; // lato dell'aquila in unità mondo

export default async function create(canvas, { src = "/portfolio/garuda.png", reducedMotion }) {
  const mobile = window.matchMedia("(max-width: 767px)").matches;
  const step = mobile ? 5 : 4;
  const samples = await sampleImage(src, { step });
  const pointer = trackPointer(canvas);

  const targets = [], starts = [], colors = [], rands = [];
  const rnd = Math.random;
  const pushStart = () => {
    const r = 3.5 + rnd() * 5;
    const th = rnd() * Math.PI * 2;
    const ph = Math.acos(2 * rnd() - 1);
    starts.push(r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph) * 0.8, Math.min(2, r * Math.sin(ph) * Math.sin(th)));
  };
  for (const { u, v, r, g, b, lum } of samples) {
    targets.push((u - 0.5) * W, (0.5 - v) * W, (lum - 0.4) * 0.9 + (rnd() - 0.5) * 0.06);
    colors.push(r * 1.15, g * 1.1, b * 1.2);
    rands.push(rnd());
    pushStart();
  }

  const stage = createStage(canvas, { fov: 35, reducedMotion, onResize: layout, onFrame: frame });
  const { scene, camera, renderer } = stage;

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(targets, 3));
  geometry.setAttribute("aStart", new Float32BufferAttribute(starts, 3));
  geometry.setAttribute("aColor", new Float32BufferAttribute(colors, 3));
  geometry.setAttribute("aRand", new Float32BufferAttribute(rands, 1));
  const uniforms = {
    uProgress: { value: reducedMotion ? 1 : 0 },
    uTime: { value: 0 },
    uSize: { value: 40 },
    uPixelRatio: { value: renderer.getPixelRatio() },
    uMouse: { value: new Vector2(99, 99) },
    uMouseOn: { value: 0 },
    uRadius: { value: 0.55 },
    uAlpha: { value: 0.5 }, // atmosferico: sta dietro a titolo e pulsanti
  };
  const material = new ShaderMaterial({
    vertexShader, fragmentShader, uniforms,
    transparent: true, depthWrite: false, blending: AdditiveBlending,
  });
  const points = new Points(geometry, material);
  points.frustumCulled = false;
  const group = new Group();
  group.add(points);
  scene.add(group);

  // l'aquila occupa ~90% del lato corto del contenitore
  function layout(s) {
    const px = Math.min(s.h * 0.9, s.w * 0.9);
    camera.position.set(0, 0, (W * s.h) / (2 * s.tanV * px));
    // punti ≈ 2,4× la spaziatura dei campioni sullo schermo
    uniforms.uSize.value = ((W / 460) * step * 2.4 * s.h) / (2 * s.tanV);
  }

  // il puntatore proiettato sul piano dell'aquila
  const ray = new Raycaster();
  const plane = new Plane(new Vector3(0, 0, 1), 0);
  const ndc = new Vector2();
  const hit = new Vector3();
  const mouse = new Vector2(99, 99);
  let assembleAt = null;

  function frame(t, dt) {
    const k = dt || 1;
    if (assembleAt === -1) assembleAt = t;
    if (!reducedMotion) uniforms.uProgress.value = assembleAt == null || assembleAt < 0 ? 0 : clamp01((t - assembleAt) / 2.4);
    uniforms.uTime.value = t;

    group.rotation.set(Math.sin(t * 0.27) * 0.06, Math.sin(t * 0.35) * 0.18, 0);
    group.updateMatrixWorld();

    if (pointer.active) {
      ndc.set(pointer.x, pointer.y);
      ray.setFromCamera(ndc, camera);
      if (ray.ray.intersectPlane(plane, hit)) {
        group.worldToLocal(hit);
        mouse.x = damp(mouse.x === 99 ? hit.x : mouse.x, hit.x, 10, k);
        mouse.y = damp(mouse.y === 99 ? hit.y : mouse.y, hit.y, 10, k);
        uniforms.uMouse.value.copy(mouse);
      }
    }
    uniforms.uMouseOn.value = damp(uniforms.uMouseOn.value, pointer.inside ? 1 : 0, 4, k);
  }

  await stage.warmup();
  stage.resize();

  return {
    setVisible(v) {
      if (v && assembleAt == null) assembleAt = -1; // si compone la prima volta che lo vedi
      stage.setVisible(v);
    },
    dispose() {
      pointer.dispose();
      stage.dispose();
    },
  };
}
