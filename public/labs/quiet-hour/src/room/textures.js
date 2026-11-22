// Procedural textures for the room, drawn ONCE at load into canvases from fixed seeds (room-set).
//
// Every texture is a pure function of its seed: per-pixel noise comes from a lattice of hash01 values
// (src/rng.js), shapes from canvas 2D calls with hashed parameters. Nothing here runs per frame and
// nothing reads a clock or Math.random. Tileable textures wrap their noise lattice.

import { hash01 } from '../rng.js';

const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const smooth = (t) => t * t * (3 - 2 * t);

/** A tileable value-noise field: lattice of hash01(seed, i, j) with period (px, py) cells. */
function lattice(seed, px, py) {
  const g = new Float32Array(px * py);
  for (let j = 0; j < py; j++) for (let i = 0; i < px; i++) g[j * px + i] = hash01(seed, i, j, 0);
  return (x, y) => {                          // x, y in cells (any real), wraps
    const xi = Math.floor(x), yi = Math.floor(y), fx = smooth(x - xi), fy = smooth(y - yi);
    const i0 = ((xi % px) + px) % px, j0 = ((yi % py) + py) % py, i1 = (i0 + 1) % px, j1 = (j0 + 1) % py;
    const a = g[j0 * px + i0], b = g[j0 * px + i1], c = g[j1 * px + i0], d = g[j1 * px + i1];
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
  };
}
/** fBm of a few tileable lattices: frequencies are integer multiples so the result still tiles. */
function fbm(seed, w, h, baseCells, octaves = 4) {
  const ls = [];
  for (let o = 0; o < octaves; o++) { const c = baseCells * (1 << o); ls.push([lattice(seed + o * 7, c, c), c, 1 / (1 << o)]); }
  let norm = 0; for (const l of ls) norm += l[2];
  return (x, y) => {                          // x, y in pixels
    let s = 0;
    for (const [f, c, a] of ls) s += f((x / w) * c, (y / h) * c) * a;
    return s / norm;
  };
}

