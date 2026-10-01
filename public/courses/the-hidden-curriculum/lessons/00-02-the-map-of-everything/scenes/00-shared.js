/* 00.02 The map of everything — shared drawing (window.M)
   The lesson's one recurring object is "the road": five stop-cards in a row, left to right,
     your computer (laptop) → the network (wifi) → the internet (globe) → services (server) → AI (brain)
   joined by short arrows over a faint road band, with the lantern string (AI) hung above when named.
   The road is drawn once and only moves, shrinks, dims or gains layers: every scene draws it with
   M.road(t, {geom}) and morphs between layouts with M.lerpGeom, never with its own card code.
   Only functions and constants: no SCENE() calls. Pure functions of their arguments (no Date.now,
   no Math.random, no state between frames). K.ctx() is read on every call: the runtime swaps canvases. */
(function () {
  'use strict';
  const K = window.K, C = K.C;
  const G = () => K.ctx();
  const lerp = K.lerp;
  const clamp01 = (v) => K.clamp(+v || 0);
  /** number | array | (i) => number  →  (i) => number (with default) */
  const per = (v, d) => (typeof v === 'function' ? (i) => v(i) : Array.isArray(v) ? (i) => (v[i] ?? d) : (i) => (v ?? d));

  // ---------------------------------------------------------------- palette & type
  // One meaning per colour, the whole lesson long:
  //   gold (C.head) = lit / known / AI light / you-are-here pins;  terracotta (C.accent) = a request in
  //   flight (the user's message), a question, an error code;  cream (C.paper) = a reply / paper things;
  //   indigo tiles = the stops themselves. Pink only on 01/09 via K.petals.
  const palette = {
    lit: C.head, ghost: C.line2, stroke: C.line2,
    request: C.accent, reply: C.paper, ink: C.ink,
    label: C.strong, detail: C.soft, quiet: C.quiet,
    band: C.line, bandDash: C.line2,
  };
  const type = {
    label: { font: 'ui', weight: 600, color: C.strong },              // stop names (size from geom)
    detail: { font: 'ui', weight: 400, size: 26, color: C.soft },       // 03 detail lines
    shelfName: { font: 'head', weight: 700, size: 34, color: C.head },  // 05 district names
    shelfRange: { font: 'mono', weight: 600, size: 22, color: C.soft }, // 05 module ranges
  };
  const motion = {
    move: 0.7,          // structural moves (geom morphs, cards lighting)
    light: 0.6,         // a stop lighting up
    arrow: 0.5,         // an arrow drawing between two stops
    travel: 0.6,        // a message crossing one gap (stop to stop)
    bob: { speed: 2.4, amp: 4 },      // pins (matches map.js's pin)
    sway: { speed: 1.1, amp: 0.06 },  // lanterns (matches map.js)
  };

  // ---------------------------------------------------------------- the five stops
  const STOPS = [
    { key: 'computer', label: 'your computer', icon: 'laptop', detail: 'files · folders · terminal' },
    { key: 'network', label: 'the network', icon: 'wifi', detail: 'Wi-Fi · router' },
    { key: 'internet', label: 'the internet', icon: 'globe', detail: 'networks of networks' },
    { key: 'services', label: 'services', icon: 'server', detail: "someone else's computer" },
    { key: 'ai', label: 'AI', icon: 'brain', detail: 'a model, in a service' },
  ];
  const STD_XS = [260, 610, 960, 1310, 1660];

  // ---------------------------------------------------------------- layouts (geoms)
  // A geom is every number the road needs. box/labelA/eyebrowA are 0..1 so geoms morph smoothly.
  const PRESETS = {
    std:     { xs: STD_XS, y: 520, w: 290, h: 210, icon: 72, label: 32, eyebrow: 20, box: 1, labelA: 1, eyebrowA: 1, detailY: 680 },  // 03 04 08
    title:   { xs: [400, 680, 960, 1240, 1520], y: 610, w: 232, h: 168, icon: 58, label: 28, eyebrow: 20, box: 1, labelA: 1, eyebrowA: 1, detailY: 740 }, // 01
    lantern: { xs: STD_XS, y: 560, w: 290, h: 210, icon: 72, label: 32, eyebrow: 20, box: 1, labelA: 1, eyebrowA: 1, detailY: 720 },  // 07
    shelf:   { xs: STD_XS, y: 360, w: 240, h: 150, icon: 56, label: 28, eyebrow: 20, box: 1, labelA: 1, eyebrowA: 0, detailY: 470 },  // 05
    strip:   { xs: STD_XS, y: 220, w: 220, h: 110, icon: 40, label: 26, eyebrow: 20, box: 1, labelA: 1, eyebrowA: 0, detailY: 310 },  // 06
    ribbon:  { xs: [640, 800, 960, 1120, 1280], y: 230, w: 72, h: 72, icon: 44, label: 26, eyebrow: 20, box: 0, labelA: 0, eyebrowA: 0, detailY: 290 }, // 09
  };
  const NUM = ['y', 'w', 'h', 'icon', 'label', 'eyebrow', 'box', 'labelA', 'eyebrowA', 'detailY'];
  /** a geom from a preset name, or a preset name plus overrides: geom('std', {y: 560}) */
  function geom(p = 'std', over = {}) {
    const base = typeof p === 'string' ? PRESETS[p] || PRESETS.std : p;
    const gm = { ...base, ...over, xs: (over.xs || base.xs).slice() };
    gm.cards = gm.xs.map((x, i) => card(gm, i));
    return gm;
  }
  /** morph between two geoms (k 0..1, already eased by you) */
  function lerpGeom(a, b, k) {
    a = typeof a === 'string' ? geom(a) : a; b = typeof b === 'string' ? geom(b) : b;
    k = clamp01(k);
    const gm = { xs: a.xs.map((x, i) => lerp(x, b.xs[i], k)) };
    NUM.forEach((n) => (gm[n] = lerp(a[n], b[n], k)));
    gm.cards = gm.xs.map((x, i) => card(gm, i));
    return gm;
  }
  /** card i's box: centre, edges, and the anchor points scenes hang things on */
  function card(gm, i) {
    const x = gm.xs[i], y = gm.y, w = gm.w, h = gm.h;
    return {
      i, x, y, w, h, l: x - w / 2, r: x + w / 2, t: y - h / 2, b: y + h / 2,
      iconY: y - h * (0.086 + 0.06 * (1 - gm.eyebrowA)), labelY: y + h * 0.333, eyebrowY: y - h * 0.5 + Math.max(24, h * 0.18),
      door: { x: x - w / 2, y },                       // left edge middle: where requests arrive / are checked
      counter: { x: x - w / 2, y: y + h * 0.38 },      // lower-left edge: the A P I side counter
      roof: { x, y: y - h / 2 },                       // top edge centre: pins, pills, MCP
      park: { x: x + w / 2 - 34, y: y - h / 2 + 30 },  // top-right inside corner: a message resting at a stop
    };
  }
  /** point on the road's centre line; u is a float stop index 0..4 (1.5 = halfway from stop 2 to 3) */
  function along(gm, u, dy = 0) {
    const n = gm.xs.length - 1, uu = K.clamp(u, 0, n), i = Math.min(n - 1, Math.floor(uu)), f = uu - i;
    return { x: lerp(gm.xs[i], gm.xs[i + 1], f), y: gm.y + dy };
  }
  /** arrow endpoints between stop i and i+1 (just outside the card edges) */
  function gap(gm, i) {
    const a = gm.cards[i], b = gm.cards[i + 1];
    const pad = gm.box > 0.5 ? 8 : gm.icon * 0.7;
    const x1 = gm.box > 0.5 ? a.r + pad : a.x + pad, x2 = gm.box > 0.5 ? b.l - pad : b.x - pad;
    return { x1, x2, y: gm.y };
  }

  // ---------------------------------------------------------------- the AI stop's glyph
  /** a line-drawn brain (two lobes, a centre fissure, three folds) in the kit's icon style.
   *  Used for stop 5 instead of K.icon('brain'), which reads as a clover at small sizes.  o: {color, alpha, w} */
  function brain(x, y, s, o = {}) {
    const g = G();
    K.layer(o.alpha ?? 1, () => {
      g.save(); g.translate(x, y); g.strokeStyle = o.color || C.strong; g.lineWidth = o.w || Math.max(2, s * 0.06);
      g.lineCap = 'round'; g.lineJoin = 'round';
      for (const sx of [-1, 1]) {
        g.save(); g.scale(sx, 1);
        g.beginPath();
        g.moveTo(s * 0.03, -s * 0.33);
        g.bezierCurveTo(s * 0.16, -s * 0.42, s * 0.33, -s * 0.36, s * 0.34, -s * 0.2);
        g.bezierCurveTo(s * 0.46, -s * 0.12, s * 0.45, s * 0.08, s * 0.36, s * 0.14);
        g.bezierCurveTo(s * 0.36, s * 0.3, s * 0.2, s * 0.37, s * 0.08, s * 0.3);
        g.quadraticCurveTo(s * 0.04, s * 0.34, s * 0.03, s * 0.36);
        g.stroke();
        g.beginPath(); g.moveTo(s * 0.14, -s * 0.2); g.quadraticCurveTo(s * 0.24, -s * 0.14, s * 0.2, -s * 0.03); g.stroke();
        g.beginPath(); g.moveTo(s * 0.34, s * 0.0); g.quadraticCurveTo(s * 0.22, s * 0.04, s * 0.18, s * 0.16); g.stroke();
        g.restore();
      }
      g.beginPath(); g.moveTo(0, -s * 0.33); g.lineTo(0, s * 0.36); g.stroke();
      g.restore();
    });
  }

  // ---------------------------------------------------------------- drawing: one stop
  /**
   * stop i of geom gm.  o: {lit 0..1, ghost (content alpha when unlit, default .15), glow 0..1 extra,
   *   pulse 0..1 (adds a soft gold bloom; use M.bump), iconDx, iconDy, alpha, eyebrow (bool, default by geom)}
   */
  function stop(gm, i, o = {}) {
    const g = G(), c = gm.cards[i], s = STOPS[i];
    const lit = clamp01(o.lit ?? 1), pulse = clamp01(o.pulse), ghost = o.ghost ?? 0.15;
    const content = lerp(ghost, 1, lit);
    K.layer(o.alpha ?? 1, () => {
      // lamp light behind a lit stop: warm, wide, faint (a window lit at night)
      if (lit > 0 || pulse > 0) K.glow(c.x, c.iconY, Math.max(c.w, c.h) * (0.75 + 0.25 * pulse), C.head, 0.10 * lit + 0.16 * pulse);
      if (gm.box > 0.01) {
        K.layer(gm.box, () => {
          // unlit: a dashed hairline outline on an almost-clear tile, so the road's shape reads calm
          K.card(c.l, c.t, c.w, c.h, {
            fill: K.rgba(C.tile, lerp(0.25, 1, lit)), stroke: false, shadow: lit > 0.3,
          });
          g.save();
          g.lineWidth = 1.5 + 0.5 * lit;
          g.strokeStyle = K.mixColor(C.line2, C.head, 0.8 * lit + 0.2 * pulse);
          g.globalAlpha *= lerp(0.55, 1, lit);
          if (lit < 0.5) g.setLineDash([6, 7]);
          if (lit + pulse + (o.glow || 0) > 0) { g.shadowColor = K.rgba(C.head, 0.5 * Math.min(1, lit * 0.7 + pulse + (o.glow || 0))); g.shadowBlur = 36; }
          K.rr(c.l, c.t, c.w, c.h, Math.min(24, c.h * 0.22)); g.stroke();
          g.restore();
        });
      }
      const ix = c.x + (o.iconDx || 0), iy = (gm.box > 0.01 || gm.labelA > 0.01 ? c.iconY : c.y) + (o.iconDy || 0);
      const iy2 = lerp(c.y, iy, Math.max(gm.box, gm.labelA));
      const ic = { color: K.mixColor(C.soft, C.head, lit), alpha: lerp(ghost * 1.6, 1, lit), w: Math.max(2.2, gm.icon * 0.05) };
      if (s.icon === 'brain') brain(ix, iy2, gm.icon, ic); else K.icon(s.icon, ix, iy2, gm.icon, ic);
      if (gm.labelA > 0.01) K.text(s.label, c.x, c.labelY, { ...type.label, size: gm.label, align: 'center', alpha: gm.labelA * lerp(ghost * 2, 1, lit) });
      const ebA = (o.eyebrow ?? true) ? gm.eyebrowA : 0;
      if (ebA > 0.01) K.eyebrow('Stop ' + (i + 1), c.x, c.eyebrowY, { size: gm.eyebrow, align: 'center', tracking: 3, alpha: ebA * content, color: K.mixColor(C.soft, C.gold, lit) });
    });
  }

  // ---------------------------------------------------------------- drawing: the road
  /**
   * the whole road.  o: {geom (or preset name; default 'std'), lit, arrows, pulse, ghost, alpha, cardAlpha,
   *   arrowAlpha, band 0..1 (faint lane behind the cards; default 1), iconDx, eyebrow}
   * lit / arrows / pulse / cardAlpha / arrowAlpha / iconDx accept a number, an array or (i) => value.
   * arrows(i) is the draw progress of the arrow from stop i to stop i+1 (i = 0..3).
   */
  function road(t, o = {}) {
    const gm = typeof o.geom === 'string' || !o.geom ? geom(o.geom || 'std') : o.geom;
    const lit = per(o.lit, 1), arrows = per(o.arrows, 1), pulse = per(o.pulse, 0);
    const cardA = per(o.cardAlpha, 1), arrA = per(o.arrowAlpha, 1), idx = per(o.iconDx, 0);
    K.layer(o.alpha ?? 1, () => {
      // the lane: a soft band through every stop, with a dashed centre line (drawn under the cards)
      const band = clamp01(o.band ?? 1) * K.seg(gm.box, 0.5, 1);
      if (band > 0) {
        const x0 = gm.xs[0], x1 = gm.xs[gm.xs.length - 1];
        const bw = Math.max(10, gm.h * 0.16);
        K.line(x0, gm.y, x1, gm.y, { color: C.line, w: bw, alpha: 0.55, k: band });
        K.line(x0, gm.y, x1, gm.y, { color: C.line2, w: 2, alpha: 0.5, k: band, dash: [10, 14] });
      }
      for (let i = 0; i < gm.xs.length - 1; i++) {
        const k = clamp01(arrows(i)); if (k <= 0) continue;
        const p = gap(gm, i), warm = Math.min(lit(i), lit(i + 1));
        K.arrow(p.x1, p.y, p.x2, p.y, { k, color: K.mixColor(C.line2, C.head, 0.7 * warm), w: Math.max(2.5, gm.h * 0.016), headSize: Math.max(10, gm.h * 0.065), alpha: arrA(i) });
      }
      for (let i = 0; i < gm.xs.length; i++) stop(gm, i, { lit: lit(i), pulse: pulse(i), ghost: o.ghost, alpha: cardA(i), iconDx: idx(i), eyebrow: o.eyebrow });
    });
    return gm;
  }

  // ---------------------------------------------------------------- the lantern string (AI)
  /** cord height at x for a string from x0 to x1 hanging from y with sag px */
  const cordY = (x, x0, x1, y, sag) => y + sag * (1 - Math.pow((2 * (x - x0)) / (x1 - x0) - 1, 2));
  /**
   * five paper lanterns on a cord, one over each stop.  o: {xs (default std), y (cord ends, default 230),
   *   x0, x1 (cord ends; default 160..1760), sag (default 22), s (lantern size, default 44), lit (0..1 | (i)=>),
   *   cord 0..1 (draw progress), alpha}
   * Unlit lanterns are 0.2-alpha ghosts with no glow, like K.map's.
   */
  function lanterns(t, o = {}) {
    const g = G(), xs = o.xs || STD_XS, y = o.y ?? 230, x0 = o.x0 ?? 160, x1 = o.x1 ?? 1760, sag = o.sag ?? 22, s = o.s ?? 44;
    const lit = per(o.lit, 1), ck = clamp01(o.cord ?? 1);
    K.layer(o.alpha ?? 1, () => {
      if (ck > 0) {
        g.save(); g.strokeStyle = C.line2; g.lineWidth = 2; g.lineCap = 'round'; g.beginPath();
        const n = 40;
        for (let j = 0; j <= n * ck; j++) { const x = lerp(x0, x1, j / n); j ? g.lineTo(x, cordY(x, x0, x1, y, sag)) : g.moveTo(x, cordY(x, x0, x1, y, sag)); }
        g.stroke(); g.restore();
      }
      xs.forEach((x, i) => {
        const lk = clamp01(lit(i)), cy = cordY(x, x0, x1, y, sag), sway = K.wave(t, motion.sway.speed, motion.sway.amp, i * 1.7);
        const ly = cy + s * 0.62;
        if (lk > 0) K.glow(x, ly, s * 2.2, C.head, 0.32 * lk);
        K.layer(0.2 + 0.8 * lk, () => K.at(x, cy, 1, sway, () => K.icon('lantern', 0, s * 0.62, s, { color: C.head, w: Math.max(2, s * 0.055) })));
      });
    });
  }
  /** centre of lantern i (for arrows or glows aimed at it) */
  function lanternAt(i, o = {}) {
    const xs = o.xs || STD_XS, y = o.y ?? 230, x0 = o.x0 ?? 160, x1 = o.x1 ?? 1760, sag = o.sag ?? 22, s = o.s ?? 44;
    return { x: xs[i], y: cordY(xs[i], x0, x1, y, sag) + s * 0.62 };
  }

  // ---------------------------------------------------------------- travellers
  /** the user's message in flight: terracotta chat glyph on a round tile.  o: {s (48), alpha, glow 0..1} */
  function message(x, y, o = {}) {
    const s = o.s ?? 48;
    K.layer(o.alpha ?? 1, () => {
      K.glow(x, y, s * 1.3, C.accent, 0.22 + 0.2 * (o.glow || 0));
      K.card(x - s * 0.62, y - s * 0.62, s * 1.24, s * 1.24, { r: s * 0.62, fill: C.tile, stroke: C.accent, shadow: false, lw: 2 });
      K.icon('chat', x, y + s * 0.03, s * 0.9, { color: C.accent, w: Math.max(2.4, s * 0.06) });
    });
  }
  /** the answer coming back: a cream speech bubble with three ink dots.  o: {s (48), alpha} */
  function reply(x, y, o = {}) {
    const g = G(), s = o.s ?? 48, w = s * 1.25, h = s * 0.82;
    K.layer(o.alpha ?? 1, () => {
      K.glow(x, y, s * 1.3, C.paper, 0.14);
      g.save(); g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 24; g.shadowOffsetY = 8;
      g.fillStyle = C.paper; K.rr(x - w / 2, y - h / 2, w, h, h * 0.42); g.fill();
      g.shadowColor = 'transparent';
      g.beginPath(); g.moveTo(x + w * 0.12, y + h * 0.4); g.lineTo(x + w * 0.3, y + h * 0.72); g.lineTo(x + w * 0.32, y + h * 0.36); g.closePath(); g.fill();
      g.fillStyle = C.ink;
      for (let j = -1; j <= 1; j++) { g.beginPath(); g.arc(x + j * s * 0.26, y, s * 0.07, 0, 7); g.fill(); }
      g.restore();
    });
  }
  /** the gold "attention" dot (01): 10 px core in a soft glow.  a = alpha */
  function dot(x, y, a = 1) {
    const g = G();
    K.layer(a, () => { K.glow(x, y, 46, C.head, 0.45); g.save(); g.fillStyle = C.head; g.beginPath(); g.arc(x, y, 10, 0, 7); g.fill(); g.restore(); });
  }

  // ---------------------------------------------------------------- pins, pulses, shelves
  /**
   * gold "you are here" pin that drops onto (x, y) (its tip) at time `at`, then bobs gently.
   * o: {s (40), color (gold), d (.5 drop), alpha}.  No overshoot (save the scene's one 'back' for elsewhere).
   */
  function pin(t, at, x, y, o = {}) {
    const s = o.s ?? 40, k = K.io(t, at, o.d ?? 0.5, 'out');
    if (k <= 0) return;
    const bob = K.wave(t, motion.bob.speed, motion.bob.amp * (s / 44)) * k;
    const py = y - s * 0.38 - (1 - k) * 60 + bob - Math.abs(motion.bob.amp);
    K.layer((o.alpha ?? 1) * k, () => K.icon('pin', x, py, s, { color: o.color || C.head }));
  }
  /** a single gentle swell 0→1→0 over [at, at+d] (pulses; never a flash) */
  const bump = (t, at, d = 0.9) => Math.sin(Math.PI * K.seg(t, at, at + d));
  /** per-stop light-up from a list of times: lit = M.litAt(t, [t1..t5]) */
  const litAt = (t, times, d = motion.light) => (i) => (times[i] == null ? 0 : K.io(t, times[i], d));
  /** detail line under stop i (03): Karla 26 soft, centred.  o: {alpha, y} */
  function detail(gm, i, s, o = {}) {
    K.text(s ?? STOPS[i].detail, gm.cards[i].x, o.y ?? gm.detailY, { ...type.detail, align: 'center', alpha: o.alpha ?? 1 });
  }
  /**
   * a district shelf (05): wide soft card from x0 to x1, top at y; district name (Zen Maru 34 gold,
   * wraps onto two lines when narrow) and module range (mono 22 soft).  o: {alpha, k (rise 0..1),
   * bracket 0..1 (gold stem rising from the shelf top to the road), toY (stem top, default y-40), stemX (default shelf centre), h}
   * returns the shelf's height
   */
  function shelf(x0, x1, y, name, range, o = {}) {
    const w = x1 - x0, lh = 40, fits = K.measure(name, type.shelfName) <= w - 48;
    // too wide: break at ' · ' (dropping the dot), else word-wrap
    const lines = fits ? [name] : name.includes(' · ') ? name.split(' · ') : K.wrap(name, w - 48, type.shelfName);
    const content = lines.length * lh + (range ? 40 : 0) - 6;
    const h = o.h ?? content + 64;
    const top = (h - content) / 2 + 28;  // first baseline below the shelf top (vertically centred)
    const k = clamp01(o.k ?? 1), dy = (1 - k) * 24;
    K.layer((o.alpha ?? 1) * k, () => {
      const bk = clamp01(o.bracket);
      if (bk > 0) {
        // a short gold stem from the shelf's top centre up to the road (o.toY), with a small cap
        const cx = o.stemX ?? x0 + w / 2, top = o.toY ?? y - 40, yy = y + dy, ey = lerp(yy, top, bk);
        K.line(cx, yy, cx, ey, { color: C.head, w: 2.5 });
        K.line(cx - 22 * K.seg(bk, 0.7, 1), ey, cx + 22 * K.seg(bk, 0.7, 1), ey, { color: C.head, w: 2.5 });
      }
      K.card(x0, y + dy, w, h, { alpha: 0.85, r: 22 });
      lines.forEach((ln, j) => K.text(ln, x0 + w / 2, y + dy + top + j * lh, { ...type.shelfName, align: 'center' }));
      if (range) K.text(range, x0 + w / 2, y + dy + top + lines.length * lh + 6, { ...type.shelfRange, align: 'center' });
    });
    return h;
  }

  // ---------------------------------------------------------------- layout constants scenes share
  const layout = {
    safe: { x0: 80, x1: 1840, y0: 130, y1: 930 },
    STD_XS,
    lanternY: { s01: 250, s07: 230, s09: 180 },        // cord heights per scene
    shelves: { rowA: 560, rowB: 760 },                  // 05 shelf tops (rowB 760, not 740: the two-line Machine shelf is 178 tall)
    surprise: { x0: 480, x1: 1440, y0: 380, y1: 820 },  // 06 centre panel
    tray: { x: 510, y: 300, w: 900, h: 420 },           // 08 "later" tray
  };

  window.M = {
    palette, type, motion, layout, STOPS, PRESETS,
    geom, lerpGeom, card, along, gap,
    stop, road, brain, lanterns, lanternAt,
    message, reply, dot, pin, bump, litAt, detail, shelf,
  };
})();
