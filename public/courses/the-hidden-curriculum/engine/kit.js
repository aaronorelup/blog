/* The Hidden Curriculum — kit.js
   The drawing toolkit every lesson shares. Canvas 1920x1080.
   Contract: everything draws from time alone. No Date.now(), no Math.random(),
   no state carried between frames — frame N must look identical every time it is drawn,
   because the MP4 renderer seeks frames out of order across several browsers. */
(function () {
  'use strict';
  const W = 1920, H = 1080;

  // Tea House night palette (aaron-brand). Pink is decoration only, never text.
  const C = {
    page: '#101220', panel: '#15172A', tile: '#201F2C', hover: '#222130', code: '#191A28',
    head: '#F0C06A', strong: '#F2E7D5', body: '#C9BCA9', soft: '#9C917F', quiet: '#8E8375',
    line: '#302E3E', line2: '#4A445A', accent: '#E2795C', gold: '#C9A227',
    blossom: '#F7C9D4', blossomDeep: '#F0A6B8', ink: '#3A3A42', paper: '#F2E7D5', paperShade: '#DCCFB9',
  };
  const F = {
    head: '"Zen Maru Gothic", Karla, sans-serif',
    ui: 'Karla, "Segoe UI", sans-serif',
    read: 'Georgia, "Times New Roman", serif',
    mono: '"JetBrains Mono", Consolas, monospace',
  };

  let g = null;
  const K = { W, H, C, F, img: {} };
  K.use = (ctx) => (g = ctx);
  K.ctx = () => g;

  // ---------- time & easing ----------
  K.clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  K.lerp = (a, b, k) => a + (b - a) * k;
  // non-finite or zero-width spans (K.io(t, Infinity) as "never", d = 0) give 0 before b and 1 from b, never NaN
  // (a NaN alpha is silently ignored by canvas, so the thing would show at full opacity)
  K.seg = (t, a, b) => { const v = (t - a) / (b - a); return Number.isNaN(v) ? (t >= b ? 1 : 0) : K.clamp(v); };
  K.ease = {
    lin: (x) => x,
    io: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
    out: (x) => 1 - Math.pow(1 - x, 3),
    in: (x) => x * x * x,
    sine: (x) => -(Math.cos(Math.PI * x) - 1) / 2,
    // the one playful overshoot the brand allows — use sparingly
    back: (x) => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
  };
  /** eased 0..1 across [a, a+d] */
  K.io = (t, a, d = 0.6, e = 'io') => K.ease[e](K.seg(t, a, a + d));
  /** envelope: 0 → 1 from a, back to 0 from b (b = Infinity keeps it on) */
  K.env = (t, a, b = Infinity, d = 0.5) =>
    Math.min(K.io(t, a, d, 'out'), b === Infinity ? 1 : 1 - K.io(t, b, d, 'in'));
  /** i-th item of a staggered reveal */
  K.stagger = (t, a, i, step = 0.12, d = 0.6, e = 'out') => K.io(t, a + i * step, d, e);
  /** deterministic random numbers */
  K.rng = (seed) => { let s = (seed % 2147483647) || 1; return () => (s = (s * 16807) % 2147483647) / 2147483647; };
  /** gentle idle motion (breathing, bobbing) */
  K.wave = (t, speed = 1, amp = 1, phase = 0) => Math.sin(t * speed + phase) * amp;
  /** hold a value on 'twos' for a hand-made feel */
  K.step = (t, fps = 12) => Math.floor(t * fps) / fps;

  /** colour string -> 24-bit int. Accepts '#rrggbb', '#rgb' and 'rgb(r,g,b)' / 'rgba(r,g,b,a)' (alpha ignored),
   *  so K.rgba and K.mixColor can take each other's output (nested mixes used to come out NaN = black). */
  const colorInt = (c) => {
    c = String(c).trim();
    const m = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(c);
    if (m) return ((Math.round(+m[1]) & 255) << 16) | ((Math.round(+m[2]) & 255) << 8) | (Math.round(+m[3]) & 255);
    let h = c.replace('#', '');
    if (h.length === 3 || h.length === 4) h = h.slice(0, 3).split('').map((x) => x + x).join('');
    return parseInt(h.slice(0, 6), 16);
  };
  K.rgba = (col, a) => {
    const n = colorInt(col);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  };
  K.mixColor = (h1, h2, k) => {
    const a = colorInt(h1), b = colorInt(h2);
    const ch = (s) => Math.round(K.lerp((a >> s) & 255, (b >> s) & 255, k));
    return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
  };

  // ---------- state helpers ----------
  /** draw fn at alpha a (skips entirely when invisible) */
  K.layer = (a, fn) => {
    if (Number.isNaN(a) && !K.layer.warned) { console.warn('K.layer: alpha is NaN (drawn at full opacity); check the timing math'); K.layer.warned = 1; }
    if (a <= 0.002) return; g.save(); g.globalAlpha *= a; fn(); g.restore();
  };
  /** draw fn translated/scaled/rotated around (x, y) */
  K.at = (x, y, s, rot, fn) => {
    if (typeof s === 'function') { fn = s; s = 1; rot = 0; }
    if (typeof rot === 'function') { fn = rot; rot = 0; }
    g.save(); g.translate(x, y); if (rot) g.rotate(rot); if (s !== 1) g.scale(s, s); fn(); g.restore();
  };
  /** pop-in: scale from 0.85 and fade, anchored at (x, y) */
  K.pop = (t, a, x, y, fn, d = 0.5) => {
    const k = K.io(t, a, d, 'out');
    if (k <= 0) return;
    K.layer(k, () => K.at(x, y, 0.85 + 0.15 * k, 0, () => { g.translate(-x, -y); fn(); }));
  };
  /** slide-up fade-in */
  K.rise = (t, a, fn, dist = 24, d = 0.6) => {
    const k = K.io(t, a, d, 'out');
    if (k <= 0) return;
    K.layer(k, () => { g.save(); g.translate(0, (1 - k) * dist); fn(); g.restore(); });
  };

  // ---------- camera ----------
  /** keys: [{at, x, y, z}] — returns the eased camera at t (x, y = world point at screen centre) */
  K.cam = (t, keys, d = 1.2) => {
    let c = { x: W / 2, y: H / 2, z: 1, ...keys[0] };
    for (let i = 1; i < keys.length; i++) {
      const k = K.io(t, keys[i].at, keys[i].d || d, 'io');
      if (k <= 0) break;
      const n = { ...c, ...keys[i] };
      c = { x: K.lerp(c.x, n.x, k), y: K.lerp(c.y, n.y, k), z: K.lerp(c.z, n.z, k) };
    }
    return c;
  };
  K.withCam = (c, fn) => { g.save(); g.translate(W / 2, H / 2); g.scale(c.z, c.z); g.translate(-c.x, -c.y); fn(); g.restore(); };
  /** zoom by z about the screen point (x, y), which stays put (no pan at z = 1, unlike K.cam / K.withCam) */
  K.zoomAt = (x, y, z, fn) => { g.save(); g.translate(x, y); g.scale(z, z); g.translate(-x, -y); fn(); g.restore(); };

  // ---------- background ----------
  let grain = null;
  function bakeGrain() {
    grain = document.createElement('canvas');
    grain.width = 960; grain.height = 540;
    const gg = grain.getContext('2d'), d = gg.createImageData(960, 540), r = K.rng(11);
    for (let i = 0; i < d.data.length; i += 4) { const v = r() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
    gg.putImageData(d, 0, 0);
  }
  /** indigo night ground, warm lamp glow, vignette, fine paper grain */
  K.bg = (o = {}) => {
    g.save();
    g.fillStyle = o.fill || C.page; g.fillRect(0, 0, W, H);
    const gx = o.glowX ?? W * 0.24, gy = o.glowY ?? H * 0.08, gs = o.glow ?? 0.1;
    const rad = g.createRadialGradient(gx, gy, 0, gx, gy, W * 0.85);
    rad.addColorStop(0, `rgba(240,192,106,${gs})`); rad.addColorStop(1, 'rgba(240,192,106,0)');
    g.fillStyle = rad; g.fillRect(0, 0, W, H);
    const v = g.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, W * 0.7);
    v.addColorStop(0, 'rgba(6,7,14,0)'); v.addColorStop(1, 'rgba(6,7,14,0.55)');
    g.fillStyle = v; g.fillRect(0, 0, W, H);
    if (!grain) bakeGrain();
    g.globalAlpha = o.grain ?? 0.045; g.globalCompositeOperation = 'overlay';
    g.drawImage(grain, 0, 0, W, H);
    g.restore();
  };
  /** full-bleed image (e.g. a painted plate) with slow drift, darkened for legible type on top */
  // o.mask: [y0, y1] shows only part of the plate — transparent at y0, fully opaque at y1, a vertical alpha
  // ramp between (y0 > y1 flips it: opaque at the top, fading out downwards). The shade is masked with it, so
  // what lies under the plate (K.bg) shows through with no seam. Built in a scratch buffer that is fully
  // redrawn on every call, so the frame is still a pure function of t.
  let plateBuf = null;
  K.plate = (name, t, o = {}) => {
    const im = K.img[name]; if (!im) return;
    const drift = o.drift ?? 0.012, z = 1.04 + drift * (o.zoom ? t : 0);
    const w = W * z, h = (im.height / im.width) * w;
    const paint = (c) => {
      c.drawImage(im, (W - w) / 2 + (o.panX || 0) * t, (H - h) / 2 + (o.panY || 0) * t, w, h);
      if (o.shade !== 0) { c.fillStyle = K.rgba(C.page, o.shade ?? 0.35); c.fillRect(0, 0, W, H); }
    };
    g.save(); g.globalAlpha *= o.alpha ?? 1;
    if (o.mask) {
      if (!plateBuf) { plateBuf = document.createElement('canvas'); plateBuf.width = W; plateBuf.height = H; }
      const c = plateBuf.getContext('2d');
      c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.clearRect(0, 0, W, H);
      paint(c);
      const [y0, y1] = o.mask, m = c.createLinearGradient(0, y0, 0, y1 === y0 ? y0 + 1 : y1);
      m.addColorStop(0, 'rgba(0,0,0,0)'); m.addColorStop(1, 'rgba(0,0,0,1)');
      c.globalCompositeOperation = 'destination-in'; c.fillStyle = m; c.fillRect(0, 0, W, H);
      c.globalCompositeOperation = 'source-over';
      g.drawImage(plateBuf, 0, 0, W, H);
    } else paint(g);
    g.restore();
  };

  // ---------- text ----------
  K.font = (o) => `${o.italic ? 'italic ' : ''}${o.weight || (o.font === 'head' ? 700 : 400)} ${o.size || 32}px ${F[o.font || 'ui'] || o.font}`;
  function applyText(o) {
    g.font = K.font(o);
    g.letterSpacing = (o.tracking || 0) + 'px';
  }
  K.measure = (s, o = {}) => { g.save(); applyText(o); const w = g.measureText(o.upper ? s.toUpperCase() : s).width; g.restore(); return w; };
  /** single line. o: {size, font: head|ui|read|mono, weight, color, align, baseline, alpha, upper, tracking, italic, maxW, shadow} */
  K.text = (s, x, y, o = {}) => {
    const str = o.upper ? String(s).toUpperCase() : String(s);
    g.save();
    applyText(o);
    g.fillStyle = o.color || C.strong;
    g.textAlign = o.align || 'left';
    g.textBaseline = o.baseline || 'alphabetic';
    if (o.alpha != null) g.globalAlpha *= o.alpha;
    if (o.shadow) { g.shadowColor = 'rgba(0,0,0,.55)'; g.shadowBlur = o.shadow; }
    g.fillText(str, x, y, o.maxW);
    const w = g.measureText(str).width;
    g.restore();
    return w;
  };
  /** heading in the brand's display face */
  K.title = (s, x, y, o = {}) => K.text(s, x, y, { font: 'head', weight: 700, size: 72, color: C.head, tracking: -1, ...o });
  /** tiny uppercase eyebrow label */
  K.eyebrow = (s, x, y, o = {}) => K.text(s, x, y, { font: 'ui', weight: 600, size: 22, color: C.gold, tracking: 4, upper: true, ...o });
  /** word-wrap into lines no wider than w */
  K.wrap = (s, w, o = {}) => {
    const out = [];
    String(s).split('\n').forEach((para) => {
      let line = '';
      para.split(' ').forEach((word) => {
        const test = line ? line + ' ' + word : word;
        if (line && K.measure(test, o) > w) { out.push(line); line = word; } else line = test;
      });
      out.push(line);
    });
    return out;
  };
  /** wrapped paragraph; returns its height */
  K.para = (s, x, y, w, o = {}) => {
    const lh = o.lh || (o.size || 32) * 1.4;
    const lines = K.wrap(s, w, o);
    lines.forEach((ln, i) => K.text(ln, x, y + i * lh, o));
    return lines.length * lh;
  };
  /** mixed-style run on one line: [{s, color, weight, font, italic}]; align left|center|right */
  K.spans = (parts, x, y, o = {}) => {
    const widths = parts.map((p) => K.measure(p.s, { ...o, ...p }));
    const total = widths.reduce((a, b) => a + b, 0);
    let cx = o.align === 'center' ? x - total / 2 : o.align === 'right' ? x - total : x;
    parts.forEach((p, i) => { K.text(p.s, cx, y, { ...o, ...p, align: 'left' }); cx += widths[i]; });
    return total;
  };
  /** typewriter: the part of s visible at time t (typing began at t0) */
  K.typed = (s, t, t0, cps = 28) => s.slice(0, K.clamp(Math.floor((t - t0) * cps), 0, s.length));
  K.typedDone = (s, t, t0, cps = 28) => t >= t0 + s.length / cps;
  K.caretOn = (t) => Math.floor(t * 1.8) % 2 === 0;

  // ---------- shapes ----------
  K.rr = (x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r); };
  /** soft card: 24px radius, hairline, huge faint shadow. o: {fill, stroke, r, alpha, shadow, glow, lw} */
  K.card = (x, y, w, h, o = {}) => {
    const r = o.r ?? 24;
    g.save();
    if (o.alpha != null) g.globalAlpha *= o.alpha;
    if (o.shadow !== false) { g.shadowColor = 'rgba(0,0,0,.42)'; g.shadowBlur = 70; g.shadowOffsetY = 26; }
    K.rr(x, y, w, h, r); g.fillStyle = o.fill || C.tile; g.fill();
    g.shadowColor = 'transparent';
    if (o.glow) { g.shadowColor = K.rgba(C.head, 0.55 * o.glow); g.shadowBlur = 40; }
    if (o.stroke !== false) { g.lineWidth = o.lw || 1.5; g.strokeStyle = o.stroke || C.line2; K.rr(x, y, w, h, r); g.stroke(); }
    g.restore();
  };
  /** pill label centred at (x, y); returns its width.
   *  o.w: minimum width (it still grows to fit); o.icon: a K.icon name drawn before the text (o.iconColor) */
  K.pill = (s, x, y, o = {}) => {
    const size = o.size || 26;
    const to = { size, font: o.font || 'ui', weight: o.weight || 600, tracking: o.tracking, upper: o.upper };
    const is = o.icon ? size * 1.05 : 0, gap = o.icon ? size * 0.4 : 0;
    const cw = K.measure(s, to) + is + gap;
    const w = Math.max(cw + size * 1.6, o.w || 0), h = size * 1.9;
    const col = o.color || C.strong;
    K.card(x - w / 2, y - h / 2, w, h, { r: h / 2, fill: o.fill || C.tile, stroke: o.stroke || C.line2, shadow: o.shadow ?? false, alpha: o.alpha, glow: o.glow });
    if (o.icon) K.icon(o.icon, x - cw / 2 + is / 2, y, is, { color: o.iconColor || col, alpha: o.alpha });
    K.text(s, x + (is + gap) / 2, y + size * 0.34, { ...to, color: col, align: 'center', alpha: o.alpha });
    return w;
  };
  K.line = (x1, y1, x2, y2, o = {}) => {
    if ((o.k ?? 1) <= 0) return;   // progress 0 draws nothing (a round cap would otherwise leave a dot)
    g.save(); g.strokeStyle = o.color || C.line2; g.lineWidth = o.w || 2; g.lineCap = 'round';
    if (o.dash) g.setLineDash(o.dash);
    if (o.alpha != null) g.globalAlpha *= o.alpha;
    g.beginPath(); g.moveTo(x1, y1); g.lineTo(K.lerp(x1, x2, o.k ?? 1), K.lerp(y1, y2, o.k ?? 1)); g.stroke(); g.restore();
  };
  /** arrow that draws itself: o.k = progress 0..1, o.bend = curve amount (px), o.cx/o.cy = explicit quadratic control point (overrides bend), o.color, o.w, o.head, o.dash */
  K.arrow = (x1, y1, x2, y2, o = {}) => {
    const k = K.clamp(o.k ?? 1); if (k <= 0) return;
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
    const bend = o.bend || 0;
    const cx = o.cx != null && o.cy != null ? o.cx : mx - (dy / len) * bend, cy = o.cx != null && o.cy != null ? o.cy : my + (dx / len) * bend;
    const P = (u) => [(1 - u) * (1 - u) * x1 + 2 * (1 - u) * u * cx + u * u * x2, (1 - u) * (1 - u) * y1 + 2 * (1 - u) * u * cy + u * u * y2];
    g.save(); g.strokeStyle = g.fillStyle = o.color || C.soft; g.lineWidth = o.w || 3; g.lineCap = 'round'; g.lineJoin = 'round';
    if (o.alpha != null) g.globalAlpha *= o.alpha;
    if (o.dash) g.setLineDash(o.dash);
    g.beginPath(); const n = 48;
    for (let i = 0; i <= n * k; i++) { const [px, py] = P(i / n); i ? g.lineTo(px, py) : g.moveTo(px, py); }
    const [ex, ey] = P(k); g.lineTo(ex, ey); g.stroke(); g.setLineDash([]);
    if (o.head !== false) {
      const [bx, by] = P(Math.max(0, k - 0.02)); const a = Math.atan2(ey - by, ex - bx), hs = o.headSize || 16;
      g.beginPath(); g.moveTo(ex, ey); g.lineTo(ex - hs * Math.cos(a - 0.45), ey - hs * Math.sin(a - 0.45));
      g.lineTo(ex - hs * Math.cos(a + 0.45), ey - hs * Math.sin(a + 0.45)); g.closePath(); g.fill();
    }
    g.restore();
  };
  /** self-drawing smooth path through waypoints [[x, y], ...] (Catmull-Rom spline, passes through every point).
   *  o: {k (progress 0..1, by arc length), head (default true), headSize, color, w, dash, alpha, tension (tangent scale: 0.5 = Catmull-Rom, 0 = straight segments)} */
  K.path = (pts, o = {}) => {
    const k = K.clamp(o.k ?? 1); if (k <= 0 || !pts || pts.length < 2) return;
    const ten = o.tension ?? 0.5, P = [pts[0], ...pts, pts[pts.length - 1]], poly = [];
    for (let i = 1; i < P.length - 2; i++) {
      const [p0, p1, p2, p3] = [P[i - 1], P[i], P[i + 1], P[i + 2]];
      for (let j = i === 1 ? 0 : 1; j <= 24; j++) {
        const u = j / 24, u2 = u * u, u3 = u2 * u;
        const h00 = 2 * u3 - 3 * u2 + 1, h10 = u3 - 2 * u2 + u, h01 = -2 * u3 + 3 * u2, h11 = u3 - u2;
        const h = (a, b, c, d) => h00 * b + h10 * ten * (c - a) + h01 * c + h11 * ten * (d - b);
        poly.push([h(p0[0], p1[0], p2[0], p3[0]), h(p0[1], p1[1], p2[1], p3[1])]);
      }
    }
    const cum = [0]; for (let i = 1; i < poly.length; i++) cum.push(cum[i - 1] + Math.hypot(poly[i][0] - poly[i - 1][0], poly[i][1] - poly[i - 1][1]));
    const L = cum[cum.length - 1] * k;
    g.save(); g.strokeStyle = g.fillStyle = o.color || C.soft; g.lineWidth = o.w || 3; g.lineCap = 'round'; g.lineJoin = 'round';
    if (o.alpha != null) g.globalAlpha *= o.alpha;
    if (o.dash) g.setLineDash(o.dash);
    g.beginPath(); g.moveTo(poly[0][0], poly[0][1]);
    let ex = poly[0][0], ey = poly[0][1], bx = ex, by = ey;
    for (let i = 1; i < poly.length; i++) {
      if (cum[i] >= L) { const f = (L - cum[i - 1]) / ((cum[i] - cum[i - 1]) || 1); bx = poly[i - 1][0]; by = poly[i - 1][1]; ex = K.lerp(bx, poly[i][0], f); ey = K.lerp(by, poly[i][1], f); break; }
      bx = poly[i - 1][0]; by = poly[i - 1][1]; ex = poly[i][0]; ey = poly[i][1]; g.lineTo(ex, ey);
    }
    g.lineTo(ex, ey); g.stroke(); g.setLineDash([]);
    if (o.head !== false && (ex !== bx || ey !== by)) {
      const a = Math.atan2(ey - by, ex - bx), hs = o.headSize || 16;
      g.beginPath(); g.moveTo(ex, ey); g.lineTo(ex - hs * Math.cos(a - 0.45), ey - hs * Math.sin(a - 0.45));
      g.lineTo(ex - hs * Math.cos(a + 0.45), ey - hs * Math.sin(a + 0.45)); g.closePath(); g.fill();
    }
    g.restore();
  };
  /** hand-drawn highlighter stroke under text, drawn left→right with progress k */
  K.mark = (x, y, w, k, o = {}) => {
    if (k <= 0) return;
    g.save(); g.strokeStyle = o.color || C.head; g.lineWidth = o.w || 6; g.lineCap = 'round';
    g.globalAlpha *= o.alpha ?? 0.9;
    g.beginPath(); const n = 24;
    for (let i = 0; i <= n * k; i++) { const u = i / n; const px = x + w * u, py = y + Math.sin(u * 7 + x) * 2.2; i ? g.lineTo(px, py) : g.moveTo(px, py); }
    g.stroke(); g.restore();
  };
  /** circle something, drawn with progress k. o: {color, w, rot (tilt in radians, default -0.08; 0 = upright)} */
  K.ring = (x, y, rx, ry, k, o = {}) => {
    if (k <= 0) return;
    g.save(); g.strokeStyle = o.color || C.accent; g.lineWidth = o.w || 5; g.lineCap = 'round';
    g.beginPath(); g.ellipse(x, y, rx, ry, o.rot ?? -0.08, -Math.PI * 0.6, -Math.PI * 0.6 + Math.PI * 2.1 * k); g.stroke(); g.restore();
  };
  K.glow = (x, y, r, color = C.head, a = 0.35) => {
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, K.rgba(color, a)); gr.addColorStop(1, K.rgba(color, 0));
    g.save(); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); g.restore();
  };

  // ---------- scene furniture ----------
  /** top-left lesson badge: "00.01 · THE HIDDEN CURRICULUM" */
  // o.backing: true (or an opacity 0..1, default 0.55) lays a soft dark pill behind it, for bright scenes
  K.badge = (id, label, o = {}) => {
    K.layer(o.alpha ?? 1, () => {
      const w = K.measure(id, { font: 'mono', size: 22, weight: 600 });
      if (o.backing) {
        const lw = K.measure(String(label), { font: 'ui', weight: 600, size: 20, tracking: 4, upper: true });
        const ba = typeof o.backing === 'number' ? o.backing : 0.55;
        K.card(60, 58, w + 56 + lw + 40, 40, { r: 20, fill: `rgba(8,9,18,${ba})`, stroke: false, shadow: false });
      }
      K.text(id, 80, 86, { font: 'mono', size: 22, color: C.head, weight: 600 });
      K.line(80 + w + 16, 79, 80 + w + 40, 79, { color: C.line2, w: 2 });
      K.eyebrow(label, 80 + w + 56, 86, { color: C.soft, size: 20 });
    });
  };
  /** takeaway note card with gold eyebrow; returns card height */
  K.note = (x, y, w, eyebrow, body, o = {}) => {
    const size = o.size || 34, pad = 36;
    const lines = K.wrap(body, w - pad * 2, { font: o.font || 'read', size });
    const lh = size * 1.38, h = pad * 2 + (eyebrow ? 44 : 0) + lines.length * lh - (lh - size);
    K.card(x, y, w, h, { alpha: o.alpha, fill: o.fill, glow: o.glow });
    K.layer(o.alpha ?? 1, () => {
      if (eyebrow) K.eyebrow(eyebrow, x + pad, y + pad + 18);
      lines.forEach((ln, i) => K.text(ln, x + pad, y + pad + (eyebrow ? 44 : 0) + size * 0.8 + i * lh, { font: o.font || 'read', size, color: o.color || C.strong }));
    });
    return h;
  };
  /** sparse cherry-blossom petals — decoration only, title and end cards only.
   *  o.avoid: [[x0, y0, x1, y1], ...] keep-out rects (e.g. the title block): a petal fades out over o.fade px
   *  (default 50) as it nears one, so petals never sit on text and no clip edge leaves slivers. */
  K.petals = (t, o = {}) => {
    const n = o.n || 5, r = K.rng(o.seed || 5), avoid = o.avoid || o.keep || [], fade = o.fade ?? 50;
    const away = (x, y) => Math.min(Infinity, ...avoid.map(([x0, y0, x1, y1]) =>
      Math.hypot(Math.max(x0 - x, 0, x - x1), Math.max(y0 - y, 0, y - y1))));
    for (let i = 0; i < n; i++) {
      const x0 = r() * W, sp = 18 + r() * 22, ph = r() * 10, size = 9 + r() * 7;
      const y = ((r() * H + t * sp) % (H + 80)) - 40, x = x0 + Math.sin(t * 0.6 + ph) * 40;
      const ka = avoid.length ? K.clamp((away(x, y) - size) / Math.max(1, fade)) : 1;
      if (ka <= 0) continue;
      g.save(); g.globalAlpha *= (o.alpha ?? 0.7) * ka; g.translate(x, y); g.rotate(t * 0.8 + ph);
      g.fillStyle = i % 2 ? C.blossom : C.blossomDeep;
      g.beginPath(); g.ellipse(0, 0, size, size * 0.55, 0, 0, Math.PI * 2); g.fill(); g.restore();
    }
  };

  // ---------- windows & screens ----------
  const glyph = {
    notepad: (x, y) => { g.strokeRect(x - 8, y - 10, 16, 20); K.line(x - 4, y - 3, x + 4, y - 3, { color: C.soft }); K.line(x - 4, y + 3, x + 4, y + 3, { color: C.soft }); },
    terminal: (x, y) => { K.text('>_', x, y + 7, { font: 'mono', size: 18, color: C.head, weight: 700, align: 'center' }); },
    explorer: (x, y) => { g.fillStyle = C.head; K.rr(x - 11, y - 8, 22, 16, 3); g.fill(); },
    browser: (x, y) => { g.beginPath(); g.arc(x, y, 10, 0, 7); g.stroke(); K.line(x - 10, y, x + 10, y, { color: C.soft, w: 1.5 }); },
    code: (x, y) => { K.text('</>', x, y + 6, { font: 'mono', size: 15, color: C.accent, weight: 700, align: 'center' }); },
  };
  /** app window with title bar; returns the content rect. o: {title, titleSize, kind, alpha, fill, stroke, focus, url}
   *  titleSize: title px (default 22; pass 26 where the course minimum applies). stroke: outline colour
   *  (default C.head when focused, else C.line2), so look-alike windows need no hand-drawn outline.
   *  url (any kind, meant for 'browser'): draws a 60 px address bar under the title bar (lock + mono 26 px
   *  address); the returned content rect starts below it. o.urlLock: false hides the lock. */
  const URL_BAR = 60;
  K.win = (x, y, w, h, o = {}) => {
    const bar = 50;
    K.card(x, y, w, h, { fill: o.fill || C.code, stroke: o.stroke || (o.focus ? C.head : C.line2), r: 14, alpha: o.alpha, shadow: o.shadow, glow: o.focus ? 0.6 : 0 });
    K.layer(o.alpha ?? 1, () => {
      g.save(); K.rr(x, y, w, h, 14); g.clip();
      g.fillStyle = C.tile; g.fillRect(x, y, w, bar);
      K.line(x, y + bar, x + w, y + bar, { color: C.line, w: 1.5 });
      g.restore();
      g.save(); g.strokeStyle = C.soft; g.lineWidth = 1.8; (glyph[o.kind] || glyph.notepad)(x + 30, y + bar / 2); g.restore();
      const ts = o.titleSize || 22;
      K.text(o.title || '', x + 56, y + bar / 2 + 8 + (ts - 22) * 0.36, { size: ts, color: C.body, weight: 600 });
      const gx = x + w - 34;
      K.line(gx - 7, y + 18, gx + 7, y + 32, { color: C.soft, w: 2 }); K.line(gx + 7, y + 18, gx - 7, y + 32, { color: C.soft, w: 2 });
      g.save(); g.strokeStyle = C.soft; g.lineWidth = 2; g.strokeRect(gx - 57, y + 18, 13, 13); g.restore();
      K.line(gx - 106, y + 25, gx - 92, y + 25, { color: C.soft, w: 2 });
      if (o.url != null) {
        g.save(); K.rr(x, y, w, h, 14); g.clip();
        g.fillStyle = C.tile; g.fillRect(x, y + bar, w, URL_BAR);
        K.line(x, y + bar + URL_BAR, x + w, y + bar + URL_BAR, { color: C.line, w: 1.5 });
        g.restore();
        K.rr(x + 16, y + bar + 9, w - 32, URL_BAR - 18, (URL_BAR - 18) / 2); g.fillStyle = C.page; g.fill();
        const lock = o.urlLock !== false, tx = x + 16 + (lock ? 54 : 22);
        if (lock) K.icon('lock', x + 46, y + bar + URL_BAR / 2, 24, { color: C.soft, w: 2 });
        g.save(); K.rr(x + 16, y + bar + 9, w - 32, URL_BAR - 18, (URL_BAR - 18) / 2); g.clip();
        K.text(String(o.url), tx, y + bar + URL_BAR / 2 + 9, { font: 'mono', size: 26, color: C.body });
        g.restore();
      }
    });
    const top = bar + (o.url != null ? URL_BAR : 0);
    return { x, y: y + top, w, h: h - top };
  };
  /**
   * terminal body. items: [{at, cmd, cps}] typed after a prompt, or [{at, out, color}] printed.
   * Keeps the newest lines in view. o: {prompt, size, lh, pad, rows}
   * lh: line height (default size*1.5); pad: inner padding (default 28);
   * rows: fixed number of visible rows (default: as many as fit rect.h), so a short window keeps its first line.
   * idle: false hides the blinking prompt + caret drawn while no item has started yet (for non-shell windows).
   */
  K.term = (rect, t, items, o = {}) => {
    const size = o.size || 28, lh = o.lh || size * 1.5, pad = o.pad ?? 28, prompt = o.prompt ?? 'C:\\Users\\you>';
    const rows = [];
    items.forEach((it, idx) => {
      if (t < it.at) return;
      if (it.cmd != null) {
        const typed = K.typed(it.cmd, t, it.at, it.cps || 18);
        const typing = !K.typedDone(it.cmd, t, it.at, it.cps || 18);
        const later = items.slice(idx + 1).some((n) => t >= n.at);
        rows.push({ prompt: it.prompt ?? prompt, text: typed, caret: typing || !later });
      } else {
        String(it.out).split('\n').forEach((ln) => rows.push({ text: ln, color: it.color || C.body }));
      }
    });
    const maxRows = o.rows > 0 ? Math.floor(o.rows) : Math.floor((rect.h - pad * 2) / lh);
    const shown = rows.slice(Math.max(0, rows.length - maxRows));
    shown.forEach((r, i) => {
      const y = rect.y + pad + size + i * lh;
      let x = rect.x + pad;
      if (r.prompt != null) x += K.text(r.prompt, x, y, { font: 'mono', size, color: C.head });
      x += K.text(r.text, x, y, { font: 'mono', size, color: r.color || C.strong });
      if (r.caret && K.caretOn(t)) { g.save(); g.fillStyle = C.strong; g.fillRect(x + 4, y - size * 0.8, size * 0.55, size); g.restore(); }
    });
    if (!rows.length && o.idle !== false && K.caretOn(t)) {
      const x = rect.x + pad + K.measure(prompt, { font: 'mono', size });
      K.text(prompt, rect.x + pad, rect.y + pad + size, { font: 'mono', size, color: C.head });
      g.save(); g.fillStyle = C.strong; g.fillRect(x + 4, rect.y + pad + size * 0.2, size * 0.55, size); g.restore();
    }
  };
  const PY_KW = /\b(def|return|import|from|for|in|if|else|elif|while|print|class|with|as|True|False|None)\b/;
  /** code/text editor body with line numbers. lines: string[]; o: {typeAt, cps, size, syntax:'py'|'none', from} */
  K.editor = (rect, t, lines, o = {}) => {
    const size = o.size || 28, lh = size * 1.55, pad = 26;
    let budget = o.typeAt != null ? Math.max(0, Math.floor((t - o.typeAt) * (o.cps || 30))) : Infinity;
    lines.forEach((ln, i) => {
      const y = rect.y + pad + size + i * lh;
      if (y > rect.y + rect.h - 10) return;
      if (o.gutter !== false) K.text(String(i + 1), rect.x + pad + 24, y, { font: 'mono', size: size * 0.8, color: C.quiet, align: 'right' });
      const vis = ln.slice(0, Math.max(0, budget)); budget -= ln.length + 1;
      let x = rect.x + pad + (o.gutter !== false ? 60 : 0);
      if (o.syntax === 'py') {
        vis.split(/(\s+|"[^"]*"?|#.*$|[()\[\]:,.=])/).forEach((tok) => {
          if (!tok) return;
          const col = tok.startsWith('#') ? C.quiet : tok.startsWith('"') ? C.accent : PY_KW.test(tok) && tok.match(PY_KW)[0] === tok ? C.head : C.strong;
          x += K.text(tok, x, y, { font: 'mono', size, color: col });
        });
      } else x += K.text(vis, x, y, { font: 'mono', size, color: o.color || C.strong });
    });
  };

  // ---------- files ----------
  const EXT = { py: C.head, txt: C.soft, js: '#E8C66A', md: C.body, bat: C.accent, ps1: '#8FA8D8', exe: C.accent, json: C.gold, env: C.accent, html: C.accent };
  /** document icon centred at (x, y), height s. o: {ext, name, nameSize, alpha, color} (nameSize: label px, default max(18, s*0.17)) */
  K.file = (x, y, s, o = {}) => {
    const w = s * 0.78, h = s, fold = s * 0.24, x0 = x - w / 2, y0 = y - h / 2;
    K.layer(o.alpha ?? 1, () => {
      g.save();
      g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 30; g.shadowOffsetY = 12;
      g.beginPath(); g.moveTo(x0, y0 + 10); g.quadraticCurveTo(x0, y0, x0 + 10, y0); g.lineTo(x0 + w - fold, y0); g.lineTo(x0 + w, y0 + fold);
      g.lineTo(x0 + w, y0 + h - 10); g.quadraticCurveTo(x0 + w, y0 + h, x0 + w - 10, y0 + h); g.lineTo(x0 + 10, y0 + h); g.quadraticCurveTo(x0, y0 + h, x0, y0 + h - 10); g.closePath();
      g.fillStyle = o.color || C.paper; g.fill(); g.shadowColor = 'transparent';
      g.beginPath(); g.moveTo(x0 + w - fold, y0); g.lineTo(x0 + w - fold, y0 + fold); g.lineTo(x0 + w, y0 + fold); g.closePath(); g.fillStyle = C.paperShade; g.fill();
      for (let i = 0; i < 3; i++) K.line(x0 + w * 0.18, y0 + h * (0.34 + i * 0.12), x0 + w * (i === 2 ? 0.6 : 0.8), y0 + h * (0.34 + i * 0.12), { color: '#B9AD98', w: Math.max(2, s * 0.025) });
      if (o.ext) {
        const bs = s * 0.2, label = '.' + o.ext, bw = K.measure(label, { font: 'mono', size: bs, weight: 700 }) + bs * 0.9;
        K.rr(x0 - s * 0.08, y0 + h * 0.68, bw, bs * 1.5, bs * 0.3); g.fillStyle = EXT[o.ext] || C.head; g.fill();
        K.text(label, x0 - s * 0.08 + bw / 2, y0 + h * 0.68 + bs * 1.1, { font: 'mono', size: bs, weight: 700, color: C.page, align: 'center' });
      }
      g.restore();
      if (o.name) K.text(o.name, x, y + h / 2 + s * 0.28, { font: 'mono', size: o.nameSize ?? Math.max(18, s * 0.17), color: C.body, align: 'center' });
    });
  };
  K.folder = (x, y, s, o = {}) => {
    const w = s * 1.25, h = s * 0.9, x0 = x - w / 2, y0 = y - h / 2;
    K.layer(o.alpha ?? 1, () => {
      g.save(); g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 30; g.shadowOffsetY = 12;
      g.fillStyle = o.color || '#C99A45';
      K.rr(x0, y0, w * 0.45, h * 0.3, 8); g.fill();
      K.rr(x0, y0 + h * 0.12, w, h * 0.88, 10); g.fill(); g.shadowColor = 'transparent';
      g.fillStyle = K.rgba('#FFE3A8', 0.25); K.rr(x0, y0 + h * 0.3, w, h * 0.7, 10); g.fill();
      g.restore();
      if (o.name) K.text(o.name, x, y + h / 2 + s * 0.32, { font: 'mono', size: o.nameSize ?? Math.max(18, s * 0.17), color: C.body, align: 'center' });
    });
  };

  // ---------- line icons (centred at x, y; s = size) ----------
  const ICON = {
    person: (s) => { g.beginPath(); g.arc(0, -s * 0.22, s * 0.2, 0, 7); g.stroke(); g.beginPath(); g.arc(0, s * 0.42, s * 0.36, Math.PI * 1.08, Math.PI * 1.92); g.stroke(); },
    key: (s) => { g.beginPath(); g.arc(-s * 0.22, 0, s * 0.2, 0, 7); g.stroke(); g.beginPath(); g.moveTo(-s * 0.02, 0); g.lineTo(s * 0.42, 0); g.moveTo(s * 0.28, 0); g.lineTo(s * 0.28, s * 0.14); g.moveTo(s * 0.4, 0); g.lineTo(s * 0.4, s * 0.12); g.stroke(); },
    lock: (s) => { K.rr(-s * 0.3, -s * 0.05, s * 0.6, s * 0.45, s * 0.08); g.stroke(); g.beginPath(); g.arc(0, -s * 0.05, s * 0.2, Math.PI, 0); g.stroke(); g.beginPath(); g.arc(0, s * 0.16, s * 0.05, 0, 7); g.fill(); },
    cloud: (s) => { g.beginPath(); g.arc(-s * 0.2, s * 0.05, s * 0.18, Math.PI * 0.5, Math.PI * 1.5); g.arc(0, -s * 0.1, s * 0.24, Math.PI * 1.1, Math.PI * 1.95); g.arc(s * 0.24, s * 0.05, s * 0.18, Math.PI * 1.5, Math.PI * 0.5); g.closePath(); g.stroke(); },
    server: (s) => { for (let i = 0; i < 3; i++) { K.rr(-s * 0.32, -s * 0.38 + i * s * 0.26, s * 0.64, s * 0.2, 4); g.stroke(); g.beginPath(); g.arc(s * 0.2, -s * 0.28 + i * s * 0.26, s * 0.03, 0, 7); g.fill(); } },
    globe: (s) => { g.beginPath(); g.arc(0, 0, s * 0.36, 0, 7); g.stroke(); g.beginPath(); g.ellipse(0, 0, s * 0.15, s * 0.36, 0, 0, 7); g.stroke(); g.beginPath(); g.moveTo(-s * 0.36, 0); g.lineTo(s * 0.36, 0); g.stroke(); },
    gear: (s) => { g.beginPath(); for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, r = i % 2 ? s * 0.28 : s * 0.36; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.stroke(); g.beginPath(); g.arc(0, 0, s * 0.11, 0, 7); g.stroke(); },
    book: (s) => { g.beginPath(); g.moveTo(0, -s * 0.25); g.quadraticCurveTo(-s * 0.2, -s * 0.33, -s * 0.4, -s * 0.28); g.lineTo(-s * 0.4, s * 0.3); g.quadraticCurveTo(-s * 0.2, s * 0.24, 0, s * 0.32); g.quadraticCurveTo(s * 0.2, s * 0.24, s * 0.4, s * 0.3); g.lineTo(s * 0.4, -s * 0.28); g.quadraticCurveTo(s * 0.2, -s * 0.33, 0, -s * 0.25); g.lineTo(0, s * 0.32); g.stroke(); },
    cap: (s) => { g.beginPath(); g.moveTo(-s * 0.45, -s * 0.05); g.lineTo(0, -s * 0.25); g.lineTo(s * 0.45, -s * 0.05); g.lineTo(0, s * 0.15); g.closePath(); g.stroke(); g.beginPath(); g.moveTo(-s * 0.25, s * 0.05); g.lineTo(-s * 0.25, s * 0.25); g.quadraticCurveTo(0, s * 0.38, s * 0.25, s * 0.25); g.lineTo(s * 0.25, s * 0.05); g.stroke(); g.beginPath(); g.moveTo(s * 0.4, -s * 0.03); g.lineTo(s * 0.4, s * 0.22); g.stroke(); },
    laptop: (s) => { K.rr(-s * 0.32, -s * 0.28, s * 0.64, s * 0.42, 6); g.stroke(); g.beginPath(); g.moveTo(-s * 0.45, s * 0.24); g.lineTo(s * 0.45, s * 0.24); g.stroke(); },
    check: (s) => { g.beginPath(); g.moveTo(-s * 0.3, 0); g.lineTo(-s * 0.08, s * 0.22); g.lineTo(s * 0.32, -s * 0.22); g.stroke(); },
    cross: (s) => { g.beginPath(); g.moveTo(-s * 0.25, -s * 0.25); g.lineTo(s * 0.25, s * 0.25); g.moveTo(s * 0.25, -s * 0.25); g.lineTo(-s * 0.25, s * 0.25); g.stroke(); },
    question: (s) => { g.beginPath(); g.arc(0, -s * 0.12, s * 0.18, Math.PI * 1.05, Math.PI * 2.45); g.lineTo(0, s * 0.12); g.stroke(); g.beginPath(); g.arc(0, s * 0.3, s * 0.035, 0, 7); g.fill(); },
    // chōchin paper lantern: warm body, ribbed, dark caps
    lantern: (s) => {
      g.beginPath(); g.moveTo(0, -s * 0.48); g.lineTo(0, -s * 0.38); g.stroke();
      g.save(); g.globalAlpha *= 0.28; g.beginPath(); g.ellipse(0, 0, s * 0.27, s * 0.33, 0, 0, 7); g.fill(); g.restore();
      g.beginPath(); g.ellipse(0, 0, s * 0.27, s * 0.33, 0, 0, 7); g.stroke();
      for (let i = -2; i <= 2; i++) { const y = i * s * 0.11, hw = s * 0.27 * Math.sqrt(1 - Math.pow(y / (s * 0.33), 2)); g.beginPath(); g.moveTo(-hw, y); g.quadraticCurveTo(0, y + s * 0.03, hw, y); g.globalAlpha *= 0.6; g.stroke(); g.globalAlpha /= 0.6; }
      K.rr(-s * 0.13, -s * 0.38, s * 0.26, s * 0.07, 2); g.fill();
      K.rr(-s * 0.13, s * 0.31, s * 0.26, s * 0.07, 2); g.fill();
      g.beginPath(); g.moveTo(0, s * 0.38); g.lineTo(0, s * 0.5); g.stroke();
    },
    bulb: (s) => { g.beginPath(); g.arc(0, -s * 0.08, s * 0.25, Math.PI * 0.8, Math.PI * 2.2); g.lineTo(s * 0.1, s * 0.25); g.lineTo(-s * 0.1, s * 0.25); g.closePath(); g.stroke(); g.beginPath(); g.moveTo(-s * 0.1, s * 0.35); g.lineTo(s * 0.1, s * 0.35); g.stroke(); },
    chat: (s) => { K.rr(-s * 0.38, -s * 0.3, s * 0.76, s * 0.46, s * 0.12); g.stroke(); g.beginPath(); g.moveTo(-s * 0.15, s * 0.16); g.lineTo(-s * 0.22, s * 0.34); g.lineTo(s * 0.02, s * 0.16); g.stroke(); },
    code: (s) => { g.beginPath(); g.moveTo(-s * 0.18, -s * 0.22); g.lineTo(-s * 0.4, 0); g.lineTo(-s * 0.18, s * 0.22); g.moveTo(s * 0.18, -s * 0.22); g.lineTo(s * 0.4, 0); g.lineTo(s * 0.18, s * 0.22); g.moveTo(s * 0.07, -s * 0.3); g.lineTo(-s * 0.07, s * 0.3); g.stroke(); },
    terminal: (s) => { K.rr(-s * 0.4, -s * 0.3, s * 0.8, s * 0.6, 6); g.stroke(); g.beginPath(); g.moveTo(-s * 0.26, -s * 0.12); g.lineTo(-s * 0.12, 0); g.lineTo(-s * 0.26, s * 0.12); g.moveTo(-s * 0.04, s * 0.14); g.lineTo(s * 0.18, s * 0.14); g.stroke(); },
    shield: (s) => { g.beginPath(); g.moveTo(0, -s * 0.38); g.lineTo(s * 0.32, -s * 0.24); g.quadraticCurveTo(s * 0.3, s * 0.22, 0, s * 0.4); g.quadraticCurveTo(-s * 0.3, s * 0.22, -s * 0.32, -s * 0.24); g.closePath(); g.stroke(); },
    envelope: (s) => { K.rr(-s * 0.4, -s * 0.26, s * 0.8, s * 0.52, 5); g.stroke(); g.beginPath(); g.moveTo(-s * 0.38, -s * 0.22); g.lineTo(0, s * 0.06); g.lineTo(s * 0.38, -s * 0.22); g.stroke(); },
    clock: (s) => { g.beginPath(); g.arc(0, 0, s * 0.36, 0, 7); g.stroke(); g.beginPath(); g.moveTo(0, -s * 0.22); g.lineTo(0, 0); g.lineTo(s * 0.16, s * 0.1); g.stroke(); },
    puzzle: (s) => { K.rr(-s * 0.3, -s * 0.2, s * 0.6, s * 0.5, 4); g.stroke(); g.beginPath(); g.arc(0, -s * 0.24, s * 0.09, 0, 7); g.stroke(); g.beginPath(); g.arc(s * 0.34, s * 0.05, s * 0.09, 0, 7); g.stroke(); },
    tea: (s) => { g.beginPath(); g.moveTo(-s * 0.32, -s * 0.1); g.lineTo(s * 0.26, -s * 0.1); g.quadraticCurveTo(s * 0.24, s * 0.32, 0, s * 0.32); g.lineTo(-s * 0.06, s * 0.32); g.quadraticCurveTo(-s * 0.3, s * 0.32, -s * 0.32, -s * 0.1); g.stroke(); g.beginPath(); g.arc(s * 0.3, s * 0.04, s * 0.09, -Math.PI * 0.5, Math.PI * 0.5); g.stroke(); for (let i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(i * s * 0.1, -s * 0.2); g.quadraticCurveTo(i * s * 0.1 + s * 0.05, -s * 0.3, i * s * 0.1, -s * 0.4); g.stroke(); } },
    map: (s) => { g.beginPath(); g.moveTo(-s * 0.4, -s * 0.28); g.lineTo(-s * 0.13, -s * 0.36); g.lineTo(s * 0.13, -s * 0.28); g.lineTo(s * 0.4, -s * 0.36); g.lineTo(s * 0.4, s * 0.28); g.lineTo(s * 0.13, s * 0.36); g.lineTo(-s * 0.13, s * 0.28); g.lineTo(-s * 0.4, s * 0.36); g.closePath(); g.moveTo(-s * 0.13, -s * 0.36); g.lineTo(-s * 0.13, s * 0.28); g.moveTo(s * 0.13, -s * 0.28); g.lineTo(s * 0.13, s * 0.36); g.stroke(); },
    pin: (s) => { g.beginPath(); g.arc(0, -s * 0.12, s * 0.2, Math.PI * 0.85, Math.PI * 2.15); g.lineTo(0, s * 0.38); g.closePath(); g.fill(); g.beginPath(); g.fillStyle = C.page; g.arc(0, -s * 0.12, s * 0.07, 0, 7); g.fill(); },
    house: (s) => { g.beginPath(); g.moveTo(-s * 0.42, -s * 0.02); g.lineTo(0, -s * 0.36); g.lineTo(s * 0.42, -s * 0.02); g.moveTo(-s * 0.3, -s * 0.1); g.lineTo(-s * 0.3, s * 0.32); g.lineTo(s * 0.3, s * 0.32); g.lineTo(s * 0.3, -s * 0.1); g.stroke(); K.rr(-s * 0.08, s * 0.08, s * 0.16, s * 0.24, 2); g.stroke(); },
    wifi: (s) => { for (let i = 1; i <= 3; i++) { g.beginPath(); g.arc(0, s * 0.25, s * 0.14 * i, Math.PI * 1.25, Math.PI * 1.75); g.stroke(); } g.beginPath(); g.arc(0, s * 0.25, s * 0.04, 0, 7); g.fill(); },
    brain: (s) => { g.beginPath(); g.arc(-s * 0.12, -s * 0.08, s * 0.2, Math.PI * 0.6, Math.PI * 1.6); g.arc(s * 0.02, -s * 0.2, s * 0.16, Math.PI * 1.1, Math.PI * 1.9); g.arc(s * 0.16, -s * 0.04, s * 0.18, Math.PI * 1.4, Math.PI * 0.45); g.arc(0, s * 0.14, s * 0.18, Math.PI * 0.1, Math.PI * 0.9); g.closePath(); g.stroke(); g.beginPath(); g.moveTo(0, -s * 0.3); g.quadraticCurveTo(-s * 0.06, 0, 0, s * 0.3); g.stroke(); },
    // home router: box with two antennas and three status lights
    router: (s) => { K.rr(-s * 0.4, -s * 0.02, s * 0.8, s * 0.3, s * 0.07); g.stroke(); g.beginPath(); g.moveTo(-s * 0.24, -s * 0.02); g.lineTo(-s * 0.32, -s * 0.38); g.moveTo(s * 0.24, -s * 0.02); g.lineTo(s * 0.32, -s * 0.38); g.stroke(); for (let i = -1; i <= 1; i++) { g.beginPath(); g.arc(i * s * 0.12, s * 0.13, s * 0.035, 0, 7); g.fill(); } },
    // warning: rounded triangle with an exclamation mark (deprecation notices, security alerts)
    warning: (s) => { g.beginPath(); g.moveTo(0, -s * 0.38); g.lineTo(s * 0.42, s * 0.34); g.lineTo(-s * 0.42, s * 0.34); g.closePath(); g.stroke(); g.beginPath(); g.moveTo(0, -s * 0.1); g.lineTo(0, s * 0.12); g.stroke(); g.beginPath(); g.arc(0, s * 0.23, s * 0.035, 0, 7); g.fill(); },
    phone: (s) => { K.rr(-s * 0.21, -s * 0.38, s * 0.42, s * 0.76, s * 0.08); g.stroke(); g.beginPath(); g.moveTo(-s * 0.06, -s * 0.29); g.lineTo(s * 0.06, -s * 0.29); g.stroke(); g.beginPath(); g.arc(0, s * 0.28, s * 0.035, 0, 7); g.fill(); },
    // document: page outline with a folded corner and three text lines (a line-icon cousin of K.file)
    file: (s) => { g.beginPath(); g.moveTo(-s * 0.28, -s * 0.38); g.lineTo(s * 0.1, -s * 0.38); g.lineTo(s * 0.28, -s * 0.2); g.lineTo(s * 0.28, s * 0.38); g.lineTo(-s * 0.28, s * 0.38); g.closePath(); g.moveTo(s * 0.1, -s * 0.38); g.lineTo(s * 0.1, -s * 0.2); g.lineTo(s * 0.28, -s * 0.2); g.stroke(); g.beginPath(); for (let i = 0; i < 3; i++) { const y = -s * 0.04 + i * s * 0.13; g.moveTo(-s * 0.15, y); g.lineTo(i === 2 ? s * 0.03 : s * 0.15, y); } g.stroke(); },
    // program / executable (python.exe, node, git): an app window with a title bar and a run triangle
    program: (s) => { K.rr(-s * 0.4, -s * 0.32, s * 0.8, s * 0.64, s * 0.08); g.stroke(); g.beginPath(); g.moveTo(-s * 0.4, -s * 0.15); g.lineTo(s * 0.4, -s * 0.15); g.stroke(); for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(-s * 0.3 + i * s * 0.09, -s * 0.235, s * 0.025, 0, 7); g.fill(); } g.beginPath(); g.moveTo(-s * 0.09, -s * 0.04); g.lineTo(s * 0.15, s * 0.085); g.lineTo(-s * 0.09, s * 0.21); g.closePath(); g.stroke(); },
    // AI / agent: a four-point sparkle with a small companion
    sparkle: (s) => {
      const star = (cx, cy, r) => { g.beginPath(); g.moveTo(cx, cy - r); g.quadraticCurveTo(cx, cy, cx + r, cy); g.quadraticCurveTo(cx, cy, cx, cy + r); g.quadraticCurveTo(cx, cy, cx - r, cy); g.quadraticCurveTo(cx, cy, cx, cy - r); g.closePath(); g.stroke(); };
      star(-s * 0.06, s * 0.06, s * 0.34); star(s * 0.3, -s * 0.28, s * 0.12);
    },
  };
  K.icons = Object.keys(ICON);
  ICON.exe = ICON.program; // alias, kept out of K.icons so lists show each glyph once
  /** line icon. o: {color, w, alpha, fill} */
  K.icon = (name, x, y, s, o = {}) => {
    const fn = ICON[name]; if (!fn) return;
    K.layer(o.alpha ?? 1, () => {
      g.save(); g.translate(x, y);
      g.strokeStyle = g.fillStyle = o.color || C.strong; g.lineWidth = o.w || Math.max(2, s * 0.06); g.lineCap = 'round'; g.lineJoin = 'round';
      fn(s); g.restore();
    });
  };
  /** icon sitting in a soft round tile */
  K.iconTile = (name, x, y, s, o = {}) => {
    K.card(x - s / 2, y - s / 2, s, s, { r: o.r ?? s * 0.28, fill: o.fill || C.tile, alpha: o.alpha, glow: o.glow, stroke: o.stroke });
    K.icon(name, x, y, s * 0.62, { color: o.color || C.head, alpha: o.alpha });
  };

  // ---------- assets & fonts ----------
  K.loadImages = async (map) => {
    await Promise.all(Object.entries(map || {}).map(([k, src]) => new Promise((res) => {
      const im = new Image(); im.onload = () => { K.img[k] = im; res(); }; im.onerror = () => { console.warn('image failed', src); res(); }; im.src = src;
    })));
  };
  K.fontsReady = async () => {
    // document.fonts.ready alone resolves before faces are requested — load each face explicitly
    const faces = ['700 40px "Zen Maru Gothic"', '500 40px "Zen Maru Gothic"', '400 40px Karla', '600 40px Karla', '700 40px Karla',
      '400 40px "JetBrains Mono"', '600 40px "JetBrains Mono"', '700 40px "JetBrains Mono"'];
    try { await Promise.race([Promise.all(faces.map((f) => document.fonts.load(f))), new Promise((r) => setTimeout(r, 8000))]); } catch (e) { /* fall back to system faces */ }
    await document.fonts.ready;
  };

  window.K = K;
})();