function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function pixels(c, fn) {                       // fn(x, y) -> [r, g, b] 0..255
  const ctx = c.getContext('2d'), img = ctx.createImageData(c.width, c.height), d = img.data;
  for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
    const p = fn(x, y), k = (y * c.width + x) * 4;
    d[k] = clamp(p[0], 0, 255); d[k + 1] = clamp(p[1], 0, 255); d[k + 2] = clamp(p[2], 0, 255); d[k + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return c;
}
const rgb = (hex) => [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255];
const lerpC = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

// ---- floor: oak boards, 1 texture = 1.2 m square, boards 0.1 m wide, staggered ends ------------------
export function woodFloor(seed = 4101, size = 1024) {
  const c = canvas(size, size), boards = 12, bw = size / boards;
  const grain = lattice(seed, 8, 96), fine = lattice(seed + 1, 64, 512), knot = lattice(seed + 2, 16, 16);
  const dark = rgb(0x3a2a1e), light = rgb(0x6e5440);
  return pixels(c, (x, y) => {
    const b = Math.floor(x / bw), u = (x - b * bw) / bw;
    const len = 0.55 + hash01(seed, b, 1, 0) * 0.45, off = hash01(seed, b, 2, 0);   // board length (of the tile), offset
    const yy = (y / size + off) % 1, seg = Math.floor(yy / len * 1.0001), v = (yy - seg * len) / len;
    const tone = hash01(seed, b, 3, seg) * 0.55 + 0.2;
    const g = grain(b * 0.7 + u * 0.9 + 3 * seg, (y / size) * 96 * 0.35) * 0.65 + fine(x / size * 64, y / size * 512) * 0.35;
    const ring = 0.5 + 0.5 * Math.sin((g * 9 + u * 2.2) * Math.PI);
    let col = lerpC(dark, light, clamp(tone + (ring - 0.5) * 0.28 + (knot(x / size * 16, y / size * 16) - 0.5) * 0.2, 0, 1));
    const edge = Math.min(u, 1 - u) * bw, endD = Math.min(v, 1 - v) * len * size;      // seams
    const seam = Math.min(clamp(edge / 1.6, 0, 1), clamp(endD / 1.4, 0, 1));
    const m = 0.45 + 0.55 * seam;
    return [col[0] * m, col[1] * m, col[2] * m];
  });
}

// ---- walls: slate-blue paint over a faint regency stripe; 1 texture = 1 m square ---------------------
export function wallPaper(seed = 4201, size = 512) {
  const c = canvas(size, size), mott = fbm(seed, size, size, 4, 4), tooth = lattice(seed + 9, 128, 128);
  const base = rgb(0x4f6177), stripe = rgb(0x546780);
  return pixels(c, (x, y) => {
    const u = (x / size) * 8 % 1;                                   // 8 stripes a metre (12.5 cm)
    const s = smooth(clamp((Math.abs(u - 0.5) - 0.18) / 0.06, 0, 1)); // a broad stripe and a fine line
    const fineLine = Math.abs(u - 0.06) < 0.012 ? 1 : 0;
    let col = lerpC(stripe, base, s);
    col = lerpC(col, rgb(0x5f738c), fineLine * 0.3);
    const n = (mott(x, y) - 0.5) * 0.14 + (tooth(x / size * 128, y / size * 128) - 0.5) * 0.05;
    return [col[0] * (1 + n), col[1] * (1 + n), col[2] * (1 + n)];
  });
}

// ---- rug: a worn Turkish-style rug in teal, ochre and cream (no red); covers the whole rug -----------
export function rug(seed = 4301, w = 1024, h = 704) {
  const c = canvas(w, h), ctx = c.getContext('2d');
  const field = '#24423f', border = '#8a6c3a', cream = '#cbbd98', navy = '#1d2b3a', sage = '#5d7458';
  ctx.fillStyle = field; ctx.fillRect(0, 0, w, h);
  const B = 70;
  // borders
  ctx.fillStyle = border; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = navy; ctx.fillRect(14, 14, w - 28, h - 28);
  ctx.fillStyle = border; ctx.fillRect(B - 8, B - 8, w - 2 * B + 16, h - 2 * B + 16);
  ctx.fillStyle = field; ctx.fillRect(B, B, w - 2 * B, h - 2 * B);
  // a running pattern of small diamonds in the navy border
  ctx.fillStyle = cream;
  const diamond = (x, y, r) => { ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x + r, y); ctx.lineTo(x, y + r); ctx.lineTo(x - r, y); ctx.closePath(); ctx.fill(); };
  for (let x = 40; x < w - 30; x += 34) { diamond(x, 36, 9); diamond(x, h - 36, 9); }
  for (let y = 74; y < h - 60; y += 34) { diamond(36, y, 9); diamond(w - 36, y, 9); }
  ctx.fillStyle = sage;
  for (let x = 57; x < w - 30; x += 34) { diamond(x, 36, 4); diamond(x, h - 36, 4); }
  // the field: a lattice of stepped medallions, and one big central medallion
  const cx = w / 2, cy = h / 2;
  for (let j = 0; j < 5; j++) for (let i = 0; i < 9; i++) {
    const x = B + 50 + i * ((w - 2 * B - 100) / 8), y = B + 45 + j * ((h - 2 * B - 90) / 4);
    if (Math.hypot((x - cx) / 1.4, y - cy) < 150) continue;
    ctx.fillStyle = (i + j) % 2 ? sage : border; diamond(x, y, 16);
    ctx.fillStyle = navy; diamond(x, y, 7);
  }
  const med = [[150, border], [128, navy], [112, cream], [96, sage], [70, field], [44, border], [20, cream]];
  for (const [r, col] of med) {
    ctx.fillStyle = col; ctx.beginPath();
    for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2, rr = r * (k % 2 ? 0.82 : 1); ctx.lineTo(cx + Math.cos(a) * rr * 1.45, cy + Math.sin(a) * rr); }
    ctx.closePath(); ctx.fill();
  }
  // wear and pile: modulate every pixel by noise, a few worn patches near the middle (where feet go)
  const img = ctx.getImageData(0, 0, w, h), d = img.data, pile = lattice(seed, 256, 176), wear = fbm(seed + 3, w, h, 3, 3);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const k = (y * w + x) * 4, n = pile(x / 4, y / 4);
    const wr = smooth(clamp((wear(x, y) - 0.55) / 0.2, 0, 1)) * 0.35;
    for (let ch = 0; ch < 3; ch++) d[k + ch] = clamp(d[k + ch] * (0.86 + 0.22 * n) * (1 - wr * 0.25) + wr * 18, 0, 255);
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

