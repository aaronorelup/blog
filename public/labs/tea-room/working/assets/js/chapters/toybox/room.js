/* The room: look B's painted tea room at night, and a camera measured to match it.
   The painting is one-point perspective, so a floor, a back wall and two side walls can be laid exactly under
   it: the toys then stand on the painted mats, are lit from where the painted lamp is, and stop at the painted
   walls. The scroll's camera never leaves the painter's viewpoint; it only looks at a smaller part of the
   painting (a view offset), which is the same glide-and-zoom look B does with its flats. */

const W = 2752, H = 1536;          // the painting, in its own pixels
const VX = 1398, VY = 690;         // where its floor lines meet (measured)
const F = 1216;                    // its focal length, in the same pixels (from the 2:1 mats)
const HC = 0.8;                    // the painter's eye above the floor, in metres (sets the scale of everything)
const D = HC * F / (1005 - VY);    // the back wall: its foot is at y = 1005 in the painting
const XL = (645 - VX) / F * D;     // the left wall's corner is at x = 645
const XR = (2100 - VX) / F * D;    // the paper screens' corner is at x = 2100
const CEIL = HC + (VY - 190) / F * D;
const FW = 2 * Math.max(VX, W - VX), FH = 2 * Math.max(VY, H - VY);   // a frame with the meeting point in its middle

export const PAINT = {
  W, H, VX, VY, F, HC, D, XL, XR, CEIL, FW, FH, OX: FW / 2 - VX, OY: FH / 2 - VY,
  fov: 2 * Math.atan(FH / 2 / F) * 180 / Math.PI,
  LAMP: { x: (1940 - VX) / F * (HC * F / (1050 - VY)), y: 0.36, z: -(HC * F / (1050 - VY)) },
};

/* a point in the room -> a pixel of the painting */
export function toPaint(x, y, z, out) {
  const d = -z;
  out[0] = VX + F * x / d; out[1] = VY - F * (y - HC) / d;
  return out;
}
/* a pixel of the painting -> the ray from the painter's eye through it */
export function rayAt(px, py, ray) {
  const dx = (px - VX) / F, dy = -(py - VY) / F, l = Math.hypot(dx, dy, 1);
  ray.ox = 0; ray.oy = HC; ray.oz = 0; ray.dx = dx / l; ray.dy = dy / l; ray.dz = -1 / l;
  return ray;
}

