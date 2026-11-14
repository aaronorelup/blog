/* THE GARDEN PATH, AS NUMBERS: where everything of the projects walk stands, for a given window. A pure function of
   the projects, the window's size and the rail (nothing from the page is read here), so the painted walk (scene.js)
   and the modelled twin of its first view (twin.js, drawn by the site chapter's camera as it comes down into the
   garden) are reckoned from the same numbers, and the twin lands exactly on the painting.

   The walk's own numbers (the tea room test tests/projects-walk/, its js/scene.js): metres more or less, the camera
   walking along +Z; a flat at (X, Y, Z) stands on the screen at x = cx + f (X - camX) / d, y = hY - f (Y - camY) / d,
   d = Z - camZ. Changed for the working copy: the frame keeps right of the rail on a wide screen (inset: the walk's
   middle cx is the middle of the part right of it, and nothing of a station stands under it), and a phone's windows
   start under its rail pill (top). */

export const DZ = 7, GAP = 4.5, EYE = 1.6, LH = 1.3;         // LH: the lantern's height
export const K0 = -1.35, KEND_PAD = 1.75;                   // the walk in before the first lantern, and on to the house after the last
export const TREE = { w: 1180, h: 1271, ax: 0.30, ay: 0.967 };
export const HOUSE = { w: 2816, h: 1297, lawn: 462, door: 1408, hw: 17 };
export const BUSH = { w: 550, h: 250 };
export const FAR = 34;

const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
const lerp = (a, b, t) => a + (b - a) * t;
export const ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
export const rnd = (seed) => { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };

// What does not depend on the window: the stations, the trees and bushes (before they are set beside the path),
// the stones, the petals, the fireflies.
export function garden(items, shelves) {
  const N = items.length;
  const shelfOf = (it) => shelves.findIndex((s) => s.key === it.shelf);
  const S = items.map((it, i) => {
    const sh = shelfOf(it);
    const inShelf = items.filter((o) => o.shelf === it.shelf);
    return { it, i, sh, side: sh % 2 ? -1 : 1, nth: inShelf.indexOf(it) + 1, of: inShelf.length, Z: i * DZ + sh * GAP };
  });
  const zs = (k) => {
    if (k <= 0) return S[0].Z + k * DZ;
    if (k >= N - 1) return S[N - 1].Z + (k - N + 1) * DZ;
    const i = Math.floor(k), t = k - i; return lerp(S[i].Z, S[i + 1].Z, t);
  };
  const KEND = N - 1 + KEND_PAD;
  const zHouse = zs(KEND) + 16;
  const TR = rnd(20261113);
  const trees = [];
  for (let z = -14; z < zHouse + 6; z += 3.1) {
    for (const side of [-1, 1]) {
      trees.push({ row: 0, side, xr: TR(), Z: z + TR() * 1.8, h: 5.4 + TR() * 1.8, pink: TR() < 0.42, flip: TR() < 0.5 });
      trees.push({ row: 1, side, xr: TR(), Z: z + 1.4 + TR() * 1.8, h: 6 + TR() * 2.4, pink: TR() < 0.3, flip: TR() < 0.5 });
    }
  }
  trees.sort((a, b) => a.Z - b.Z);
  const bushes = [];
  for (let z = -6, j = 0; z < zHouse; z += 2.4 + TR() * 1.6, j++) {
    const side = j % 2 ? 1 : -1;
    bushes.push({ side, Z: z, xr: TR(), wr: 0.8 + TR() * 0.5 });
  }
  const petals = (function () { const R = rnd(31), a = []; for (let i = 0; i < 700; i++) a.push({ X: (R() - 0.5) * 16, Z: -12 + R() * (zHouse + 14), r: 0.035 + R() * 0.03, t: R() * 3.1, c: R() }); a.sort((p, q) => p.Z - q.Z); return a; })();
  const stones = (function () { const R = rnd(9), a = []; for (let z = -12; z < zHouse - 1; z += 1.05 + R() * 0.2) a.push({ Z: z, j: (R() - 0.5) * 0.16, s: 0.9 + R() * 0.25, t: (R() - 0.5) * 0.3 }); return a; })();
  const flies = (function () { const R = rnd(5), a = []; for (let i = 0; i < 46; i++) a.push({ X: (R() - 0.5) * 9, Y: 0.25 + R() * 2.8, Z: R() * 16, w: 0.3 + R() * 0.5, ph: R() * 6.28, r: 0.6 + R() * 0.7 }); return a; })();
  return { items, N, S, zs, KEND, zHouse, trees, bushes, petals, stones, flies };
}