// ---- knit: cream wool, stocking stitch columns with a cable every few columns; tileable --------------
export function knit(seed = 4401, size = 256) {
  const c = canvas(size, size), fuzz = lattice(seed, 64, 64), base = rgb(0xe3d8bf);
  const cols = 16, rows = 22;
  return pixels(c, (x, y) => {
    const u = x / size * cols, v = y / size * rows, ci = Math.floor(u), fu = u - ci;
    let fv = (v + (ci % 4 === 1 ? 0.5 : 0)) % 1;
    // each stitch is a V: two slanted lobes
    const lobe = fu < 0.5 ? fu * 2 : (1 - fu) * 2;
    const vy = (fv + lobe * 0.35) % 1;
    let h = Math.sin(vy * Math.PI) * (0.55 + 0.45 * Math.sin(lobe * Math.PI));
    if (ci % 8 >= 6) {                                  // a twisted cable band
      const t = (v / 3 + (fu - 0.5) * 0.4 * Math.sin(v / 3 * Math.PI * 2)) % 1;
      h = 0.4 + 0.6 * Math.sin(((t * 3) % 1) * Math.PI);
    }
    const groove = Math.abs(fu - 0.5) > 0.46 ? 0.6 : 1;
    const m = (0.55 + 0.45 * h) * groove * (0.9 + 0.2 * fuzz(x / 4, y / 4));
    return [base[0] * m, base[1] * m, base[2] * m];
  });
}

// ---- upholstery: a worn moss-olive velvet, tileable ------------------------------------------------
export function velvet(seed = 4501, size = 256) {
  const c = canvas(size, size), n1 = fbm(seed, size, size, 4, 3), n2 = lattice(seed + 5, 128, 128);
  const a = rgb(0x3a3a2c), b = rgb(0x4e4c3a);
  return pixels(c, (x, y) => {
    const t = clamp(n1(x, y) * 1.2 - 0.1 + (n2(x / 2, y / 2) - 0.5) * 0.25, 0, 1);
    return lerpC(a, b, t);
  });
}

// ---- curtain: faded mustard linen with a slub weave, tileable --------------------------------------
export function linen(seed = 4601, size = 256) {
  const c = canvas(size, size), slub = lattice(seed, 8, 128), weave = lattice(seed + 1, 128, 128);
  const base = rgb(0xa49c7c);
  return pixels(c, (x, y) => {
    const m = 0.85 + 0.18 * slub(x / size * 8, y / size * 128) + 0.08 * (weave(x / 2, y / 2) - 0.5) + ((x + y) % 2) * 0.03;
    return [base[0] * m, base[1] * m, base[2] * m];
  });
}

// ---- walnut: figured walnut veneer for the cabinet, tileable along u ------------------------------
export function walnut(seed = 4701, w = 512, h = 256) {
  const c = canvas(w, h), g = lattice(seed, 4, 32), f = lattice(seed + 1, 32, 256);
  const dark = rgb(0x2a1a10), light = rgb(0x5e3e26);
  return pixels(c, (x, y) => {
    const t = g(x / w * 4, y / h * 32 * 0.25) * 6 + (y / h) * 3;
    const ring = 0.5 + 0.5 * Math.sin(t * Math.PI * 2 + f(x / w * 32, y / h * 256) * 1.5);
    return lerpC(dark, light, clamp(0.25 + ring * 0.5 + (f(x / w * 32, y / h * 64) - 0.5) * 0.2, 0, 1));
  });
}

// ---- the wall clock's face: cream, bar markers, a thin black ring (no lettering) --------------------
export function clockFace(size = 256) {
  const c = canvas(size, size), ctx = c.getContext('2d'), r = size / 2;
  const g = ctx.createRadialGradient(r, r * 0.9, 0, r, r, r);
  g.addColorStop(0, '#efe7d2'); g.addColorStop(0.85, '#e2d7bd'); g.addColorStop(1, '#bfb291');
  ctx.fillStyle = g; ctx.fillRect(0, 0, size, size);
  ctx.translate(r, r);
  ctx.strokeStyle = '#2a2622'; ctx.lineWidth = size * 0.012;
  ctx.beginPath(); ctx.arc(0, 0, r * 0.93, 0, Math.PI * 2); ctx.stroke();
  for (let i = 0; i < 60; i++) {
    const a = i / 60 * Math.PI * 2, big = i % 5 === 0;
    ctx.save(); ctx.rotate(a); ctx.fillStyle = '#25211c';
    if (big) ctx.fillRect(-size * 0.018, -r * 0.86, size * 0.036, r * (i % 15 === 0 ? 0.2 : 0.14));
    else ctx.fillRect(-size * 0.004, -r * 0.86, size * 0.008, r * 0.05);
    ctx.restore();
  }
  return c;
}