export function makeRoom(THREE, scene, renderer, opt) {
  // the painting, far behind everything, filling exactly the painter's frame
  const DB = 40;
  const geo = new THREE.BufferGeometry();
  const x0 = (0 - VX) / F * DB, x1 = (W - VX) / F * DB, y0 = HC + (VY - H) / F * DB, y1 = HC + VY / F * DB;
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([x0, y0, -DB, x1, y0, -DB, x1, y1, -DB, x0, y1, -DB]), 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]), 2));
  geo.setIndex([0, 1, 2, 0, 2, 3]);
  const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, depthTest: false, depthWrite: false, toneMapped: false });
  const plate = new THREE.Mesh(geo, mat); plate.renderOrder = -10; plate.frustumCulled = false;
  scene.add(plate);
  const ready = new Promise((res) => {
    new THREE.TextureLoader().load(opt.img, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4; tex.generateMipmaps = true;
      mat.map = tex; mat.needsUpdate = true; res(true);
    }, undefined, () => res(false));
  });
  // (in the long page the camera also sees the room from the doorway, wider than the painting: look B lays its
  // room-back.webp round the painting there, 1.7 times as wide and 2.4 times as tall, centred on it. So here.)
  if (opt.back) {
    const bx0 = (W / 2 - W * 0.85 - VX) / F * DB, bx1 = (W / 2 + W * 0.85 - VX) / F * DB;
    const by0 = HC + (VY - (H / 2 + H * 1.2)) / F * DB, by1 = HC + (VY - (H / 2 - H * 1.2)) / F * DB;
    const bg = new THREE.BufferGeometry();
    bg.setAttribute('position', new THREE.BufferAttribute(new Float32Array([bx0, by0, -DB, bx1, by0, -DB, bx1, by1, -DB, bx0, by1, -DB]), 3));
    bg.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]), 2));
    bg.setIndex([0, 1, 2, 0, 2, 3]);
    const bm = new THREE.MeshBasicMaterial({ color: 0x241a2c, depthTest: false, depthWrite: false, toneMapped: false });
    const back = new THREE.Mesh(bg, bm); back.renderOrder = -11; back.frustumCulled = false; scene.add(back);
    new THREE.TextureLoader().load(opt.back, (tex) => { tex.colorSpace = THREE.SRGBColorSpace; bm.map = tex; bm.color.set(0xffffff); bm.needsUpdate = true; if (opt.onBack) opt.onBack(); });
  }

  // the light of this evening: the paper lamp in the corner, the night through the screens, and a soft key from
  // the reader's side so the toys are the lit thing in the room
  const hemi = new THREE.HemisphereLight(0xa3a0e6, 0x5a3a40, 1.5);
  scene.add(hemi);
  const lamp = new THREE.PointLight(0xffb060, 11, 7, 1.6);
  lamp.position.set(PAINT.LAMP.x, 0.36, PAINT.LAMP.z + 0.05);
  scene.add(lamp);
  const key = new THREE.DirectionalLight(0xfff0e0, 2.5);
  key.position.set(-1.2, 2.4, 2.6); scene.add(key);
  const moon = new THREE.DirectionalLight(0x8f9cff, 1.3);
  moon.position.set(3, 1.6, -0.6); scene.add(moon);
  // from behind and above, so every head and shoulder has a pale edge against the dark wall
  const back = new THREE.DirectionalLight(0xc9d0ff, 1.6);
  back.position.set(-0.6, 2.2, -3.2); scene.add(back);

  // what shiny things reflect: a small made-up room in the same colours
  const env = new THREE.Scene();
  const sky = new THREE.Mesh(new THREE.SphereGeometry(10, 24, 12), new THREE.ShaderMaterial({
    side: THREE.BackSide,
    vertexShader: 'varying vec3 p; void main(){ p = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'varying vec3 p; void main(){ float h = normalize(p).y; vec3 c = mix(vec3(0.34,0.22,0.26), vec3(0.20,0.17,0.34), smoothstep(-0.3, 0.5, h)); gl_FragColor = vec4(c * 1.25, 1.0); }',
  }));
  env.add(sky);
  const panel = (c, i, x, y, z, s) => { const m = new THREE.Mesh(new THREE.SphereGeometry(s, 12, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(i) })); m.position.set(x, y, z); env.add(m); };
  panel(0xffb46a, 7, 5, 0, -6, 2.2);      // the lamp
  panel(0x7a86ff, 2.4, 8, 3, 1, 3.5);     // the screens
  panel(0xfff0dc, 3.2, -5, 6, 6, 3.2);    // the key
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(env, 0.03).texture;
  pm.dispose();

  if (opt.debug) {
    // the measured room, drawn over the painting to check the measuring
    const pts = [];
    const L = (a, b) => pts.push(...a, ...b);
    const zf = -1.2, zb = -D;
    for (const x of [XL, XR]) { L([x, 0, zf], [x, 0, zb]); L([x, CEIL, zf], [x, CEIL, zb]); L([x, 0, zb], [x, CEIL, zb]); }
    L([XL, 0, zb], [XR, 0, zb]); L([XL, CEIL, zb], [XR, CEIL, zb]);
    for (let z = -1.25; z > zb; z -= 0.25) L([XL, 0, z], [XR, 0, z]);
    for (let x = Math.ceil(XL * 4) / 4; x < XR; x += 0.25) L([x, 0, zf], [x, 0, zb]);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts), 3));
    const lines = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0x33ffcc, transparent: true, opacity: 0.6, depthTest: false }));
    lines.renderOrder = 50; scene.add(lines);
    const lampMark = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.55, 0.3), new THREE.MeshBasicMaterial({ color: 0xff33aa, wireframe: true }));
    lampMark.position.set(PAINT.LAMP.x, 0.275, PAINT.LAMP.z); scene.add(lampMark);
  }
  return { ready, lamp, key, hemi };
}