// The window: W, H, IN (the rail's right edge on a wide screen, else 0), top (a phone's rail pill's foot, else 0).
// Fills L (one per window) and sets every tree's and bush's X and whether it is planted.
export function layout(G, W, H, IN, top) {
  const { S, N } = G;
  const tall = W / H < 0.9;
  const L = { W, H, IN: tall ? 0 : IN || 0, top: top || 0, tall, f: 1, cx: W / 2, hY: 0, DV: 5, WB: 2, pad: 14, cardW: 400, st: [], pathPts: [] };
  if (tall) { L.f = 1.15 * W; L.hY = 0.63 * H; L.WB = 5; } else { L.f = 1.22 * H; L.hY = 0.46 * H; L.WB = 2.2; }
  const footY = tall ? 0.955 * H : 0.9 * H;
  L.DV = L.f * EYE / (footY - L.hY);
  const x0L = L.IN, Wr = W - x0L;                            // the part of the window right of the rail
  L.cx = x0L + Wr / 2;
  L.pad = tall ? 14 : Math.max(24, 0.035 * Wr);
  L.cardW = tall ? W - 2 * L.pad : Math.min(440, 0.32 * Wr);
  const camAt = (k) => camAtL(G, L, k);
  for (const s of S) {
    const it = s.it, side = s.side, a = it.pic.w / it.pic.h, pad = L.pad;
    let w, x0, y0;
    if (tall) {
      w = W - 2 * pad; if (it.pic.w < 900) w = Math.min(w, it.pic.w); y0 = Math.max(10, 0.045 * H, (top || 0) + 16);
      x0 = (W - w) / 2;
    } else {
      const kind = it.run === 'frame' ? 'play' : it.run === 'film' ? 'watch' : it.shelf;
      const room = kind === 'watch' ? 0.56 : kind === 'play' ? 0.54 : 0.46;
      w = Math.min(room * Wr, (0.5 * H) * a);
      if (it.pic.w < 900) w = Math.min(w, it.pic.w);
      y0 = 0.085 * H;
      x0 = side > 0 ? W - pad - w - 0.02 * Wr : x0L + pad + 0.02 * Wr;
    }
    const h = w / a;
    const frameT = tall ? 7 : 11;
    const cam = camAt(s.i), d = L.DV + L.WB;
    const o = { rect: { x: x0, y: y0, w, h }, ft: frameT, bw: w + 2 * frameT, bh: h + 2 * frameT, d0: d, wZ: s.Z + L.WB };
    o.wX = cam.x + ((x0 - frameT) - L.cx) * d / L.f;
    o.wY = cam.y + (L.hY - (y0 - frameT)) * d / L.f;
    o.ww = o.bw * d / L.f; o.wh = o.bh * d / L.f;
    o.legLen = Math.max(0, (o.wY - o.wh)) * L.f / d;
    const lx = tall ? L.cx + side * 0.25 * W : (side > 0 ? x0 - 0.045 * Wr : x0 + w + 0.045 * Wr);
    o.lX = cam.x + (lx - L.cx) * L.DV / L.f; o.lZ = s.Z;
    if (tall) o.cardAt = { x: pad, y: y0 + h + 2 * frameT + 12 };
    else o.cardAt = { x: side > 0 ? x0 + w + frameT - L.cardW : x0 - frameT, y: y0 + h + 2 * frameT + 0.03 * H };
    L.st.push(o);
  }
  L.endW = tall ? W - 2 * L.pad : Math.min(460, 0.36 * Wr);
  const P = L.pathPts;
  P.push([G.zs(-3), 0]);
  for (const s of S) P.push([L.st[s.i].lZ, L.st[s.i].lX - s.side * 0.85]);
  P.push([G.zs(G.KEND) + 2, 0]); P.push([G.zHouse - 1, 0]);
  const pathAt = (z) => pathAtL(L, z);
  for (const t of G.trees) {
    const base = t.row === 0 ? (tall ? 2.3 : 3.2) + t.xr * 1.2 : (tall ? 4.5 : 6) + t.xr * 6;
    t.X = pathAt(t.Z) + t.side * base;
    t.off = t.Z > G.zHouse - 3.5 - (t.row ? 0 : 6) && Math.abs(t.X) < (t.row ? 9 : 12);
  }
  // a tree that would stand between the eye and a window, or in front of the card, is not planted
  for (const t of G.trees) {
    if (t.off) continue;
    for (const s of S) {
      const o = L.st[s.i], cam = camAt(s.i), d = t.Z - cam.z; if (d < 0.6 || t.Z > o.wZ + 0.5) continue;
      const sc = L.f / d, hpx = t.h * sc, wpx = hpx * TREE.w / TREE.h, sx = L.cx + (t.X - cam.x) * sc;
      const left = sx - TREE.ax * wpx, right = left + wpx, topY = L.hY + EYE * sc - TREE.ay * hpx;
      const r = o.rect;
      if (right > r.x - 20 && left < r.x + r.w + 20 && topY < r.y + r.h + 0.35 * H) { t.off = true; break; }
    }
  }
  for (const b of G.bushes) { b.X = pathAt(b.Z) + b.side * ((tall ? 1.15 : 1.9) + b.xr * 0.6); b.w = (tall ? 1.3 : 2.1) * b.wr; }
  L.camAt = camAt; L.pathAt = pathAt;
  L.kOf = (q) => K0 + (G.KEND - K0) * clamp(q);
  L.qOf = (i) => (clamp(i, 0, N - 1) - K0) / (G.KEND - K0);
  return L;
}