// ---- a framed print: a quiet coast at dusk, gouache flats -----------------------------------------
export function print(seed = 4801, w = 256, h = 320) {
  const c = canvas(w, h), ctx = c.getContext('2d');
  ctx.fillStyle = '#e6dcc4'; ctx.fillRect(0, 0, w, h);                     // the mount
  const m = 30, iw = w - 2 * m, ih = h - 2 * m - 10;
  ctx.save(); ctx.beginPath(); ctx.rect(m, m, iw, ih); ctx.clip();
  const sky = ctx.createLinearGradient(0, m, 0, m + ih * 0.6);
  sky.addColorStop(0, '#3e5670'); sky.addColorStop(1, '#c9b58a');
  ctx.fillStyle = sky; ctx.fillRect(m, m, iw, ih);
  ctx.fillStyle = '#d9c9a0'; ctx.beginPath(); ctx.arc(m + iw * 0.68, m + ih * 0.42, 16, 0, Math.PI * 2); ctx.fill();
  const hill = (y0, amp, col, s) => {
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(m, m + ih);
    for (let x = 0; x <= iw; x += 4) ctx.lineTo(m + x, m + y0 + amp * Math.sin(x / iw * 3 + s) + amp * 0.4 * Math.sin(x / iw * 9 + s * 2));
    ctx.lineTo(m + iw, m + ih); ctx.closePath(); ctx.fill();
  };
  hill(ih * 0.52, 10, '#5f6f78', 1 + hash01(seed, 1));
  ctx.fillStyle = '#7d8f97'; ctx.fillRect(m, m + ih * 0.6, iw, ih * 0.15);           // the sea
  hill(ih * 0.72, 14, '#3f4f44', 2 + hash01(seed, 2));
  hill(ih * 0.85, 8, '#2b352c', 3 + hash01(seed, 3));
  ctx.restore();
  return c;
}

