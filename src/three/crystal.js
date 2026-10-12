// Manifesto — "Tolgo peso": un cristallo low-poly scuro e pesante che, con lo
// scroll, si frantuma in schegge che salgono e si dissolvono in polvere di luce.
// Legato allo scroll: tornando su, il cristallo si ricompone.
import {
  IcosahedronGeometry, MeshStandardMaterial, Mesh, Float32BufferAttribute, Group,
  EdgesGeometry, LineSegments, LineBasicMaterial, BufferGeometry, Points, ShaderMaterial,
  AdditiveBlending, AmbientLight, PointLight, DirectionalLight, Vector3,
} from "three";
import { createStage, trackPointer, clamp01, damp } from "./stage";

const RADIUS = 1.25;

const dustVertex = /* glsl */ `
  uniform float uShatter;
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  attribute float aRand;
  varying float vAlpha;
  varying float vTeal;
  void main() {
    float s = clamp((uShatter - aRand * 0.4) / 0.6, 0.0, 1.0);
    vec3 p = position * (1.0 + s * (0.6 + aRand * 1.4));
    p.y += s * s * (2.2 + aRand * 3.0);
    p.x += sin(uTime * 0.9 + aRand * 30.0) * 0.08 * s;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.5 + aRand) * uPixelRatio / -mv.z;
    // compare con la frattura e si spegne salendo
    vAlpha = smoothstep(0.02, 0.25, s) * (1.0 - smoothstep(0.55, 1.0, s));
    vTeal = step(0.7, aRand);
  }
`;
const dustFragment = /* glsl */ `
  varying float vAlpha;
  varying float vTeal;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = pow(smoothstep(0.5, 0.0, d), 1.6) * vAlpha;
    if (a < 0.01) discard;
    vec3 col = mix(vec3(0.78, 0.55, 1.0), vec3(0.37, 0.92, 0.83), vTeal);
    gl_FragColor = vec4(col * a, a);
  }
`;