function pathAtL(L, z) {
  const a = L.pathPts; if (!a.length) return 0;
  if (z <= a[0][0]) return a[0][1];
  for (let i = 1; i < a.length; i++) if (z <= a[i][0]) { const t = (z - a[i - 1][0]) / (a[i][0] - a[i - 1][0]); const e = t * t * (3 - 2 * t); return lerp(a[i - 1][1], a[i][1], e); }
  return a[a.length - 1][1];
}

// the camera at walk position k (a station's index; K0 before the first, KEND at the house)
function camAtL(G, L, k) {
  const { S, N } = G;
  const camX0 = (i) => -S[i].side * (L.tall ? 0.12 : 0.32);       // the camera keeps to the side away from the build
  const ease = (t) => t - 0.86 * Math.sin(2 * Math.PI * t) / (2 * Math.PI);   // slow by a lantern, quicker between
  let z, x;
  if (k <= 0) { const t = k + 1; z = S[0].Z - DZ + DZ * (t >= 0 ? ease(t) : t); x = lerp(camX0(0), 0, ss(0, -1.3, k)); }
  else if (k >= N - 1) { const t = k - (N - 1); z = G.zs(N - 1) + DZ * (t < 1 ? ease(t) : t); x = lerp(camX0(N - 1), 0, ss(0, 1.2, t)); }
  else { const i = Math.floor(k), t = ease(k - i); z = lerp(S[i].Z, S[i + 1].Z, t); x = lerp(camX0(i), camX0(i + 1), t); }
  return { x, y: EYE, z: z - L.DV };
}

// The walk's first view as a pinhole, for the modelled garden (twin.js and site.js): where the painted camera stands
// at q = 0, its lens (vertical field of view, degrees) and the shift of its middle (cx, hY) from the window's middle.
export function firstView(G, L) {
  const c = L.camAt(K0);
  return { x: c.x, y: c.y, z: c.z, fov: 2 * Math.atan(L.H / 2 / L.f) * 180 / Math.PI, dx: L.cx - L.W / 2, dy: L.hY - L.H / 2 };
}
