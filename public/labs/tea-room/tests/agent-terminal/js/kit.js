// Small tools shared by every part of the terminal world.
import * as THREE from 'three';

export const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
export const lerp = (a, b, t) => a + (b - a) * t;
export const ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
export const io = (t) => { t = clamp(t); return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };
// time held to twelve steps a second, as hand-moved things are
export const twelve = (t) => Math.floor(t * 12) / 12;
// a number from 0 to 1 that is always the same for the same n
export const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
export function rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// The world's few colours: the terminal's night, its paper and ink, the cursor's amber.
export const PAL = {
  night: 0x07080b, plane: 0x141518, ink: 0xe9e4da, amber: 0xffc870, ember: 0xff9a4a,
  paper: 0x262832, cream: 0xefe6d4, blue: 0x4a5fa8, chalk: 0xf4f6ff, cold: 0x8fb4ff,
  felt: 0x34343f, desk: 0x5a4632, clay: 0x46506a, cap: 0x232a3d,
};
export const FOG = 0.021;

export function canvasTex(w, h, draw, opts = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d');
  draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = opts.aniso || 8;
  if (opts.nearest) { t.magFilter = THREE.NearestFilter; }
  t.userData.redraw = () => { g.clearRect(0, 0, w, h); draw(g, w, h); t.needsUpdate = true; };
  return t;
}

// a soft round light, painted once: the glow of a lamp, a fire, the cursor
let glowTex = null;
export function glow() {
  if (!glowTex) {
    glowTex = canvasTex(128, 128, (g) => {
      const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.18, 'rgba(255,255,255,0.55)');
      r.addColorStop(0.45, 'rgba(255,255,255,0.16)'); r.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = r; g.fillRect(0, 0, 128, 128);
    });
  }
  return glowTex;
}
export function glowSprite(color, size, opacity = 1) {
  const m = new THREE.SpriteMaterial({ map: glow(), color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, fog: true });
  const s = new THREE.Sprite(m); s.scale.set(size, size, 1); s.renderOrder = 5;
  return s;
}

export function box(w, h, d, mat) { return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); }
export function lit(color, extra = {}) { return new THREE.MeshLambertMaterial({ color, ...extra }); }
export function flat(color, extra = {}) { return new THREE.MeshBasicMaterial({ color, ...extra }); }

// a thing lying flat on the glass, facing up
export function decal(w, d, mat) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat);
  m.rotation.x = -Math.PI / 2; m.position.y = 0.004;
  return m;
}

// values along the scroll: keys are [q, value...]; in between, a smooth curve through them
export function track(keys) {
  const n = keys.length, dim = keys[0].length - 1;
  const m = keys.map((k, i) => {
    const a = keys[Math.max(0, i - 1)], b = keys[Math.min(n - 1, i + 1)];
    const dq = b[0] - a[0] || 1;
    const out = new Array(dim);
    for (let d = 0; d < dim; d++) out[d] = 0.6 * (b[d + 1] - a[d + 1]) / dq;
    return out;
  });
  const out = new Array(dim);
  return (q) => {
    if (q <= keys[0][0]) { for (let d = 0; d < dim; d++) out[d] = keys[0][d + 1]; return out; }
    if (q >= keys[n - 1][0]) { for (let d = 0; d < dim; d++) out[d] = keys[n - 1][d + 1]; return out; }
    let i = 0; while (i < n - 2 && q > keys[i + 1][0]) i++;
    const k0 = keys[i], k1 = keys[i + 1], h = k1[0] - k0[0], t = (q - k0[0]) / h;
    const t2 = t * t, t3 = t2 * t;
    const h00 = 2 * t3 - 3 * t2 + 1, h10 = t3 - 2 * t2 + t, h01 = -2 * t3 + 3 * t2, h11 = t3 - t2;
    for (let d = 0; d < dim; d++) out[d] = h00 * k0[d + 1] + h10 * h * m[i][d] + h01 * k1[d + 1] + h11 * h * m[i + 1][d];
    return out;
  };
}