export default async function create(canvas, { reducedMotion }) {
  let progress = 0;
  let shatter = 0;
  const pointer = trackPointer(canvas);
  const rot = { x: 0, y: 0 };

  const stage = createStage(canvas, {
    fov: 35,
    reducedMotion,
    onResize: layout,
    onFrame: frame,
  });
  const { scene, camera, renderer } = stage;
  camera.position.set(0, 0, 7);

  // --- Cristallo: ogni triangolo è una scheggia indipendente ---
  const geo = new IcosahedronGeometry(RADIUS, 1).toNonIndexed();
  const pos = geo.attributes.position;
  const n = pos.count;
  const centers = new Float32Array(n * 3);
  const rands = new Float32Array(n);
  const axes = new Float32Array(n * 3);
  const c = new Vector3();
  const ax = new Vector3();
  for (let i = 0; i < n; i += 3) {
    c.set(0, 0, 0);
    for (let k = 0; k < 3; k++) c.add(new Vector3().fromBufferAttribute(pos, i + k));
    c.divideScalar(3);
    ax.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
    // le schegge in alto si staccano per prime: la frattura "sale"
    const r = clamp01(0.55 - c.y / (RADIUS * 2) + (Math.random() - 0.5) * 0.5);
    for (let k = 0; k < 3; k++) {
      centers.set([c.x, c.y, c.z], (i + k) * 3);
      axes.set([ax.x, ax.y, ax.z], (i + k) * 3);
      rands[i + k] = r;
    }
  }
  geo.setAttribute("aCenter", new Float32BufferAttribute(centers, 3));
  geo.setAttribute("aAxis", new Float32BufferAttribute(axes, 3));
  geo.setAttribute("aRand", new Float32BufferAttribute(rands, 1));

  const uniforms = { uShatter: { value: 0 } };
  const mat = new MeshStandardMaterial({
    color: 0x2b1650,
    emissive: 0x16072e,
    metalness: 0.45,
    roughness: 0.22,
    flatShading: true, // normali dalle derivate: restano corrette anche con le schegge ruotate
  });
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uShatter = uniforms.uShatter;
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        /* glsl */ `#include <common>
        uniform float uShatter;
        attribute vec3 aCenter;
        attribute vec3 aAxis;
        attribute float aRand;
        mat3 rotAxis(vec3 a, float ang) {
          float s = sin(ang), c = cos(ang), oc = 1.0 - c;
          return mat3(
            oc * a.x * a.x + c,       oc * a.x * a.y + a.z * s, oc * a.z * a.x - a.y * s,
            oc * a.x * a.y - a.z * s, oc * a.y * a.y + c,       oc * a.y * a.z + a.x * s,
            oc * a.z * a.x + a.y * s, oc * a.y * a.z - a.x * s, oc * a.z * a.z + c);
        }`,
      )
      .replace(
        "#include <begin_vertex>",
        /* glsl */ `
        float sh = clamp((uShatter - aRand * 0.45) / 0.55, 0.0, 1.0);
        float se = sh * sh * (3.0 - 2.0 * sh);
        vec3 local = rotAxis(aAxis, se * (2.0 + aRand * 4.0)) * (position - aCenter);
        local *= 1.0 - se * 0.8;                              // la scheggia si assottiglia
        vec3 p = aCenter + normalize(aCenter) * se * (0.5 + aRand * 1.5); // si apre
        p.y += se * se * (2.4 + aRand * 3.2);                 // e sale: tolgo peso
        vec3 transformed = p + local;`,
      );
  };
  const crystal = new Mesh(geo, mat);

  // involucro di spigoli viola: si spegne quando il cristallo si rompe
  const edgesMat = new LineBasicMaterial({ color: 0xc084fc, transparent: true, opacity: 0.4 });
  const edges = new LineSegments(new EdgesGeometry(new IcosahedronGeometry(RADIUS * 1.06, 1)), edgesMat);

  // polvere di luce che nasce dalla superficie
  const DUST = 1400;
  const dustPos = new Float32Array(DUST * 3);
  const dustRand = new Float32Array(DUST);
  for (let i = 0; i < DUST; i++) {
    const v = new Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
    v.multiplyScalar(RADIUS * (0.7 + Math.random() * 0.35));
    dustPos.set([v.x, v.y, v.z], i * 3);
    dustRand[i] = Math.random();
  }
  const dustGeo = new BufferGeometry();
  dustGeo.setAttribute("position", new Float32BufferAttribute(dustPos, 3));
  dustGeo.setAttribute("aRand", new Float32BufferAttribute(dustRand, 1));
  const dustMat = new ShaderMaterial({
    vertexShader: dustVertex,
    fragmentShader: dustFragment,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: {
      uShatter: uniforms.uShatter,
      uTime: { value: 0 },
      uSize: { value: 60 },
      uPixelRatio: { value: renderer.getPixelRatio() },
    },
  });
  const dust = new Points(dustGeo, dustMat);
  dust.frustumCulled = false;
  crystal.frustumCulled = false;

  const group = new Group();
  group.add(crystal, edges, dust);
  scene.add(group);

  // --- Luci: viola e teal che girano attorno, così le facce si accendono ---
  scene.add(new AmbientLight(0x6d4aa8, 0.9));
  const key = new DirectionalLight(0xffffff, 1.1);
  key.position.set(2, 4, 5);
  scene.add(key);
  const purple = new PointLight(0xa855f7, 40, 12, 2);
  const teal = new PointLight(0x2dd4bf, 28, 12, 2);
  scene.add(purple, teal);

  // --- Posizione: a destra del testo su desktop, in alto e più piccolo su mobile ---
  const anchor = { x: 0, y: 0, s: 1 };
  function layout(size) {
    const halfW = camera.position.z * size.tanV * size.aspect;
    if (size.aspect > 1) Object.assign(anchor, { x: halfW * 0.56, y: -0.1, s: 0.85 });
    else Object.assign(anchor, { x: halfW * 0.3, y: 1.25, s: 0.62 });
    group.scale.setScalar(anchor.s);
  }

  function frame(t, dt) {
    // la sezione è "pinnata" tra ~0.33 e ~0.67 del suo scroll: lì avviene la frattura
    const target = reducedMotion ? 0 : clamp01((progress - 0.4) / 0.26);
    shatter = dt ? damp(shatter, target, 5, dt) : target;
    uniforms.uShatter.value = shatter;
    dustMat.uniforms.uTime.value = t;
    edgesMat.opacity = 0.4 * (1 - clamp01(shatter * 5));

    rot.x = damp(rot.x, pointer.y * 0.25, 3, dt || 1);
    rot.y = damp(rot.y, pointer.x * 0.35, 3, dt || 1);
    crystal.rotation.set(rot.x + t * 0.12, rot.y + t * 0.25, 0);
    edges.rotation.copy(crystal.rotation);
    group.position.set(anchor.x, anchor.y + Math.sin(t * 0.8) * 0.06, 0);

    purple.position.set(Math.cos(t * 0.6) * 3 + anchor.x, 1.5, Math.sin(t * 0.6) * 3);
    teal.position.set(Math.cos(t * 0.6 + Math.PI) * 3 + anchor.x, -1.2, Math.sin(t * 0.6 + Math.PI) * 3);
  }

  await stage.warmup();
  stage.resize();

  return {
    setVisible: stage.setVisible,
    setProgress(v) {
      progress = v;
    },
    dispose() {
      pointer.dispose();
      stage.dispose();
    },
  };
}