// ---- a TV listings magazine cover: masthead block, a photo block, cover lines as bars ------------
export function magazine(seed = 4901, w = 192, h = 256) {
  const c = canvas(w, h), ctx = c.getContext('2d');
  ctx.fillStyle = '#e8e2d2'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#2f5f8a'; ctx.fillRect(0, 0, w, 50);                     // masthead (blue, no lettering)
  ctx.fillStyle = '#e8e2d2'; for (let i = 0; i < 6; i++) ctx.fillRect(12 + i * 24, 14, 16, 22);
  const g = ctx.createLinearGradient(0, 60, 0, 200); g.addColorStop(0, '#6c7a6a'); g.addColorStop(1, '#3a3f38');
  ctx.fillStyle = g; ctx.fillRect(10, 60, w - 20, 140);
  ctx.fillStyle = '#c7a878'; ctx.beginPath(); ctx.ellipse(w * 0.55, 120, 30, 38, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#2b2a28'; for (let i = 0; i < 4; i++) ctx.fillRect(12, 210 + i * 11, 60 + hash01(seed, i) * 100, 6);
  return c;
}

// ---- a soft round contact shadow (alpha in the red channel; used as alphaMap) ---------------------
export function blob(size = 128) {
  const c = canvas(size, size), ctx = c.getContext('2d'), r = size / 2;
  const g = ctx.createRadialGradient(r, r, 0, r, r, r);
  g.addColorStop(0, 'rgb(255,255,255)'); g.addColorStop(0.45, 'rgb(190,190,190)'); g.addColorStop(1, 'rgb(0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, size, size);
  return c;
}
/** A soft-edged rectangle (alphaMap) for contact shadows under boxy furniture. */
export function softRect(size = 128, edge = 0.3) {
  return pixels(canvas(size, size), (x, y) => {
    const u = Math.min(x, size - 1 - x) / size, v = Math.min(y, size - 1 - y) / size;
    const a = smooth(clamp(u / edge, 0, 1)) * smooth(clamp(v / edge, 0, 1));
    return [255 * a, 255 * a, 255 * a];
  });
}

// ---- night outside: sky, rooftops and chimneys across the street, a facade with dark windows --------
export function street(seed = 5001, w = 1024, h = 512) {
  const c = canvas(w, h), ctx = c.getContext('2d');
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#0b1424'); sky.addColorStop(0.55, '#17243a'); sky.addColorStop(1, '#1d2a3d');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
  // facade: dark brick terrace with a roofline and chimneys
  const roof = h * 0.3;
  ctx.fillStyle = '#0e1014';
  ctx.beginPath(); ctx.moveTo(0, h);
  for (let x = 0; x <= w; x += 8) ctx.lineTo(x, roof + Math.floor(x / 256) % 2 * 6);
  ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
  for (let i = 0; i < 5; i++) { const x = 60 + i * 220 + hash01(seed, i) * 40; ctx.fillRect(x, roof - 36, 26, 40); ctx.fillRect(x - 3, roof - 40, 32, 6); }
  // brick texture, very dark, and unlit windows (glass a touch bluer than the brick)
  const img = ctx.getImageData(0, 0, w, h), d = img.data, n = lattice(seed + 2, 128, 256);
  for (let y = Math.floor(roof) + 8; y < h; y++) for (let x = 0; x < w; x++) {
    const k = (y * w + x) * 4, row = Math.floor(y / 5), brick = Math.floor((x + (row % 2) * 6) / 12);
    const mortar = (y % 5 === 0 || (x + (row % 2) * 6) % 12 === 0) ? 0.75 : 1;
    const t = (hash01(seed, brick, row) * 0.3 + n(x / 8, y / 2) * 0.2 + 0.75) * mortar;
    d[k] = 15 * t; d[k + 1] = 15 * t; d[k + 2] = 19 * t;
  }
  ctx.putImageData(img, 0, 0);
  ctx.fillStyle = '#0a0d13';
  for (let j = 0; j < 2; j++) for (let i = 0; i < 8; i++) ctx.fillRect(40 + i * 128, roof + 50 + j * 120, 46, 64);
  return c;
}

/** The neighbour's lit window: warm #FFC870 behind a net curtain, with a soft halo (alpha). */
export function warmWindow(w = 128, h = 160) {
  const c = canvas(w, h), ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(w / 2, h * 0.55, 4, w / 2, h / 2, w * 0.62);
  g.addColorStop(0, 'rgba(255,214,150,1)'); g.addColorStop(0.55, 'rgba(255,200,112,1)'); g.addColorStop(1, 'rgba(214,150,70,1)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(70,40,20,0.85)';                                         // glazing bars
  ctx.fillRect(w / 2 - 3, 0, 6, h); ctx.fillRect(0, h * 0.5 - 3, w, 6);
  ctx.fillStyle = 'rgba(110,70,35,0.55)';                                        // a lampshade's silhouette low left
  ctx.beginPath(); ctx.moveTo(14, h); ctx.lineTo(22, h * 0.72); ctx.lineTo(44, h * 0.72); ctx.lineTo(52, h); ctx.fill();
  ctx.strokeStyle = 'rgba(60,30,15,1)'; ctx.lineWidth = 8; ctx.strokeRect(0, 0, w, h);
  return c;
}
export function glow(size = 128) {
  const c = canvas(size, size), ctx = c.getContext('2d'), r = size / 2;
  const g = ctx.createRadialGradient(r, r, 0, r, r, r);
  g.addColorStop(0, 'rgba(255,190,110,0.4)'); g.addColorStop(0.3, 'rgba(255,170,90,0.12)'); g.addColorStop(1, 'rgba(255,160,80,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, size, size);
  return c;
}
/** Moonlight spill on the floor: the window's four panes, very soft (alpha in red). */
export function moonSpill(w = 256, h = 256) {
  return pixels(canvas(w, h), (x, y) => {
    const u = x / w, v = y / h;
    const box = smooth(clamp(Math.min(u, 1 - u) / 0.18, 0, 1)) * smooth(clamp(Math.min(v, 1 - v) / 0.25, 0, 1));
    const bars = (Math.abs(u - 0.5) < 0.025 || Math.abs(v - 0.5) < 0.03) ? 0.45 : 1;
    const a = box * bars * (1 - v * 0.55) * 255;
    return [a, a, a];
  });
}
