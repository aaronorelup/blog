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
      const compact = o.compact && o.url != null;
      if (!compact) K.text(o.title || '', x + 56, y + bar / 2 + 8 + (ts - 22) * 0.36, { size: ts, color: C.body, weight: 600 });
      const gx = x + w - 34;
      K.line(gx - 7, y + 18, gx + 7, y + 32, { color: C.soft, w: 2 }); K.line(gx + 7, y + 18, gx - 7, y + 32, { color: C.soft, w: 2 });
      g.save(); g.strokeStyle = C.soft; g.lineWidth = 2; g.strokeRect(gx - 57, y + 18, 13, 13); g.restore();
      K.line(gx - 106, y + 25, gx - 92, y + 25, { color: C.soft, w: 2 });
      if (compact) {
        // o.compact: the address pill sits in the title bar itself (one 50 px bar, like a real browser), no title text
        const px = x + 62, pw = w - 62 - 150, ph = 38, py = y + (bar - ph) / 2;
        K.rr(px, py, pw, ph, ph / 2); g.fillStyle = C.page; g.fill();
        const lock = o.urlLock !== false, tx = px + (lock ? 46 : 20);
        if (lock) K.icon('lock', px + 24, y + bar / 2, 22, { color: C.soft, w: 2 });
        g.save(); K.rr(px, py, pw, ph, ph / 2); g.clip();
        K.text(String(o.url), tx, y + bar / 2 + 9, { font: 'mono', size: o.urlSize || 26, color: C.body });
        g.restore();
      }
      if (o.url != null && !compact) {
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
    const top = bar + (o.url != null && !o.compact ? URL_BAR : 0);
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
    // mouse pointer: the classic arrow cursor, tip at the top-left (x, y is the icon's centre, not the tip)
    pointer: (s) => { g.beginPath(); g.moveTo(-s * 0.22, -s * 0.38); g.lineTo(-s * 0.22, s * 0.24); g.lineTo(-s * 0.07, s * 0.1); g.lineTo(s * 0.05, s * 0.36); g.lineTo(s * 0.14, s * 0.32); g.lineTo(s * 0.02, s * 0.06); g.lineTo(s * 0.22, s * 0.06); g.closePath(); g.stroke(); },
    // restart / reload: an open circular arrow, clockwise, arrowhead at the top
    restart: (s) => { const r = s * 0.3, hl = s * 0.13; g.beginPath(); g.arc(0, 0, r, -Math.PI * 0.12, Math.PI * 1.5); g.stroke(); g.beginPath(); g.moveTo(-hl * 0.5, -r - hl * 0.8); g.lineTo(hl * 0.45, -r); g.lineTo(-hl * 0.5, -r + hl * 0.8); g.stroke(); },
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

  // ---------- media exhibits: images, video clips, sounds (KIT.md "Media exhibits") ----------
  // lesson.js declares them: images: { name: 'assets/img/x.webp' } (as before), videos: { name: 'assets/video/x.mp4' }
  // (or { src, fps }) and sounds: { name: 'assets/audio/x.mp3' } (or { src, gain }). Videos and sounds are fetched
  // whole into blob URLs before frame 0 (aaronorelup.com answers Range requests with a plain 200, so a streamed
  // element cannot seek). Clips are always muted: a clip's own sound is a sounds:{} entry of its own.
  // Frame-exact video: every K.video call records in K.want the frame its clip needs in this draw; the renderer
  // (runtime.js __frame / __png) then seeks each such clip to that frame's centre, (n + 0.5) / fps, awaits 'seeked'
  // and draws again. The live player (player.js) plays the wanted clips in step with the narration instead.
  // One media time per clip per draw: a crossfade that needs two times of one file declares it twice under two
  // names (the file is fetched once). Sounds work the same way through K.heard: the player plays each heard sound
  // in step with the narration, and tools/render.py mixes the same stretches into the MP4 (window.__heard()).
  K.vid = {};                  // name -> <video>
  K.vidInfo = {};              // name -> {src, fps, frames, dur, failed}
  K.want = new Map();          // <video> -> {name, m: media time (held inside the clip), t: its frame's centre, fps, loop}
  K.snd = {};                  // name -> <audio>
  K.sndInfo = {};              // name -> {src, dur, gain, failed}
  K.heard = new Map();         // sound name -> {m: seconds into the sound, gain}
  const mediaWarned = {};
  const warnOnce = (key, msg) => { if (!mediaWarned[key]) { mediaWarned[key] = 1; console.error(msg); } };

  /** the part of a iw x ih source to show: o.crop [sx, sy, sw, sh] (source pixels; default the whole picture), then
   *  o.zoom {x, y, z}: a z-times closer look centred on source point (x, y), kept inside the crop (z <= 1: none) */
  const sourceRect = (iw, ih, o) => {
    let [sx, sy, sw, sh] = o.crop || [0, 0, iw, ih];
    const z = o.zoom;
    if (z && z.z > 1) {
      const cw = sw / z.z, ch = sh / z.z;
      sx = K.clamp((z.x ?? sx + sw / 2) - cw / 2, sx, sx + sw - cw);
      sy = K.clamp((z.y ?? sy + sh / 2) - ch / 2, sy, sy + sh - ch);
      sw = cw; sh = ch;
    }
    return [sx, sy, sw, sh];
  };
  /** fit the source rect into the box: 'contain' (whole picture, letterboxed) or 'cover' (fills, cropped).
   *  o.align [ax, ay] (0..1, default centred): where a contained picture sits, or which part a cover keeps */
  const fitBox = (iw, ih, x, y, w, h, o) => {
    const [sx, sy, sw, sh] = sourceRect(iw, ih, o);
    const ax = o.align ? o.align[0] : 0.5, ay = o.align ? o.align[1] : 0.5;
    if (o.fit === 'cover') {
      const s = Math.max(w / sw, h / sh), cw = w / s, ch = h / s;
      return { s, src: [sx + (sw - cw) * ax, sy + (sh - ch) * ay, cw, ch], dst: [x, y, w, h] };
    }
    const s = Math.min(w / sw, h / sh), dw = sw * s, dh = sh * s;
    return { s, src: [sx, sy, sw, sh], dst: [x + (w - dw) * ax, y + (h - dh) * ay, dw, dh] };
  };
  /** what K.image / K.video return: the drawn picture's rect, its scale, and at(px, py) -> [x, y], the canvas
   *  point (current transform space) where source pixel (px, py) landed: for a cursor, a ring or a label on it */
  const placement = (b) => ({
    x: b.dst[0], y: b.dst[1], w: b.dst[2], h: b.dst[3], s: b.s,
    at: (px, py) => [b.dst[0] + (px - b.src[0]) * b.s, b.dst[1] + (py - b.src[1]) * b.s],
  });
  /** draw an image or video frame into the box: rounded (o.r, default 12), o.alpha, o.bg letterbox fill,
   *  o.stroke outline (true = C.line2, or a colour; o.lw width), o.smooth 'high' (default) | 'medium' | 'low' | false */
  const drawMedia = (src, iw, ih, x, y, w, h, o) => {
    const b = fitBox(iw, ih, x, y, w, h, o), r = o.r ?? 12;
    // with a letterbox fill the whole box is the frame; without one the picture's own rect is rounded
    const box = o.bg ? [x, y, w, h] : b.dst;
    g.save();
    if (o.alpha != null) g.globalAlpha *= o.alpha;
    if (o.bg) { K.rr(x, y, w, h, r); g.fillStyle = o.bg; g.fill(); }
    if (src) {
      g.save();
      if (r > 0) { K.rr(box[0], box[1], box[2], box[3], r); g.clip(); }
      if (o.smooth === false) g.imageSmoothingEnabled = false; else g.imageSmoothingQuality = o.smooth || 'high';
      g.drawImage(src, b.src[0], b.src[1], b.src[2], b.src[3], b.dst[0], b.dst[1], b.dst[2], b.dst[3]);
      g.restore();
    }
    if (o.stroke) { g.lineWidth = o.lw || 1.5; g.strokeStyle = o.stroke === true ? C.line2 : o.stroke; K.rr(box[0], box[1], box[2], box[3], r); g.stroke(); }
    g.restore();
    return placement(b);
  };
  /** the dark stand-in drawn where a missing or broken exhibit would be (never throws, so the scene still draws) */
  const mediaPlaceholder = (name, what, x, y, w, h, o) => {
    g.save();
    if (o.alpha != null) g.globalAlpha *= o.alpha;
    K.rr(x, y, w, h, o.r ?? 12); g.fillStyle = C.code; g.fill();
    g.lineWidth = 2; g.strokeStyle = K.rgba(C.accent, 0.6); g.setLineDash([10, 8]); K.rr(x, y, w, h, o.r ?? 12); g.stroke();
    g.restore();
    K.text(`${what} missing: ${name}`, x + w / 2, y + h / 2 + 10, { font: 'mono', size: 26, color: C.accent, align: 'center', alpha: o.alpha, maxW: w - 40 });
    return placement({ s: 1, src: [0, 0], dst: [x, y, w, h] });
  };

  /** an image from images:{} fitted into the box (a screenshot, a photo, a still). Returns its placement
   *  ({x, y, w, h, s, at(px, py)}). o: {fit: 'contain' | 'cover', align, crop, zoom, r: 12, alpha, bg, stroke, smooth} */
  K.image = (name, x, y, w, h, o = {}) => {
    const im = K.img[name];
    if (!im) { warnOnce('img:' + name, `K.image: no image '${name}' (declare it in lesson.js images: {})`); return mediaPlaceholder(name, 'image', x, y, w, h, o); }
    return drawMedia(im, im.naturalWidth || im.width, im.naturalHeight || im.height, x, y, w, h, o);
  };
  /** [width, height] in source pixels of an image or video exhibit (for crops and cursor targets), or null */
  K.mediaSize = (name) => {
    const im = K.img[name], v = K.vid[name];
    if (im) return [im.naturalWidth || im.width, im.naturalHeight || im.height];
    return v && v.videoWidth ? [v.videoWidth, v.videoHeight] : null;
  };

  /** frame of clip `name` at media time mediaT (seconds into the clip), fitted into the box; returns its placement.
   *  o: everything K.image takes, plus fps (default: read from the MP4), loop (wrap instead of holding the last
   *  frame) and sound (true, or a sounds:{} name: also play that sound at the same media time; see K.sound).
   *  Before 0 it holds the first frame, past the end the last. */
  K.video = (name, mediaT, x, y, w, h, o = {}) => {
    const v = K.vid[name], info = K.vidInfo[name];
    if (!v || !info || info.failed) {
      if (!info) warnOnce('vid:' + name, `K.video: no video '${name}' (declare it in lesson.js videos: {})`);
      return mediaPlaceholder(name, 'video', x, y, w, h, o);
    }
    const fps = o.fps || info.fps || 30;
    // the file's own frame count, unless o.fps re-times the clip
    const frames = Math.max(1, (!o.fps || o.fps === info.fps) && info.frames ? info.frames : Math.round(info.dur * fps));
    const len = frames / fps;
    let m = Number.isFinite(mediaT) ? mediaT : 0;
    if (o.loop) m = ((m % len) + len) % len;
    const n = K.clamp(Math.floor(m * fps + 1e-6), 0, frames - 1), target = (n + 0.5) / fps;
    const prev = K.want.get(v);
    if (prev && Math.abs(prev.t - target) > 1e-6) {
      warnOnce('two:' + name, `K.video: '${name}' was asked for two media times in one frame (${prev.t.toFixed(3)} s and ${target.toFixed(3)} s); declare the file again under a second name for the second copy`);
    } else if (!prev) K.want.set(v, { name, m: K.clamp(m, 0, (frames - 0.5) / fps), t: target, fps, loop: !!o.loop });
    if (o.sound) K.sound(o.sound === true ? name : o.sound, m);
    // while the live player seeks a clip, its last frame (v.__hold, player.js) stands in; the renderer never seeks mid-draw
    const src = v.readyState >= 2 ? v : v.__hold;
    return drawMedia(src, v.videoWidth || 16, v.videoHeight || 9, x, y, w, h, o);
  };
  /** length of clip `name` in seconds (0 if it is not loaded) */
  K.videoDur = (name) => { const i = K.vidInfo[name]; return i && !i.failed ? (i.frames && i.fps ? i.frames / i.fps : i.dur) || 0 : 0; };

  /** sound `name` (sounds:{}) is heard in this frame at playT seconds into it. Silent before 0 and from its end on.
   *  Played at 1x only: a stretch where playT does not advance with the lesson clock stays silent. */
  K.sound = (name, playT) => {
    const info = K.sndInfo[name];
    if (!info) { warnOnce('snd:' + name, `K.sound: no sound '${name}' (declare it in lesson.js sounds: {})`); return; }
    if (info.failed || !Number.isFinite(playT) || playT < 0 || playT >= info.dur) return;
    const prev = K.heard.get(name);
    if (prev && Math.abs(prev.m - playT) > 1e-6) {
      warnOnce('two-snd:' + name, `K.sound: '${name}' was asked for two times in one frame; declare it again under a second name`);
    } else if (!prev) K.heard.set(name, { m: playT, gain: info.gain });
  };
  /** length of sound `name` in seconds (0 if it is not loaded) */
  K.soundDur = (name) => { const i = K.sndInfo[name]; return i && !i.failed ? i.dur : 0; };

  /** an audio exhibit as a strip: the spectrogram images['spec_' + name] (it must span the sound's full length)
   *  with a playhead at playT / dur, a label and a clock. When sounds:{} has `name`, it is also heard (K.sound),
   *  unless o.sound is false. o: {dur (default the sound's or clip's length), label, r: 12, alpha, sound}.
   *  Without the spectrogram it draws a calm empty strip. */
  K.listen = (name, playT, x, y, w, h, o = {}) => {
    const im = K.img['spec_' + name], dur = o.dur ?? (K.soundDur(name) || K.videoDur(name)), r = o.r ?? 12;
    if (K.sndInfo[name] && o.sound !== false) K.sound(name, playT);
    const k = dur > 0 ? K.clamp(playT / dur) : 0;
    const clock = (s) => { s = Math.max(0, s); return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`; };
    g.save();
    if (o.alpha != null) g.globalAlpha *= o.alpha;
    K.rr(x, y, w, h, r); g.fillStyle = C.code; g.fill();
    g.save(); K.rr(x, y, w, h, r); g.clip();
    if (im) {
      g.drawImage(im, x, y, w, h);
      g.fillStyle = K.rgba(C.page, 0.5); g.fillRect(x + w * k, y, w * (1 - k), h);   // not played yet: dimmer
    } else {
      g.strokeStyle = K.rgba(C.soft, 0.3); g.lineWidth = 2;
      g.beginPath(); g.moveTo(x + 28, y + (h - 46) / 2); g.lineTo(x + w - 28, y + (h - 46) / 2); g.stroke();
    }
    const band = g.createLinearGradient(0, y + h - 70, 0, y + h);
    band.addColorStop(0, K.rgba(C.page, 0)); band.addColorStop(1, K.rgba(C.page, 0.85));
    g.fillStyle = band; g.fillRect(x, y + h - 70, w, 70);
    g.restore();
    if (im && dur > 0) {
      const px = x + w * k;
      g.shadowColor = K.rgba(C.head, 0.7); g.shadowBlur = 14;
      g.strokeStyle = C.head; g.lineWidth = 3; g.beginPath(); g.moveTo(px, y + 6); g.lineTo(px, y + h - 6); g.stroke();
      g.shadowColor = 'transparent';
    }
    g.lineWidth = 1.5; g.strokeStyle = C.line2; K.rr(x, y, w, h, r); g.stroke();
    g.restore();
    K.text(o.label ?? name, x + 20, y + h - 16, { font: 'ui', size: 26, weight: 600, color: C.strong, alpha: o.alpha, maxW: w * 0.62 });
    if (dur > 0) K.text(`${clock(playT)} / ${clock(dur)}`, x + w - 20, y + h - 16, { font: 'mono', size: 26, color: C.body, align: 'right', alpha: o.alpha });
  };

  /** a real-looking mouse pointer (white, dark outline, soft shadow) with its hotspot at (x, y), for screenshots
   *  and recordings "in use". o: {s: 1 (1 = 40 px tall), click: 0..1 (a ring spreads from the tip as it runs;
   *  ease it yourself, nothing at 0 or 1), ringColor (default C.head), alpha,
   *  kind: 'arrow' (default) | 'hand' (over a link or button; hotspot = fingertip) | 'text' (I-beam over text and
   *  inputs; hotspot = its middle), press: 0..1 (the pointer dips to 88 % while the button is down),
   *  ripple: true (a soft filled disc under the ring, the Screen Studio look), key: 'Enter' | 'Ctrl+K' | [...] (a
   *  key chip beside the pointer, K.keys), keyAlpha} */
  K.cursor = (x, y, o = {}) => {
    const s0 = o.s ?? 1, s = s0 * 40 / 20 * (1 - 0.12 * K.clamp(o.press || 0)), k = o.click, kind = o.kind || 'arrow';
    K.layer(o.alpha ?? 1, () => {
      if (k > 0 && k < 1) {
        if (o.ripple) {
          g.save(); g.fillStyle = K.rgba(o.ringColor || C.head, 0.28 * (1 - K.ease.in(k)));
          g.beginPath(); g.arc(x, y, s0 * (10 + 26 * K.ease.out(k)), 0, Math.PI * 2); g.fill(); g.restore();
        }
        g.save(); g.strokeStyle = K.rgba(o.ringColor || C.head, 0.9 * (1 - k)); g.lineWidth = 3;
        g.beginPath(); g.arc(x, y, s0 * (8 + 34 * K.ease.out(k)), 0, Math.PI * 2); g.stroke(); g.restore();
      }
      g.save(); g.translate(x, y); g.scale(s, s);
      if (kind === 'text') {
        // I-beam: a dark outline under a white stroke, centred on the hotspot
        const beam = () => { g.beginPath(); g.moveTo(-2.6, -8.5); g.quadraticCurveTo(0, -8.5, 0, -6.6); g.quadraticCurveTo(0, -8.5, 2.6, -8.5);
          g.moveTo(0, -6.6); g.lineTo(0, 6.6); g.moveTo(-2.6, 8.5); g.quadraticCurveTo(0, 8.5, 0, 6.6); g.quadraticCurveTo(0, 8.5, 2.6, 8.5); };
        g.lineCap = 'round'; g.lineJoin = 'round';
        g.shadowColor = 'rgba(0,0,0,0.45)'; g.shadowBlur = 5; g.shadowOffsetY = 1.5;
        beam(); g.lineWidth = 3.2; g.strokeStyle = '#111111'; g.stroke();
        g.shadowColor = 'transparent'; beam(); g.lineWidth = 1.3; g.strokeStyle = '#FFFFFF'; g.stroke();
      } else {
        g.beginPath();
        if (kind === 'hand') {
          // pointing hand, fingertip (the hotspot) at 0,0
          g.moveTo(-1.6, 1.6); g.quadraticCurveTo(-1.6, 0, 0, 0); g.quadraticCurveTo(1.6, 0, 1.6, 1.6); g.lineTo(1.6, 6.9);
          g.quadraticCurveTo(1.6, 5.7, 3.1, 5.7); g.quadraticCurveTo(4.6, 5.7, 4.6, 7.1);
          g.quadraticCurveTo(4.6, 6.5, 6.0, 6.5); g.quadraticCurveTo(7.4, 6.5, 7.4, 7.9);
          g.quadraticCurveTo(7.4, 7.3, 8.6, 7.3); g.quadraticCurveTo(9.8, 7.3, 9.8, 8.7); g.lineTo(9.8, 14.4);
          g.quadraticCurveTo(9.8, 17.4, 7.6, 19.2); g.lineTo(1.4, 19.2); g.quadraticCurveTo(0.2, 17.9, -1.0, 16.6);
          g.lineTo(-4.5, 12.6); g.quadraticCurveTo(-5.6, 11.1, -4.3, 10.4); g.quadraticCurveTo(-3.0, 9.8, -1.6, 11.3); g.closePath();
        } else {
          g.moveTo(0, 0); g.lineTo(0, 16.5); g.lineTo(3.9, 12.9); g.lineTo(6.6, 19.2); g.lineTo(9.4, 18); g.lineTo(6.8, 11.9); g.lineTo(11.9, 11.9); g.closePath();
        }
        g.shadowColor = 'rgba(0,0,0,0.45)'; g.shadowBlur = 6; g.shadowOffsetY = 2;
        g.fillStyle = '#FFFFFF'; g.fill();
        g.shadowColor = 'transparent'; g.lineJoin = 'round'; g.lineWidth = 1.25; g.strokeStyle = '#111111'; g.stroke();
        if (kind === 'hand') {
          g.beginPath(); g.moveTo(4.6, 7.4); g.lineTo(4.6, 10.2); g.moveTo(7.4, 8.1); g.lineTo(7.4, 10.6); g.moveTo(1.6, 7.0); g.lineTo(1.6, 10.4);
          g.lineWidth = 0.9; g.lineCap = 'round'; g.stroke();
        }
      }
      g.restore();
    });
    if (o.key) K.keys(o.key, x + 30 * s0, y + 56 * s0, { size: 26, align: 'left', alpha: (o.alpha ?? 1) * (o.keyAlpha ?? 1) });
  };

  /** a keyboard key chip centred at (x, y) (Enter, Ctrl, K...); returns its width. o: {size: 28, alpha, color, fill, stroke} */
  K.keycap = (label, x, y, o = {}) => {
    const size = o.size || 28, h = Math.round(size * 1.6), tw = K.measure(label, { font: 'ui', size, weight: 700 });
    const w = Math.max(h, tw + size * 1.1);
    K.layer(o.alpha ?? 1, () => {
      g.save();
      K.rr(x - w / 2, y - h / 2 + 5, w, h, 10); g.fillStyle = 'rgba(4,5,12,0.75)'; g.fill();
      K.rr(x - w / 2, y - h / 2, w, h, 10); g.fillStyle = o.fill || C.tile; g.fill();
      g.lineWidth = 1.5; g.strokeStyle = o.stroke || C.line2; g.stroke();
      g.restore();
      K.text(label, x, y + size * 0.35, { font: 'ui', size, weight: 700, color: o.color || C.strong, align: 'center' });
    });
    return w;
  };
  const KEY_NAMES = { Control: 'Ctrl', ControlOrMeta: 'Ctrl', Meta: 'Win', Escape: 'Esc', ArrowUp: 'Up', ArrowDown: 'Down',
    ArrowLeft: 'Left', ArrowRight: 'Right', ' ': 'Space', Backspace: 'Backspace', Delete: 'Del', PageDown: 'PgDn', PageUp: 'PgUp' };
  /** a key or a shortcut as chips: 'Enter', 'Control+K' (Playwright names are shortened: Ctrl, Win, Esc...) or
   *  ['Ctrl', 'Shift', 'P']. o: {size: 28, align: 'center' | 'left' | 'right', alpha}. Returns the total width. */
  const keyParts = (combo) => (Array.isArray(combo) ? combo : String(combo).split(/\+(?!$)/)).map((p) => KEY_NAMES[p] || (p.length === 1 ? p.toUpperCase() : p));
  const keyWs = (parts, size) => parts.map((p) => Math.max(Math.round(size * 1.6), K.measure(p, { font: 'ui', size, weight: 700 }) + size * 1.1));
  /** the width K.keys(combo, ..., {size}) draws */
  const keysWidth = (combo, size = 28) => { const ps = keyParts(combo); return keyWs(ps, size).reduce((a, b) => a + b, 0) + size * 0.9 * (ps.length - 1); };
  K.keys = (combo, x, y, o = {}) => {
    const parts = keyParts(combo);
    const size = o.size || 28, gap = size * 0.9;
    const ws = keyWs(parts, size);
    const total = ws.reduce((a, b) => a + b, 0) + gap * (parts.length - 1);
    let cx = o.align === 'left' ? x : o.align === 'right' ? x - total : x - total / 2;
    parts.forEach((p, i) => {
      K.keycap(p, cx + ws[i] / 2, y, { ...o, size });
      cx += ws[i];
      if (i < parts.length - 1) { K.text('+', cx + gap / 2, y + size * 0.35, { font: 'ui', size, weight: 700, color: C.soft, align: 'center', alpha: o.alpha }); cx += gap; }
    });
    return total;
  };

  /** frame rate, frame count and length of the first video track of an MP4 (moov > trak > mdhd / hdlr / stts) */
  const mp4Info = (buf) => {
    const dv = new DataView(buf), tracks = [];
    let cur = null;
    const four = (o) => String.fromCharCode(dv.getUint8(o), dv.getUint8(o + 1), dv.getUint8(o + 2), dv.getUint8(o + 3));
    const walk = (off, end) => {
      while (off + 8 <= end) {
        let size = dv.getUint32(off), hd = 8;
        const type = four(off + 4);
        if (size === 1) { size = Number(dv.getBigUint64(off + 8)); hd = 16; } else if (size === 0) size = end - off;
        if (size < hd || off + size > end) break;
        const b = off + hd;
        if (type === 'trak') { cur = {}; tracks.push(cur); }
        if (['moov', 'trak', 'mdia', 'minf', 'stbl'].includes(type)) walk(b, off + size);
        else if (cur && type === 'mdhd') {
          const v1 = dv.getUint8(b) === 1;
          cur.ts = dv.getUint32(b + (v1 ? 20 : 12));
          cur.len = v1 ? Number(dv.getBigUint64(b + 24)) : dv.getUint32(b + 16);
        } else if (cur && type === 'hdlr') cur.kind = four(b + 8);
        else if (cur && type === 'stts') {
          let samples = 0, best = 0, bestN = -1;
          for (let i = 0, n = dv.getUint32(b + 4); i < n; i++) {
            const cnt = dv.getUint32(b + 8 + 8 * i), d = dv.getUint32(b + 12 + 8 * i);
            samples += cnt; if (cnt > bestN) { bestN = cnt; best = d; }
          }
          cur.frames = samples; cur.delta = best;
        }
        off += size;
      }
    };
    try { walk(0, buf.byteLength); } catch (e) { return null; }
    const t = tracks.find((x) => x.kind === 'vide');
    return t && t.ts && t.delta ? { fps: t.ts / t.delta, frames: t.frames, dur: t.len / t.ts } : null;
  };

  const MIME = { mp4: 'video/mp4', m4v: 'video/mp4', mov: 'video/mp4', webm: 'video/webm', mp3: 'audio/mpeg', m4a: 'audio/mp4', aac: 'audio/aac', wav: 'audio/wav', ogg: 'audio/ogg', opus: 'audio/ogg' };
  const mediaFiles = {};       // src -> promise of {url, blob}: a file declared under two names is fetched once
  /** fetch every videos:{} and sounds:{} entry whole into a blob URL and wait until each can show a frame / play.
   *  onProgress(got, total) reports download bytes. A failure prints a console error and leaves a placeholder
   *  (a video) or silence (a sound); it never stops the lesson. */
  K.loadMedia = async (videos, sounds, onProgress) => {
    const vids = Object.entries(videos || {}), snds = Object.entries(sounds || {});
    if (!vids.length && !snds.length) return;
    const got = {}, total = {};
    const sum = (o) => Object.values(o).reduce((a, b) => a + b, 0);
    const tick = () => { if (onProgress) onProgress(sum(got), sum(total)); };
    const fetchWhole = (src) => mediaFiles[src] || (mediaFiles[src] = (async () => {
      const r = await fetch(src);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      total[src] = Number(r.headers.get('content-length')) || 0; got[src] = 0; tick();
      const parts = [];
      if (r.body && r.body.getReader) {
        const rd = r.body.getReader();
        for (;;) { const { done, value } = await rd.read(); if (done) break; parts.push(value); got[src] += value.length; tick(); }
      } else parts.push(new Uint8Array(await r.arrayBuffer()));
      const ext = (String(src).split('?')[0].split('.').pop() || '').toLowerCase();
      const blob = new Blob(parts, { type: MIME[ext] || 'application/octet-stream' });
      return { url: URL.createObjectURL(blob), blob, ext };
    })());
    const ready = (el, url) => new Promise((res, rej) => {
      const tm = setTimeout(() => rej(new Error('timed out waiting for the first frame')), 60000);
      el.addEventListener('loadeddata', () => { clearTimeout(tm); res(); }, { once: true });
      el.addEventListener('error', () => { clearTimeout(tm); rej(new Error((el.error && el.error.message) || 'cannot decode')); }, { once: true });
      el.src = url;
    });
    const spec = (s) => (typeof s === 'string' ? { src: s } : s || {});
    await Promise.all([
      ...vids.map(async ([name, s]) => {
        const { src, fps } = spec(s);
        K.vidInfo[name] = { src, fps: fps || 30, frames: 0, dur: 0, failed: false };
        try {
          const f = await fetchWhole(src);
          const v = document.createElement('video');
          v.muted = true; v.defaultMuted = true; v.playsInline = true; v.setAttribute('playsinline', ''); v.preload = 'auto';
          await ready(v, f.url);
          const p = (['mp4', 'm4v', 'mov'].includes(f.ext) && mp4Info(await f.blob.arrayBuffer())) || {};
          K.vidInfo[name] = { src, fps: fps || p.fps || 30, frames: p.frames || 0, dur: p.dur || v.duration || 0, failed: false };
          K.vid[name] = v;
        } catch (e) {
          K.vidInfo[name].failed = true;
          console.error(`video failed: ${name} (${src}): ${e.message}`);
        }
      }),
      ...snds.map(async ([name, s]) => {
        const { src, gain } = spec(s);
        K.sndInfo[name] = { src, dur: 0, gain: gain ?? 1, failed: false };
        try {
          const f = await fetchWhole(src);
          const a = document.createElement('audio');
          a.preload = 'auto';
          await ready(a, f.url);
          K.sndInfo[name].dur = Number.isFinite(a.duration) ? a.duration : 0;
          K.snd[name] = a;
        } catch (e) {
          K.sndInfo[name].failed = true;
          console.error(`sound failed: ${name} (${src}): ${e.message}`);
        }
      }),
    ]);
  };
  /** renderer: seek every clip K.want asked for to its frame centre and wait for each 'seeked'.
   *  Returns how many clips had to move (0 = the frame already shows the right pictures). */
  K.settleVideos = async (timeout = 20000) => {
    const jobs = [];
    K.want.forEach((w, v) => {
      // Chromium keeps currentTime in whole microseconds (a seek to 4.0208333 reads back 4.020832), so "already
      // there" allows 0.1 ms; the frame on show only changes 0.5 / fps away from the centre
      if (Math.abs(v.currentTime - w.t) < 1e-4 && !v.seeking && v.readyState >= 2) return;
      jobs.push(new Promise((res) => {
        const done = () => { clearTimeout(tm); v.removeEventListener('seeked', done); res(); };
        const tm = setTimeout(() => { console.error(`K.video: '${w.name}' did not reach ${w.t.toFixed(3)} s`); done(); }, timeout);
        v.addEventListener('seeked', done);
        v.currentTime = w.t;
      }));
    });
    await Promise.all(jobs);
    return jobs.length;
  };

  // ---------- showing real computer actions: captures (KIT.md "Captures: real actions on a computer") ----------
  // tools/capture.py records a browser (Playwright), a terminal (real commands) or the desktop (ffmpeg gdigrab) into
  // lessons/<slug>/assets/capture/<name>/ (events.json, video.mp4, shots/*.png, steps.json). lesson.js declares them:
  //   captures: { site: 'assets/capture/site/' }
  // They load before frame 0 (K.loadMedia below): the clip becomes the video 'cap:<name>' (frame-exact in the MP4,
  // played in step on the page like any K.video), every shot the image '<name>/<shot>', and the events are turned
  // once into lookup tables (cursor track, clicks, typing, camera keys). Everything drawn from them is a pure
  // function of t: K.demo, K.shot and K.termReplay take the capture's own clock (seconds into the recording).
  K.cap = {};
  const CAP_HZ = 60;
  const capVideo = (name) => 'cap:' + name;

  /** a capture's events.json -> the tables the scenes read (built once at load, never per frame) */
  const prepCapture = (name, base, d) => {
    const c = { ...d, name, base, failed: false };
    if (d.kind === 'terminal') return c;
    const ev = (d.events || []).slice().sort((a, b) => a.t - b.t);
    c.clicks = ev.filter((e) => e.kind === 'click');
    c.types = ev.filter((e) => e.kind === 'type');
    c.presses = ev.filter((e) => e.kind === 'key');
    c.scrolls = ev.filter((e) => e.kind === 'scroll');
    c.navs = ev.filter((e) => e.kind === 'nav');
    c.drags = ev.filter((e) => e.kind === 'drag');
    // cursor track: every recorded position, resampled at 60 Hz and lightly smoothed (a desktop log at 30 Hz is
    // jittery; the browser recorder already moves along eased paths). Clicks happen while the pointer rests, so
    // smoothing never moves a click off its target.
    const pts = [[0, (d.start || {}).x ?? d.size[0] / 2, (d.start || {}).y ?? d.size[1] / 2]];
    ev.forEach((e) => {
      if (e.path) e.path.forEach((p) => pts.push(p));
      else if (e.x != null && e.kind !== 'scroll') pts.push([e.t, e.x, e.y]);
      if (e.kind === 'drag' && e.x1 != null) pts.push([e.t1, e.x1, e.y1]);
    });
    pts.sort((a, b) => a[0] - b[0]);
    const dur = Math.max(d.duration || 0, pts[pts.length - 1][0]) + 0.5, n = Math.ceil(dur * CAP_HZ) + 1;
    const rx = new Float32Array(n), ry = new Float32Array(n);
    let j = 0;
    for (let i = 0; i < n; i++) {
      const t = i / CAP_HZ;
      while (j < pts.length - 2 && pts[j + 1][0] <= t) j++;
      const a = pts[j], b = pts[Math.min(j + 1, pts.length - 1)];
      const k = b[0] > a[0] ? K.clamp((t - a[0]) / (b[0] - a[0])) : (t >= b[0] ? 1 : 0);
      rx[i] = K.lerp(a[1], b[1], k); ry[i] = K.lerp(a[2], b[2], k);
    }
    const sigma = (d.kind === 'desktop' ? 0.06 : 0.02) * CAP_HZ, rad = Math.ceil(sigma * 3);
    const wts = []; for (let k = -rad; k <= rad; k++) wts.push(Math.exp(-(k * k) / (2 * sigma * sigma)));
    c.tx = new Float32Array(n); c.ty = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      let sx = 0, sy = 0, sw = 0;
      for (let k = -rad; k <= rad; k++) { const m = Math.min(n - 1, Math.max(0, i + k)), wv = wts[k + rad]; sx += rx[m] * wv; sy += ry[m] * wv; sw += wv; }
      c.tx[i] = sx / sw; c.ty[i] = sy / sw;
    }
    c.camMemo = {};
    return c;
  };
  /** where the pointer is at capture time t (source pixels) */
  const capPos = (c, t) => {
    const f = K.clamp(t, 0, (c.tx.length - 1) / CAP_HZ) * CAP_HZ, i = Math.floor(f), k = f - i, i2 = Math.min(i + 1, c.tx.length - 1);
    return [K.lerp(c.tx[i], c.tx[i2], k), K.lerp(c.ty[i], c.ty[i2], k)];
  };
  const capShape = (c, t) => {
    let s = 'arrow';
    (c.shapes || []).forEach(([at, v]) => { if (at <= t) s = v; });
    return s;
  };
  const capNav = (c, t) => {
    let n = c.navs[0] || null;
    c.navs.forEach((e) => { if (e.t <= t) n = e; });
    return n;
  };

  /** fetch each capture's events.json, register its clip and shots; returns the extra videos:{} to fetch */
  K.loadCaptures = async (caps) => {
    const videos = {}, images = {};
    await Promise.all(Object.entries(caps || {}).map(async ([name, spec]) => {
      const base = String(typeof spec === 'string' ? spec : spec.src).replace(/\/?$/, '/');
      try {
        const r = await fetch(base + 'events.json');
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const d = await r.json();
        K.cap[name] = prepCapture(name, base, d);
        if (d.video) videos[capVideo(name)] = base + d.video;
        (d.shots || []).forEach((s) => { images[name + '/' + s.name] = base + s.file; });
      } catch (e) {
        K.cap[name] = { name, base, failed: true };
        console.error(`capture failed: ${name} (${base}events.json): ${e.message}`);
      }
    }));
    await K.loadImages(images);
    return videos;
  };
  // K.loadMedia also loads the lesson's captures (runtime.js calls it after setting window.__lesson; a 4th argument
  // overrides), so the clips are fetched whole with the other videos and everything is in before frame 0
  const loadMediaOnly = K.loadMedia;
  K.loadMedia = async (videos, sounds, onProgress, captures) => {
    const caps = captures !== undefined ? captures : (window.__lesson && window.__lesson.captures);
    const extra = caps ? await K.loadCaptures(caps) : {};
    return loadMediaOnly({ ...(videos || {}), ...extra }, sounds, onProgress);
  };
  /** a capture's data (events.json plus the tables), or null */
  K.capture = (name) => (K.cap[name] && !K.cap[name].failed ? K.cap[name] : null);
  // named moments: a `mark` step (or a `shot` step: its name) of the recipe, with the boxes it measured. Scenes read
  // capture times and positions from these, never type them in: they move every time the capture is re-recorded.
  const capMark = (c, mark) => (c && c.events ? c.events.find((e) => (e.kind === 'mark' || e.kind === 'shot') && e.name === mark) : null);
  /** the time of mark `mark` (a mark or shot step's name) on capture `name`'s clock; fallback (a console error
   *  once) when there is no such mark */
  K.captureAt = (name, mark, fallback = 0) => {
    const e = capMark(K.capture(name), mark);
    if (e) return e.t;
    warnOnce(`mark:${name}:${mark}`, `K.captureAt: capture '${name}' has no mark '${mark}' (add {"do": "mark", "name": "${mark}"} to its steps and re-record)`);
    return fallback;
  };
  /** the box [x, y, w, h] (video px) that mark or shot `mark` of capture `name` measured for `box`
   *  ({"boxes": {"<box>": "<css selector>"}} in its step), or fallback (null) */
  K.captureBox = (name, mark, box, fallback = null) => {
    const c = K.capture(name), e = capMark(c, mark);
    const sh = c && c.shots ? c.shots.find((s) => s.name === mark) : null;
    const b = (e && e.boxes && e.boxes[box]) || (sh && sh.boxes && sh.boxes[box]);
    if (b) return b;
    warnOnce(`box:${name}:${mark}:${box}`, `K.captureBox: capture '${name}' has no box '${box}' at '${mark}'`);
    return fallback;
  };
  /** where the recorded pointer is at capture time t: [x, y, kind] in video pixels (kind 'arrow' | 'hand' | 'text'), or
   *  null. Map it to the screen with the `at` K.demo returns, to hang a label on the pointer */
  K.capturePointer = (name, t) => { const c = K.capture(name); return c && c.tx ? [...capPos(c, t), capShape(c, t)] : null; };
  /** how long a capture runs on its own clock: the recording's length, or a terminal replay's (same o as K.termReplay) */
  K.captureDur = (name, o = {}) => {
    const c = K.capture(name);
    if (!c) return 0;
    return c.kind === 'terminal' ? termSchedule(c, o).dur : c.duration || K.videoDur(capVideo(name));
  };

  // --- the automatic camera (Screen Studio style): ease toward each click or typing target, hold, ease back out.
  // Focus moments closer than `join` seconds share one zoom (the camera pans between them); a scroll or a page load
  // ends a zoom, and a zoom that could not hold still for `minHold` seconds before it ends is not made at all (a
  // click that loads a page at once: only the pointer moves). Keys are in source pixels; sx null = the whole screen.
  // Everything the camera depends on, as one string: the memo keys of K.demo (per capture) and K.shot (global).
  const camKey = (o) => JSON.stringify([o.zoom, o.lead, o.hold, o.join, o.camD, o.minHold, o.follow !== false, o.zooms || null,
    (o.callouts || []).filter((k) => k.zoom).map((k) => [k.at, k.until, k.dur, k.box, k.zoom])]);
  const autoCam = (c, o) => {
    const zmax = o.zoom ?? 1.8, lead = o.lead ?? 1.25, hold = o.hold ?? 1.1, join = o.join ?? 2.6, d = o.camD ?? 1.15;
    const minHold = o.minHold ?? 0.6;
    const memo = camKey(o);
    if (c.camMemo && c.camMemo[memo]) return c.camMemo[memo];
    const [SW, SH] = c.size, keys = [{ at: -1e9, d, sx: null, z: 1 }];
    const fitZ = (b, frac) => (b ? K.clamp(Math.min((SW * frac) / b[2], (SH * frac) / b[3]), 1.25, zmax) : zmax);
    let focus = [];
    if (o.zooms) {
      // scripted zooms: [{at, until, box: [x, y, w, h]} or {at, until, x, y, z}]. A zoom whose next one starts
      // within a move of its end pans straight on to it (no dip toward 1x and back)
      const zs = o.zooms.slice().sort((a, b) => a.at - b.at);
      zs.forEach((zm, i) => {
        const b = zm.box, z = zm.z ?? fitZ(b, 0.7), nx = zs[i + 1];
        keys.push({ at: zm.at, d: zm.d ?? d, sx: b ? b[0] + b[2] / 2 : zm.x, sy: b ? b[1] + b[3] / 2 : zm.y, z });
        if (zm.until != null && !(nx && nx.at < zm.until + (zm.d ?? d))) keys.push({ at: zm.until, d: zm.d ?? d, sx: null, z: 1 });
      });
    } else if (o.follow !== false) {
      c.clicks.forEach((e) => focus.push({ t: e.t, t1: e.t, x: e.x, y: e.y, z: zmax }));
      c.types.forEach((e) => {
        const b = e.box;
        focus.push({ t: (e.keys && e.keys.length ? e.keys[0][0] : e.t), t1: e.t1 ?? e.t, x: b ? b[0] + b[2] / 2 : e.x, y: b ? b[1] + b[3] / 2 : e.y, z: fitZ(b, 0.85) });
      });
      (o.callouts || []).forEach((k) => { if (k.zoom) focus.push({ t: k.at, t1: k.until ?? k.at + (k.dur ?? 2.5), x: k.box[0] + k.box[2] / 2, y: k.box[1] + k.box[3] / 2, z: typeof k.zoom === 'number' ? k.zoom : fitZ(k.box, 0.7) }); });
      focus.sort((a, b) => a.t - b.t);
      // a type step starts with a focusing click on the same field: one focus, not two
      const merged = [];
      focus.forEach((f) => {
        const p = merged[merged.length - 1];
        if (p && f.t - p.t1 < 0.8 && Math.hypot(f.x - p.x, f.y - p.y) < SW * 0.15) { p.t1 = Math.max(p.t1, f.t1); p.x = f.x; p.y = f.y; p.z = Math.min(p.z, f.z); }
        else merged.push({ ...f });
      });
      focus = merged;
      const breaks = c.scrolls.map((e) => e.t).concat(c.navs.filter((e) => e.t > 0.05).map((e) => e.t), c.drags.map((e) => e.t)).sort((a, b) => a - b);
      const breakIn = (a, b) => breaks.find((x) => x > a && x < b);
      let i = 0, lastOut = -1e9;
      while (i < focus.length) {
        const cl = [focus[i]];
        while (i + 1 < focus.length && focus[i + 1].t - cl[cl.length - 1].t1 < join && breakIn(cl[cl.length - 1].t1, focus[i + 1].t) == null) cl.push(focus[++i]);
        i++;
        const first = cl[0], last = cl[cl.length - 1];
        const inAt = Math.max(first.t - lead, lastOut);
        // when the camera has to leave (the hold is over, or a scroll / page load cuts it short), worked out first:
        // a zoom that would arrive and leave again without settling is calmer left out
        let outAt = last.t1 + hold;
        const br = breakIn(last.t1 - 0.01, outAt + 0.3);
        if (br != null) outAt = Math.min(outAt, br - 0.05);
        if (outAt - (inAt + d) < minHold) continue;
        keys.push({ at: inAt, d, sx: first.x, sy: first.y, z: first.z });
        cl.slice(1).forEach((f) => keys.push({ at: Math.max(inAt + d * 0.6, f.t - 0.85), d: 0.75, sx: f.x, sy: f.y, z: f.z }));
        keys.push({ at: outAt, d, sx: null, z: 1 });
        lastOut = outAt + d * 0.5;
      }
    }
    keys.sort((a, b) => a.at - b.at);
    c.camMemo[memo] = keys;
    return keys;
  };

  const rectArgs = (rect) => (Array.isArray(rect) ? rect : [rect.x, rect.y, rect.w, rect.h]);
  const hostOf = (url) => String(url || '').replace(/^https?:\/\//, '').replace(/\/$/, '');

  /** the shared stage of K.demo and K.shot: window chrome around a source picture, the camera, the pointer, click
   *  ripples, key and typing chips, callouts. v: {t, rect, size: [sw, sh], chrome: 'browser'|'window'|'none', url,
   *  title, draw(x, y, w, h) (draws the picture into that box), keys (camera, source px), cursor: {x, y, kind,
   *  press, clicks: [t...]} | null, ripples: [{t, x, y}], chips: [{t0, t1, text, typing, box}], presses: [{t, key}],
   *  callouts, frame, alpha, cursorScale} */
  const screenView = (v) => {
    const t = v.t, [x, y, w, hIn] = rectArgs(v.rect), [sw, sh] = v.size;
    const bar = v.chrome === 'none' ? 0 : 50;
    const ch = hIn != null ? hIn - bar : w * sh / sw, H = bar + ch;
    const s0 = Math.min(w / sw, ch / sh), dw = sw * s0, dh = sh * s0, dx = x + (w - dw) / 2, dy = y + bar + (ch - dh) / 2;
    const world = (px, py) => [dx + px * s0, dy + py * s0];
    // the stage a zoom may fill: by default a rounded panel under the badge band (x 24-1896, y 120-1056), so the
    // badge and the scene's own labels stay clean and a zoomed recording reads as a screen
    const F = v.frame ? rectArgs(v.frame) : [24, 120, K.W - 48, K.H - 144], FR = v.frameR ?? (v.frame ? 0 : 22);
    const fcx = F[0] + F[2] / 2, fcy = F[1] + F[3] / 2;
    // zoom eases in log scale (z = exp of an eased log z), as screen-recording tools do: a linear z grows the picture
    // about 1.75 times faster at the start of a 1x -> 1.75x move than at its end. Only here: legacy scenes keep K.cam
    const keys = (v.keys || [{ at: -1e9, sx: null, z: 1 }]).map((k) => {
      if (k.sx == null) return { at: k.at, d: k.d, x: fcx, y: fcy, z: 0 };
      let [wx, wy] = world(k.sx, k.sy);
      const hw = F[2] / (2 * k.z), hh = F[3] / (2 * k.z);
      wx = w >= 2 * hw ? K.clamp(wx, x + hw, x + w - hw) : x + w / 2;
      wy = H >= 2 * hh ? K.clamp(wy, y + hh, y + H - hh) : y + H / 2;
      return { at: k.at, d: k.d, x: wx, y: wy, z: Math.log(k.z) };
    });
    const cam = K.cam(t, keys);
    cam.z = Math.exp(cam.z);
    const toScreen = (wx, wy) => [(wx - cam.x) * cam.z + fcx, (wy - cam.y) * cam.z + fcy];
    const at = (px, py) => toScreen(...world(px, py));
    const alpha = v.alpha ?? 1;
    K.layer(alpha, () => {
      g.save();
      K.rr(F[0], F[1], F[2], F[3], FR); g.clip();
      g.save();
      g.translate(fcx, fcy); g.scale(cam.z, cam.z); g.translate(-cam.x, -cam.y);
      if (v.chrome !== 'none') K.win(x, y, w, H, { kind: v.chrome === 'browser' ? 'browser' : v.kind || 'notepad', title: v.title, titleSize: 26, url: v.chrome === 'browser' ? hostOf(v.url) : undefined, compact: true, fill: C.code });
      else K.card(x, y, w, H, { r: 14, fill: C.code });
      g.save(); K.rr(x, y, w, H, 14); g.clip();
      g.fillStyle = C.code; g.fillRect(x, y + bar, w, ch);
      v.draw(dx, dy, dw, dh);
      g.restore();
      g.restore();
      // callouts: a box drawn round part of the screen, a label beside it (screen space, so type keeps its size)
      (v.callouts || []).forEach((co) => {
        const until = co.until ?? co.at + (co.dur ?? 2.8);
        const kIn = K.io(t, co.at, 0.7, 'out'), kOut = K.io(t, until, 0.5, 'in'), k = kIn * (1 - kOut);
        if (k <= 0.002) return;
        const pad = co.pad ?? 10;
        const [ax, ay] = at(co.box[0], co.box[1]), [bx, by] = at(co.box[0] + co.box[2], co.box[1] + co.box[3]);
        const rx = ax - pad, ry = ay - pad, rw = bx - ax + pad * 2, rh = by - ay + pad * 2;
        if (co.dim !== false) {
          g.save(); g.beginPath(); g.rect(F[0], F[1], F[2], F[3]); g.roundRect(rx, ry, rw, rh, 14);
          g.fillStyle = K.rgba(C.page, (co.dim ?? 0.42) * k); g.fill('evenodd'); g.restore();
        }
        g.save(); g.globalAlpha *= 1 - kOut;
        const per = 2 * (rw + rh);
        g.setLineDash([per * kIn, per]); g.lineWidth = 4; g.strokeStyle = C.head; g.lineCap = 'round';
        g.shadowColor = K.rgba(C.head, 0.55); g.shadowBlur = 18;
        K.rr(rx, ry, rw, rh, 14); g.stroke(); g.restore();
        if (co.text) {
          const size = co.size || 30, tw = K.measure(co.text, { font: 'ui', size, weight: 700 }), pw = tw + size * 1.4, ph = size * 1.9;
          const below = co.side === 'bottom' || (co.side !== 'top' && ry - ph - 16 < Math.max(F[1] + 12, 120));
          let lx = K.clamp(rx + (co.align === 'center' ? rw / 2 - pw / 2 : 0), F[0] + 24, F[0] + F[2] - pw - 24);
          const ly = below ? ry + rh + 14 : ry - ph - 14;
          const kl = K.io(t, co.at + 0.25, 0.5, 'out') * (1 - kOut);
          K.layer(kl, () => {
            g.save(); g.translate(0, (1 - kl) * (below ? -10 : 10));
            K.card(lx, ly, pw, ph, { r: ph / 2, fill: C.tile, stroke: C.head, shadow: true });
            K.text(co.text, lx + pw / 2, ly + ph / 2 + size * 0.35, { font: 'ui', size, weight: 700, color: C.strong, align: 'center' });
            g.restore();
          });
        }
      });
      // typing chip: what is being typed, under (or over) the field, only while the field's own text is too small to
      // read on screen (its recorded font size, else about 45 % of the field's height, times the camera's zoom; under
      // about 24 px): once the camera has zoomed in on
      // the field the real text is legible and a chip would only repeat it in another font, so it fades out
      (v.chips || []).forEach((cp) => {
        const textPx = cp.fontPx ? cp.fontPx * s0 * cam.z : cp.box ? cp.box[3] * s0 * cam.z * (v.fieldText ?? 0.45) : 0;
        const small = cp.fontPx || cp.box ? K.clamp((26 - textPx) / 4) : 1;
        const k = small * K.io(t, cp.t0 - 0.15, 0.35, 'out') * (1 - K.io(t, cp.until ?? cp.t1 + 1.0, 0.45, 'in'));
        if (k <= 0.002 || !cp.text) return;
        const size = 32, tw = K.measure(cp.text, { font: 'mono', size }), pw = Math.max(220, tw + 76), ph = 64;
        let cx, cy;
        if (cp.box) { const [ax, ay] = at(cp.box[0], cp.box[1]), [bx, by] = at(cp.box[0] + cp.box[2], cp.box[1] + cp.box[3]); cx = (ax + bx) / 2; cy = by + 30; if (cy + ph > Math.min(F[1] + F[3], 930) - 10) cy = ay - ph - 30; }
        else { cx = F[0] + F[2] / 2; cy = Math.min(F[1] + F[3], 930) - ph - 30; }
        const lx = K.clamp(cx - pw / 2, F[0] + 24, F[0] + F[2] - pw - 24);
        K.layer(k, () => {
          K.card(lx, cy, pw, ph, { r: 16, fill: K.rgba('#0B0C17', 0.94), stroke: C.head, shadow: true });
          const ex = lx + 38 + K.text(cp.text, lx + 38, cy + ph / 2 + 11, { font: 'mono', size, color: C.strong });
          if (cp.typing ? cp.typing(t) || K.caretOn(t) : K.caretOn(t)) { g.save(); g.fillStyle = C.head; g.fillRect(ex + 3, cy + 16, 3, ph - 32); g.restore(); }
        });
      });
      // ripples and the pointer
      const cs = (v.cursorScale ?? 1) * cam.z * s0;
      // pressed keys: chips beside the pointer for a moment (where the eye already is), flipped to its left or above
      // it near the frame's edge; with no pointer, at the bottom of the frame
      const anchor = v.cursor || v.pointer;
      (v.presses || []).forEach((p) => {
        const k = K.io(t, p.t - 0.05, 0.25, 'out') * (1 - K.io(t, p.t + 1.1, 0.4, 'in'));
        if (k <= 0.002) return;
        const size = 28, kw = keysWidth(p.key, size), kh = size * 1.6;
        if (!anchor) { K.keys(p.key, fcx, Math.min(F[1] + F[3], 930) - 70 - (1 - k) * 12, { size, alpha: k }); return; }
        const [px, py] = at(anchor.x, anchor.y), off = Math.max(20, 26 * cs);
        let lx = px + off, ly = py + off * 1.6 + kh / 2;
        if (lx + kw > F[0] + F[2] - 20) lx = px - off - kw;
        if (ly + kh / 2 > Math.min(F[1] + F[3], 1056) - 12) ly = py - off - kh / 2;
        K.keys(p.key, K.clamp(lx, F[0] + 20, F[0] + F[2] - 20 - kw), ly + (1 - k) * 8, { size, align: 'left', alpha: k });
      });
      (v.ripples || []).forEach((r) => {
        const k = K.seg(t, r.t, r.t + 0.65);
        if (k <= 0 || k >= 1) return;
        const [px, py] = at(r.x, r.y);
        g.save(); g.fillStyle = K.rgba(C.head, 0.26 * (1 - K.ease.in(k))); g.beginPath(); g.arc(px, py, Math.max(0.7, cs * 0.8) * (10 + 26 * K.ease.out(k)), 0, 7); g.fill();
        g.strokeStyle = K.rgba(C.head, 0.9 * (1 - k)); g.lineWidth = 3; g.beginPath(); g.arc(px, py, Math.max(0.7, cs * 0.8) * (8 + 34 * K.ease.out(k)), 0, 7); g.stroke(); g.restore();
      });
      if (v.cursor) {
        const [px, py] = at(v.cursor.x, v.cursor.y);
        K.cursor(px, py, { s: cs * (v.cursorPx ?? 34) / 40, kind: v.cursor.kind, press: v.cursor.press, alpha: v.cursor.alpha ?? 1 });
      }
      g.restore();
      // zoomed in, the stage's edge gets a hairline so the recording reads as a screen, not a crop
      const ke = K.clamp((cam.z - 1) / 0.25);
      if (ke > 0.01 && v.frameLine !== false) { g.save(); g.lineWidth = 1.5; g.strokeStyle = K.rgba(C.line2, ke); K.rr(F[0], F[1], F[2], F[3], FR); g.stroke(); g.restore(); }
    });
    return { cam, at, world, rect: [x, y, w, H], content: [dx, dy, dw, dh] };
  };
  const pressOf = (clicks, t) => clicks.reduce((m, c) => Math.max(m, K.clamp(1 - Math.abs(t - c - 0.04) / 0.12)), 0);

  /**
   * play capture `name` (a browser or desktop recording; a terminal capture is handed to K.termReplay) at capture
   * time t (seconds into the recording: pass t - S.cue('go')), inside window chrome at rect [x, y, w, h?] (h left
   * out = the recording's own aspect plus the 50 px bar). The pointer is drawn from events.json (smoothed, with click
   * ripples, the hand over links), typed text shows in a chip under its field, pressed keys as key chips, and the
   * camera eases toward every click and typing target and back out (Screen Studio style).
   * o: {zoom: 1.8 (max zoom), follow: true (false = no automatic camera), zooms: [...] (scripted camera instead,
   * as K.shot), lead 1.25 / hold 1.1 / join 2.6 / camD 1.15 (camera timing, s), callouts: [{at, until | dur, box:
   * [x, y, w, h] (source px), text, side: 'top'|'bottom', dim: 0.42 | false, zoom: true | z}], chrome: 'browser'
   * (default for browser captures) | 'window' | 'none', url / title (default from the recording), frame: [x, y, w, h]
   * (the stage the zoom may fill; default a rounded panel x 24-1896, y 120-1056, under the badge band), cursor: true
   * (default false for desktop captures whose video has the OS pointer), cursorScale, chips: true (a typing chip
   * shows only while the field's own text is too small to read), keys: true (key chips beside the pointer),
   * minHold: 0.6 (a zoom that cannot hold still that long is left out), fieldText: 0.45, alpha}
   * Returns {cam, at(px, py) -> screen point of a source pixel, rect, content} (null when the capture is missing).
   */
  K.demo = (name, t, rect, o = {}) => {
    const c = K.capture(name);
    const [x, y, w, h] = rectArgs(rect);
    if (!c) {
      warnOnce('cap:' + name, `K.demo: no capture '${name}' (declare it in lesson.js captures: {} and record it with tools/capture.py)`);
      mediaPlaceholder(name, 'capture', x, y, w, h ?? w * 9 / 16 + 50, o);
      return null;
    }
    if (c.kind === 'terminal') {
      const r = K.win(x, y, w, h ?? 620, { kind: 'terminal', title: o.title ?? 'Terminal', titleSize: 26, alpha: o.alpha, focus: o.focus });
      K.termReplay(r, t, name, o);
      return { rect: [x, y, w, h ?? 620], content: [r.x, r.y, r.w, r.h] };
    }
    const nav = capNav(c, t), [cx, cy] = capPos(c, t);
    const showPointer = o.cursor ?? !c.cursorInVideo;
    const clickTimes = c.clicks.map((e) => e.t);
    return screenView({
      t, rect, size: c.size, frame: o.frame, alpha: o.alpha, cursorScale: o.cursorScale,
      chrome: o.chrome || (c.kind === 'browser' ? 'browser' : 'none'), kind: o.kind,
      url: o.url ?? (nav && nav.url), title: o.title ?? (nav && nav.title),
      keys: autoCam(c, o),
      draw: (dx, dy, dw, dh) => K.video(capVideo(name), t, dx, dy, dw, dh, { r: 0 }),
      cursor: showPointer ? { x: cx, y: cy, kind: capShape(c, t), press: pressOf(clickTimes, t) } : null,
      pointer: { x: cx, y: cy }, fieldText: o.fieldText,
      cursorPx: c.kind === 'browser' ? 22 * (c.dpr || 1) : 32,
      ripples: c.clicks.map((e) => ({ t: e.t, x: e.x, y: e.y })),
      chips: o.chips === false ? [] : c.types.map((e) => {
        const ks = e.keys || [], t1 = e.t1 ?? e.t;
        // the chip leaves 1 s after the last key, or as the page changes (a load or a scroll), whichever is first
        const brk = c.navs.concat(c.scrolls).map((n) => n.t).filter((x) => x > t1).sort((a, b) => a - b)[0];
        return { t0: ks.length ? ks[0][0] : e.t, t1, until: Math.min(t1 + 1.0, brk != null ? brk - 0.3 : Infinity), box: e.box, fontPx: e.fontPx, text: ks.filter((kk) => kk[0] <= t).map((kk) => kk[1]).join('') || '',
          typing: (tt) => ks.length && tt >= ks[0][0] && tt <= ks[ks.length - 1][0] + 0.15 };
      }),
      presses: o.keys === false ? [] : c.presses.map((e) => ({ t: e.t, key: e.key })),
      callouts: o.callouts,
    });
  };

  /**
   * a real still screenshot "in use": window chrome round image `name` (images:{} or a capture's shot,
   * '<capture>/<shot>'), a scripted pointer, clicks, camera zooms and callouts. t is the shot's own clock.
   * o: {cursor: [{at, x, y, click: true, kind: 'hand'|'text'|'arrow', move: s}] (source px; `at` = when the
   * pointer arrives; it travels there over `move` seconds, default by distance; the first entry is where it starts),
   * zooms: [{at, until, box: [x, y, w, h] | x, y, z}] (default: the automatic camera on the clicks), zoom: 1.8,
   * follow, typing: [{at, text, box, cps: 14}], keys: [{at, key}], callouts (as K.demo), swap: [{at, name, d: 0.3}]
   * (crossfade to the next screenshot at `at`, in the same chrome and camera; the address pill takes that shot's
   * URL: what a click opens, ~0.25 s after it), chrome: 'browser' (default) | 'window' | 'none', url, title, frame,
   * alpha, cursorScale}. Returns what K.demo returns.
   */
  K.shot = (name, t, rect, o = {}) => {
    const im = K.img[name];
    const [x, y, w, h] = rectArgs(rect);
    if (!im) {
      warnOnce('shot:' + name, `K.shot: no image '${name}' (images: {} or a capture's shot '<capture>/<shot>')`);
      mediaPlaceholder(name, 'screenshot', x, y, w, h ?? w * 9 / 16 + 50, o);
      return null;
    }
    const size = [im.naturalWidth || im.width, im.naturalHeight || im.height];
    const shotOf = (nm) => { const [cn, sn] = String(nm).split('/'); return K.cap[cn] && K.cap[cn].shots ? K.cap[cn].shots.find((s) => s.name === sn) || null : null; };
    let shot = shotOf(name);
    // swaps: the pictures on show now (the newest one that has fully faded in, and any fading in over it)
    const layers = [{ im, k: 1 }];
    (o.swap || []).slice().sort((a, b) => a.at - b.at).forEach((sw) => {
      const k = K.io(t, sw.at, sw.d ?? 0.3, 'io'), sim = K.img[sw.name];
      if (!sim) { warnOnce('shot:' + sw.name, `K.shot: no image '${sw.name}' to swap to`); return; }
      if (k <= 0) return;
      if (k >= 1) layers.length = 0;
      layers.push({ im: sim, k });
      if (k >= 0.5) shot = shotOf(sw.name) || { url: sw.url, title: sw.title };
    });
    // the scripted pointer: waypoints, eased (minimum-jerk) with a slight arc, like the recorder's own moves
    const wp = (o.cursor || []).slice().sort((a, b) => a.at - b.at);
    let pos = null, kind = 'arrow';
    if (wp.length) {
      pos = [wp[0].x, wp[0].y]; kind = wp[0].kind || 'arrow';
      for (let i = 1; i < wp.length; i++) {
        const a = wp[i - 1], b = wp[i], dist = Math.hypot(b.x - a.x, b.y - a.y);
        const md = b.move ?? K.clamp(0.4 + dist * 0.00055, 0.45, 1.3), t0 = Math.max(a.at + 0.05, b.at - md);
        if (t < t0) break;
        const u = K.clamp((t - t0) / Math.max(0.01, b.at - t0)), e = u * u * u * (10 - 15 * u + 6 * u * u);
        const arc = Math.sin(Math.PI * e) * Math.min(60, dist * 0.08) * (i % 2 ? 1 : -1), nx = -(b.y - a.y) / (dist || 1), ny = (b.x - a.x) / (dist || 1);
        pos = [K.lerp(a.x, b.x, e) + nx * arc, K.lerp(a.y, b.y, e) + ny * arc];
        if (t >= b.at - 0.12) kind = b.kind || 'arrow';
      }
    }
    const clicks = wp.filter((p) => p.click).map((p) => ({ t: p.at + (p.clickDelay ?? 0.18), x: p.x, y: p.y }));
    const types = (o.typing || []).map((ty) => ({ ...ty, t1: ty.at + ty.text.length / (ty.cps || 14) }));
    const pseudo = { size, clicks: clicks.map((c) => ({ ...c, t1: c.t })), types: types.map((ty) => ({ t: ty.at, t1: ty.t1, box: ty.box, x: ty.box ? ty.box[0] : 0, y: ty.box ? ty.box[1] : 0, keys: [[ty.at, '']] })), scrolls: [], navs: [], drags: [], camMemo: {} };
    if (!K.shot.memo) K.shot.memo = {};
    // keyed on everything the camera depends on (camKey), never only some of it: two scenes that show one shot with
    // the same pointer but different zoom callouts must not share a camera (render workers seek out of order)
    const mk = name + JSON.stringify([o.cursor, o.typing]) + camKey(o);
    const keys = K.shot.memo[mk] || (K.shot.memo[mk] = autoCam(pseudo, o));
    return screenView({
      t, rect, size, frame: o.frame, alpha: o.alpha, cursorScale: o.cursorScale,
      chrome: o.chrome || 'browser', url: o.url ?? (shot && shot.url) ?? '', title: o.title ?? (shot && shot.title), kind: o.kind,
      keys,
      draw: (dx, dy, dw, dh) => {
        g.save(); g.imageSmoothingQuality = 'high';
        const a0 = g.globalAlpha;
        layers.forEach((l) => {
          // a swapped-in picture of another size is fitted (contained) into the same box
          const iw = l.im.naturalWidth || l.im.width, ih = l.im.naturalHeight || l.im.height, f = Math.min(dw / iw, dh / ih);
          g.globalAlpha = a0 * l.k; g.drawImage(l.im, dx + (dw - iw * f) / 2, dy + (dh - ih * f) / 2, iw * f, ih * f);
        });
        g.restore();
      },
      pointer: pos ? { x: pos[0], y: pos[1] } : null,
      cursor: pos ? { x: pos[0], y: pos[1], kind, press: pressOf(clicks.map((c) => c.t), t), alpha: o.cursorAlpha } : null,
      cursorPx: o.cursorPx ?? Math.max(22, size[0] / 1280 * 22),
      ripples: clicks,
      chips: types.map((ty) => ({ t0: ty.at, t1: ty.t1, box: ty.box, text: K.typed(ty.text, t, ty.at, ty.cps || 14), typing: (tt) => tt >= ty.at && tt <= ty.t1 })),
      presses: (o.keys || []).map((p) => ({ t: p.at, key: p.key })),
      callouts: o.callouts,
    });
  };

  // --- terminal replay: the real commands typed at a human pace, their real output at its real timing
  const termSchedule = (c, o = {}) => {
    const key = JSON.stringify([o.start, o.cps, o.gap, o.think, o.maxWait, o.speed, o.seed, o.only]);
    c.termMemo = c.termMemo || {};
    if (c.termMemo[key]) return c.termMemo[key];
    const rng = K.rng(o.seed ?? 5), cps = o.cps ?? 15, gap = o.gap ?? 1.0, maxWait = o.maxWait ?? 1.5, speed = o.speed ?? 1;
    let cur = o.start ?? 0.6;
    const items = [];
    const cmds = o.only ? c.commands.filter((_, i) => o.only.includes(i)) : c.commands;
    cmds.forEach((cm) => {
      const keys = [];
      let tt = cur;
      for (const ch of cm.cmd) { keys.push(tt); tt += (0.55 + 0.9 * rng()) / cps + (ch === ' ' ? 0.07 : 0); }
      const enter = tt + (o.think ?? 0.35);
      let last = enter;
      const out = (cm.out || []).map(([dt, s, n]) => { const at = enter + Math.min(dt / speed, maxWait); last = Math.max(last, at); return { at, s, n }; });
      const done = Math.max(last, enter + Math.min((cm.dur || 0) / speed, maxWait));
      items.push({ cmd: cm.cmd, prompt: cm.prompt, exit: cm.exit, start: cur, keys, typed: tt, enter, out, done });
      cur = done + gap;
    });
    const res = { items, dur: (items.length ? items[items.length - 1].done : 0) + 0.8 };
    c.termMemo[key] = res;
    return res;
  };
  /** the times of a terminal replay (same o as K.termReplay): {dur, items: [{cmd, start, typed, enter, done, out:
   *  [{at, s}]}]}, to hang callouts or narration beats on a command */
  K.termTimes = (name, o = {}) => { const c = K.capture(name); return c && c.kind === 'terminal' ? termSchedule(c, o) : { dur: 0, items: [] }; };
  /**
   * replay terminal capture `name` inside rect (a K.win content rect) at capture time t: each real command is typed
   * at a human pace (o.cps 15, deterministic jitter), Enter, then its real output lines at their real delays (each
   * capped at o.maxWait 1.5 s), a fresh prompt, o.gap (1.0 s) before the next. Keeps the newest lines in view and
   * wraps long lines like a real terminal. o: {size: 30, lh, pad: 30, start: 0.6, cps, gap, think: 0.35, maxWait,
   * speed (output timing divisor), only: [command indexes], blank (empty line before each new prompt; default
   * true for cmd), errColor, idle: true (the waiting prompt with its caret)}. Returns K.termTimes(name, o).
   */
  K.termReplay = (rect, t, name, o = {}) => {
    const c = K.capture(name);
    const r = Array.isArray(rect) ? { x: rect[0], y: rect[1], w: rect[2], h: rect[3] } : rect;
    if (!c || c.kind !== 'terminal') {
      warnOnce('term:' + name, `K.termReplay: no terminal capture '${name}'`);
      K.text(`terminal capture missing: ${name}`, r.x + 30, r.y + 60, { font: 'mono', size: 26, color: C.accent, alpha: o.alpha });
      return { dur: 0, items: [] };
    }
    const sch = termSchedule(c, o);
    // everything (rows, caret, marks) at o.alpha, so a window fading in never shows its text ahead of its frame
    K.layer(o.alpha ?? 1, () => drawTerm(c, sch, r, t, o));
    return sch;
  };
  const drawTerm = (c, sch, r, t, o) => {
    const size = o.size || 30, lh = o.lh || size * 1.45, pad = o.pad ?? 30;
    const cw = K.measure('M', { font: 'mono', size }), cols = Math.max(10, Math.floor((r.w - pad * 2) / cw));
    const blank = o.blank ?? (c.shell === 'cmd');
    const rows = [];
    const wrap = (parts) => {   // parts: [{s, color}] -> rows of at most `cols` characters
      let row = [], n = 0;
      parts.forEach((p) => {
        let s = p.s;
        while (s.length) {
          const take = s.slice(0, cols - n);
          row.push({ s: take, color: p.color }); n += take.length; s = s.slice(take.length);
          if (n >= cols && s.length) { rows.push(row); row = []; n = 0; }
        }
      });
      rows.push(row);
    };
    let caretRow = -1, typingNow = false;
    sch.items.forEach((it, i) => {
      const shownFrom = i === 0 ? -Infinity : sch.items[i - 1].done;
      if (t < shownFrom) return;
      if (blank && i > 0) rows.push([]);
      const n = it.keys.filter((k) => k <= t).length;
      wrap([{ s: it.prompt, color: C.head }, { s: it.cmd.slice(0, n), color: C.strong }]);
      if (t < it.enter) { caretRow = rows.length - 1; typingNow = n > 0 && n < it.cmd.length; return; }
      it.out.forEach((ln) => { if (ln.at <= t) wrap([{ s: ln.s, color: ln.n === 'err' ? (o.errColor || C.body) : C.body }]); });
    });
    const lastIt = sch.items[sch.items.length - 1];
    if (lastIt && t >= lastIt.done && o.idle !== false) {
      if (blank) rows.push([]);
      wrap([{ s: lastIt.prompt, color: C.head }]);
      caretRow = rows.length - 1;
    }
    const maxRows = Math.max(1, Math.floor((r.h - pad * 2 + (lh - size)) / lh));
    const first = Math.max(0, rows.length - maxRows);
    const shown = rows.slice(first);
    shown.forEach((row, i) => {
      const yy = r.y + pad + size * 0.85 + i * lh;
      let xx = r.x + pad;
      row.forEach((p) => { xx += K.text(p.s, xx, yy, { font: 'mono', size, color: p.color }); });
      if (first + i === caretRow && (typingNow || K.caretOn(t))) { g.save(); g.fillStyle = C.strong; g.fillRect(xx + 3, yy - size * 0.8, size * 0.55, size * 0.98); g.restore(); }
    });
    // o.marks: [{at, until | dur, match: 'text' | /regex/, text}] box the newest visible line that matches, with a label
    (o.marks || []).forEach((mk) => {
      const until = mk.until ?? mk.at + (mk.dur ?? 2.8);
      const kIn = K.io(t, mk.at, 0.6, 'out'), kOut = K.io(t, until, 0.45, 'in');
      if (kIn * (1 - kOut) <= 0.002) return;
      let hit = null;
      shown.forEach((row, i) => {
        const s = row.map((p) => p.s).join('');
        const m = mk.match instanceof RegExp ? mk.match.exec(s) : (s.indexOf(mk.match) >= 0 ? { index: s.indexOf(mk.match), 0: mk.match } : null);
        if (m) hit = { i, from: m.index, len: m[0].length, rowLen: s.length };
      });
      if (!hit) return;
      const yy = r.y + pad + size * 0.85 + hit.i * lh;
      const bx = r.x + pad + hit.from * cw - 10, bw = hit.len * cw + 20, by = yy - size * 0.98, bh = size * 1.4;
      g.save(); g.globalAlpha *= 1 - kOut;
      const per = 2 * (bw + bh);
      g.setLineDash([per * kIn, per]); g.lineWidth = 3.5; g.strokeStyle = C.head; g.shadowColor = K.rgba(C.head, 0.5); g.shadowBlur = 14;
      K.rr(bx, by, bw, bh, 10); g.stroke(); g.restore();
      if (mk.text) {
        const ls = 28, tw = K.measure(mk.text, { font: 'ui', size: ls, weight: 700 }), pw = tw + ls * 1.4, ph = ls * 1.9;
        // beside the line when the whole line leaves room, else just under the box (never over the line's own text)
        const endX = r.x + pad + hit.rowLen * cw, right = endX + 28 + pw < r.x + r.w - 16;
        const lx = right ? endX + 28 : K.clamp(bx, r.x + 16, r.x + r.w - pw - 16), ly = right ? by + bh / 2 - ph / 2 : by + bh + 8;
        const kl = K.io(t, mk.at + 0.25, 0.5, 'out') * (1 - kOut);
        K.layer(kl, () => {
          K.card(lx, ly, pw, ph, { r: ph / 2, fill: C.tile, stroke: C.head, shadow: true });
          K.text(mk.text, lx + pw / 2, ly + ph / 2 + ls * 0.35, { font: 'ui', size: ls, weight: 700, color: C.strong, align: 'center' });
        });
      }
    });
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
